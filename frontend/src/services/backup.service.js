import { generatePDF, pdfFileName } from './pdf.service';
import { buildEvaluationObject, serializeJSON, jsonFileName } from './json.service';
import { saveBackup, saveEvaluation, getPhotos, setConfig } from './storage.service';
import { logEvent, LOG } from './log.service';
import { ESTADO } from '../catalogs/constants';

// Genera PDF + JSON y los almacena localmente. Devuelve el respaldo.
export async function generateBackup(evaluation, user) {
  const photos = await getPhotos(evaluation.id);
  const pdfBytes = await generatePDF(evaluation, user);
  const jsonObj = buildEvaluationObject(evaluation, user, photos);
  const jsonStr = serializeJSON(jsonObj);

  const backup = await saveBackup({
    id: evaluation.id,
    idEvaluacion: evaluation.id,
    pdf: new Blob([pdfBytes], { type: 'application/pdf' }),
    pdfNombre: pdfFileName(evaluation),
    json: jsonStr,
    jsonNombre: jsonFileName(evaluation),
    fecha: new Date().toISOString(),
    estado: 'generado',
  });

  await saveEvaluation({ ...evaluation, estado: ESTADO.RESPALDADO });
  await setConfig('ultimoRespaldo', new Date().toISOString());
  await logEvent(LOG.PDF, `${backup.pdfNombre}`);
  await logEvent(LOG.JSON, `${backup.jsonNombre}`);
  await logEvent(LOG.RESPALDO, evaluation.id);
  return backup;
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
