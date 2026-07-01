import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdfLayout } from '../catalogs/pdf-layout';
import { answersByField } from './json.service';
import { getCityName, getUnitById, getRoomById } from './catalog.service';
import { sanitizeName } from './format';

const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.45, 0.45, 0.45);

// Reemplaza caracteres no soportados por la codificación WinAnsi de las fuentes estándar
// (p. ej. subíndices como ₂ de "CO₂") para evitar que pdf-lib lance excepción al dibujar.
const SUBSCRIPTS = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
function safeText(t) {
  return String(t == null ? '' : t).replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => SUBSCRIPTS[m] || m);
}

// Resuelve el valor a mostrar para una fila del PDF (campo del catálogo o vacío).
function resolveFieldValue(fields, field) {
  if (!field) return '';
  const v = fields[field];
  return v != null ? String(v) : '—';
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// Genera el PDF institucional. Devuelve Uint8Array.
export async function generatePDF(evaluation, user) {
  const doc = await PDFDocument.create();
  const [W, H] = pdfLayout.pageSize;
  const page = doc.addPage([W, H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const M = pdfLayout.margin;

  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const fields = answersByField(evaluation.answers || {});

  let y = H - M;
  const center = (txt, size, f = bold) => {
    const w = f.widthOfTextAtSize(txt, size);
    page.drawText(txt, { x: (W - w) / 2, y, size, font: f, color: BLACK });
  };

  // Encabezado
  center(pdfLayout.title, 18); y -= 20;
  center(pdfLayout.subtitle, 12); y -= 15;
  center(pdfLayout.focus, 10); y -= 22;

  // Borde general superior
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: BLACK });
  y -= 16;

  // Identificación
  const idValues = {
    Unidad: unit ? `${unit.nombre} (ID ${unit.id})` : String(evaluation.unidad),
    Cuarto: room?.nombre || String(evaluation.cuarto),
    Evaluador: user?.nombre || '',
    'Folio Evaluación': evaluation.id,
    Fecha: `${evaluation.fecha}  ${evaluation.hora}`,
  };
  pdfLayout.identification.forEach((label) => {
    page.drawText(safeText(`${label}:`), { x: M, y, size: 9, font: bold, color: BLACK });
    page.drawText(safeText(idValues[label] || ''), { x: M + 95, y, size: 9, font, color: BLACK });
    y -= 14;
  });
  y -= 6;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: BLACK });
  y -= 16;

  // Dos columnas de secciones
  const colW = (W - 2 * M - 16) / 2;
  const colX = [M, M + colW + 16];
  const yCol = [y, y];
  const distribution = [0, 0, 0, 1, 1]; // sección -> columna

  const drawRow = (col, label, value) => {
    const x = colX[col];
    let cy = yCol[col];
    page.drawText(safeText(label), { x, y: cy, size: 8.5, font, color: BLACK });
    const v = safeText(value || '');
    const vw = bold.widthOfTextAtSize(v, 8.5);
    page.drawText(v, { x: x + colW - vw, y: cy, size: 8.5, font: bold, color: BLACK });
    cy -= 6;
    page.drawLine({ start: { x, y: cy }, end: { x: x + colW, y: cy }, thickness: 0.3, color: GRAY });
    yCol[col] = cy - 11;
  };

  pdfLayout.sections.forEach((sec, i) => {
    const col = distribution[i] ?? 0;
    // título de sección
    yCol[col] -= 2;
    page.drawRectangle({ x: colX[col], y: yCol[col] - 2, width: colW, height: 14, color: rgb(0.9, 0.9, 0.9) });
    page.drawText(safeText(sec.title), { x: colX[col] + 4, y: yCol[col] + 1.5, size: 9, font: bold, color: BLACK });
    yCol[col] -= 18;
    sec.rows.forEach((r) => {
      drawRow(col, r.label, resolveFieldValue(fields, r.field));
    });
    yCol[col] -= 6;
  });

  // Observaciones + Sello de la Unidad (misma fila, misma altura)
  const rowTop = Math.min(yCol[0], yCol[1]) - 4;
  const totalW = W - 2 * M;
  const gapOS = 12;
  const obsW = Math.round(totalW * 0.62);
  const sealW = totalW - obsW - gapOS;
  const sealX = M + obsW + gapOS;
  const obsBoxTop = rowTop - 6;
  const obsBoxHeight = 120;

  page.drawText('OBSERVACIONES', { x: M, y: rowTop, size: 10, font: bold, color: BLACK });
  page.drawText(safeText(pdfLayout.sealLabel), { x: sealX, y: rowTop, size: 9, font: bold, color: BLACK });

  page.drawRectangle({ x: M, y: obsBoxTop - obsBoxHeight, width: obsW, height: obsBoxHeight, borderColor: BLACK, borderWidth: 0.6 });
  page.drawRectangle({ x: sealX, y: obsBoxTop - obsBoxHeight, width: sealW, height: obsBoxHeight, borderColor: GRAY, borderWidth: 0.8, borderDashArray: [3, 3] });

  const obsText = (evaluation.observaciones || []).map((o) => `• ${safeText(o.text)}`).join('\n');
  const obsLines = obsText ? obsText.split('\n').flatMap((l) => wrapText(l, font, 9, obsW - 12)) : [];
  let ty = obsBoxTop - 14;
  obsLines.slice(0, 8).forEach((l) => {
    page.drawText(l, { x: M + 6, y: ty, size: 9, font, color: BLACK });
    ty -= 12;
  });

  // Nota legal
  let ly = obsBoxTop - obsBoxHeight - 16;
  page.drawText(safeText(pdfLayout.legalTitle), { x: M, y: ly, size: 8, font: bold, color: BLACK });
  ly -= 11;
  wrapText(safeText(pdfLayout.legalText), font, 7, W - 2 * M).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: 7, font, color: BLACK });
    ly -= 9;
  });
  ly -= 4;
  wrapText(safeText(pdfLayout.legalRef), font, 7, W - 2 * M).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: 7, font: bold, color: BLACK });
    ly -= 9;
  });

  return doc.save();
}

export function pdfFileName(evaluation) {
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const u = sanitizeName(unit?.nombre || evaluation.unidad);
  const r = sanitizeName(room?.nombre || evaluation.cuarto);
  return `Reporte_${evaluation.id}_${u}_${r}.pdf`;
}

// Genera una URL de objeto para previsualización.
export function bytesToBlobURL(bytes, type = 'application/pdf') {
  const blob = new Blob([bytes], { type });
  return URL.createObjectURL(blob);
}
