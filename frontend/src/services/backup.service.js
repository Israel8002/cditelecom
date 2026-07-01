import { generatePDF, pdfFileName } from './pdf.service';
import { buildEvaluationObject, serializeJSON, jsonFileName } from './json.service';
import { saveBackup, saveEvaluation, getPhotos, getBackupByEvaluation, setConfig } from './storage.service';
import { logEvent, LOG } from './log.service';
import { ESTADO } from '../catalogs/constants';

// Combina el respaldo existente con nuevos campos (permite generar PDF y JSON por separado).
async function upsertBackup(evaluation, patch) {
  const existing = await getBackupByEvaluation(evaluation.id);
  const merged = {
    id: evaluation.id,
    idEvaluacion: evaluation.id,
    estado: 'generado',
    ...(existing || {}),
    ...patch,
    fecha: new Date().toISOString(),
  };
  await saveBackup(merged);
  await saveEvaluation({ ...evaluation, estado: ESTADO.RESPALDADO });
  await setConfig('ultimoRespaldo', new Date().toISOString());
  return merged;
}

// Genera únicamente el PDF y lo almacena localmente.
export async function generatePdf(evaluation, user) {
  const pdfBytes = await generatePDF(evaluation, user);
  const b = await upsertBackup(evaluation, {
    pdf: new Blob([pdfBytes], { type: 'application/pdf' }),
    pdfNombre: pdfFileName(evaluation),
  });
  await logEvent(LOG.PDF, b.pdfNombre);
  return b;
}

// Genera únicamente el JSON y lo almacena localmente.
export async function generateJson(evaluation, user) {
  const photos = await getPhotos(evaluation.id);
  const jsonStr = serializeJSON(buildEvaluationObject(evaluation, user, photos));
  const b = await upsertBackup(evaluation, {
    json: jsonStr,
    jsonNombre: jsonFileName(evaluation),
  });
  await logEvent(LOG.JSON, b.jsonNombre);
  return b;
}

// Genera PDF + JSON (respaldo completo).
export async function generateBackup(evaluation, user) {
  await generatePdf(evaluation, user);
  const b = await generateJson(evaluation, user);
  await logEvent(LOG.RESPALDO, evaluation.id);
  return b;
}

export function downloadBlob(blobOrString, filename, type) {
  const blob = typeof blobOrString === 'string'
    ? new Blob([blobOrString], { type: type || 'application/json' })
    : blobOrString;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareFile(blobOrString, filename, type) {
  const blob = typeof blobOrString === 'string'
    ? new Blob([blobOrString], { type: type || 'application/json' })
    : blobOrString;
  const file = new File([blob], filename, { type: blob.type || type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return true;
  }
  downloadBlob(blob, filename, type);
  return false;
}
