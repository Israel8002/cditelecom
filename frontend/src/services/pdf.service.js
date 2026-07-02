import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdfLayout } from '../catalogs/pdf-layout';
import { getUnitById, getRoomById, getSections, getAllQuestions, isQuestionVisible } from './catalog.service';
import { sanitizeName } from './format';

const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.45, 0.45, 0.45);
const HEADER_BG = rgb(0.9, 0.9, 0.9);

// Reemplaza caracteres no soportados por la codificación WinAnsi de las fuentes estándar
// (p. ej. subíndices como ₂ de "CO₂") para evitar que pdf-lib lance excepción al dibujar.
const SUBSCRIPTS = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
function safeText(t) {
  return String(t == null ? '' : t).replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => SUBSCRIPTS[m] || m);
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

// Devuelve las preguntas respondidas y visibles agrupadas por sección (sin observaciones).
function answeredBySection(answers) {
  return getSections()
    .map((sec) => ({
      nombre: sec.nombre,
      preguntas: getAllQuestions().filter(
        (q) => q.seccion === sec.id
          && q.id !== 'Q041'
          && isQuestionVisible(q, answers)
          && answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '',
      ),
    }))
    .filter((s) => s.preguntas.length > 0);
}

// Genera el PDF institucional (cuerpo dinámico). Devuelve Uint8Array.
export async function generatePDF(evaluation, user) {
  const doc = await PDFDocument.create();
  const [W, H] = pdfLayout.pageSize;
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const M = pdfLayout.margin;
  const answers = evaluation.answers || {};

  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);

  let page = doc.addPage([W, H]);
  let y = H - M;

  const center = (txt, size, f = bold) => {
    const s = safeText(txt);
    const w = f.widthOfTextAtSize(s, size);
    page.drawText(s, { x: (W - w) / 2, y, size, font: f, color: BLACK });
  };

  // Encabezado
  center(pdfLayout.title, 18); y -= 20;
  center(pdfLayout.subtitle, 12); y -= 15;
  center(pdfLayout.focus, 10); y -= 22;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: BLACK });
  y -= 16;

  // Identificación en 2 columnas (sin marcos ni líneas). La fecha va dentro del sello.
  const idValues = {
    Unidad: unit ? `${unit.nombre} (ID ${unit.id})` : String(evaluation.unidad),
    Cuarto: room?.nombre || String(evaluation.cuarto),
    Evaluador: user?.nombre || '',
    'Folio Evaluación': evaluation.id,
  };
  const halfW = (W - 2 * M) / 2;
  const idCols = [M, M + halfW];
  const drawIdField = (label, x, cy) => {
    if (!label) return;
    const lbl = safeText(`${label}:`);
    page.drawText(lbl, { x, y: cy, size: 9, font: bold, color: BLACK });
    const lw = bold.widthOfTextAtSize(lbl, 9);
    page.drawText(safeText(idValues[label] || ''), { x: x + lw + 5, y: cy, size: 9, font, color: BLACK });
  };
  [['Unidad', 'Cuarto'], ['Evaluador', 'Folio Evaluación']].forEach(([l, r]) => {
    drawIdField(l, idCols[0], y);
    drawIdField(r, idCols[1], y);
    y -= 15;
  });
  y -= 4;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: BLACK });
  y -= 16;

  // ----- Cuerpo dinámico: todas las respuestas visibles, flujo a 2 columnas / multipágina -----
  const footerReserve = 200;
  const contentBottom = M + footerReserve;
  const colGap = 16;
  const colW = (W - 2 * M - colGap) / 2;
  const colX = [M, M + colW + colGap];

  let pageTop = y;
  let cy = y;
  let col = 0;

  const ensure = (h) => {
    if (cy - h < contentBottom) {
      if (col === 0) { col = 1; cy = pageTop; }
      else { page = doc.addPage([W, H]); pageTop = H - M; cy = pageTop; col = 0; }
    }
  };
  const drawSectionHeader = (title) => {
    ensure(19 + 13);
    const x = colX[col];
    page.drawRectangle({ x, y: cy - 12, width: colW, height: 14, color: HEADER_BG });
    page.drawText(safeText(title), { x: x + 4, y: cy - 9, size: 9, font: bold, color: BLACK });
    cy -= 19;
  };
  const drawRow = (label, value) => {
    ensure(13);
    const x = colX[col];
    page.drawText(safeText(label), { x, y: cy, size: 8, font, color: BLACK });
    const v = safeText(value);
    const vw = bold.widthOfTextAtSize(v, 8);
    page.drawText(v, { x: x + colW - vw, y: cy, size: 8, font: bold, color: BLACK });
    page.drawLine({ start: { x, y: cy - 4 }, end: { x: x + colW, y: cy - 4 }, thickness: 0.3, color: GRAY });
    cy -= 13;
  };

  answeredBySection(answers).forEach((sec) => {
    drawSectionHeader(sec.nombre);
    sec.preguntas.forEach((q) => drawRow(q.titulo, String(answers[q.id])));
    cy -= 4;
  });

  // ----- Pie: Observaciones + Sello (misma fila) y nota legal, en la última página -----
  const totalW = W - 2 * M;
  const gapOS = 12;
  const obsW = Math.round(totalW * 0.62);
  const sealW = totalW - obsW - gapOS;
  const sealX = M + obsW + gapOS;
  const obsBoxHeight = 100;
  const obsLabelY = M + footerReserve - 12;
  const obsBoxTop = obsLabelY - 6;
  const obsBoxBottom = obsBoxTop - obsBoxHeight;

  page.drawText('OBSERVACIONES', { x: M, y: obsLabelY, size: 10, font: bold, color: BLACK });
  page.drawText(safeText(pdfLayout.sealLabel), { x: sealX, y: obsLabelY, size: 9, font: bold, color: BLACK });

  page.drawRectangle({ x: M, y: obsBoxBottom, width: obsW, height: obsBoxHeight, borderColor: BLACK, borderWidth: 0.6 });
  page.drawRectangle({ x: sealX, y: obsBoxBottom, width: sealW, height: obsBoxHeight, borderColor: GRAY, borderWidth: 0.8, borderDashArray: [3, 3] });

  const obsText = (evaluation.observaciones || []).map((o) => `• ${safeText(o.text)}`).join('\n');
  const obsLines = obsText ? obsText.split('\n').flatMap((l) => wrapText(l, font, 8, obsW - 12)) : [];
  let ty = obsBoxTop - 13;
  obsLines.slice(0, 6).forEach((l) => {
    page.drawText(l, { x: M + 6, y: ty, size: 8, font, color: BLACK });
    ty -= 12;
  });

  // Fecha centrada al fondo del cuadro del sello.
  const dateStr = safeText(`${evaluation.fecha}   ${evaluation.hora}`);
  const dw = font.widthOfTextAtSize(dateStr, 8);
  page.drawText(dateStr, { x: sealX + (sealW - dw) / 2, y: obsBoxBottom + 8, size: 8, font, color: BLACK });

  // Nota legal
  let ly = obsBoxBottom - 13;
  page.drawText(safeText(pdfLayout.legalTitle), { x: M, y: ly, size: 8, font: bold, color: BLACK });
  ly -= 10;
  wrapText(safeText(pdfLayout.legalText), font, 7, totalW).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: 7, font, color: BLACK });
    ly -= 8.5;
  });
  ly -= 3;
  wrapText(safeText(pdfLayout.legalRef), font, 7, totalW).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: 7, font: bold, color: BLACK });
    ly -= 8.5;
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

export function pdfFotosFileName(evaluation) {
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const u = sanitizeName(unit?.nombre || evaluation.unidad);
  const r = sanitizeName(room?.nombre || evaluation.cuarto);
  return `Reporte_Fotografico_${evaluation.id}_${u}_${r}.pdf`;
}

// Genera el PDF del Reporte Fotográfico. Devuelve Uint8Array.
export async function generatePhotographicPDF(evaluation, user, photos) {
  const doc = await PDFDocument.create();
  const [W, H] = pdfLayout.pageSize;
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const M = pdfLayout.margin;

  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);

  let page = doc.addPage([W, H]);
  let y = H - M;

  const center = (txt, size, f = bold) => {
    const s = safeText(txt);
    const w = f.widthOfTextAtSize(s, size);
    page.drawText(s, { x: (W - w) / 2, y, size, font: f, color: BLACK });
  };

  // Encabezado principal (Página 1)
  center("REPORTE FOTOGRÁFICO", 18); y -= 20;
  center("Telecom - Informática", 12); y -= 15;
  center("Control de Seguridad para Redes de Voz y Datos", 10); y -= 22;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: BLACK });
  y -= 16;

  // Datos de la unidad
  const idValues = {
    Unidad: unit ? `${unit.nombre} (ID ${unit.id})` : String(evaluation.unidad),
    Cuarto: room?.nombre || String(evaluation.cuarto),
    Evaluador: user?.nombre || '',
    'Folio Evaluación': evaluation.id,
    Fecha: `${evaluation.fecha} ${evaluation.hora}`,
  };

  const halfW = (W - 2 * M) / 2;
  const idCols = [M, M + halfW];

  const drawIdField = (label, x, cy) => {
    if (!label) return;
    const lbl = safeText(`${label}:`);
    page.drawText(lbl, { x, y: cy, size: 9, font: bold, color: BLACK });
    const lw = bold.widthOfTextAtSize(lbl, 9);
    page.drawText(safeText(idValues[label] || ''), { x: x + lw + 5, y: cy, size: 9, font, color: BLACK });
  };

  drawIdField('Unidad', idCols[0], y);
  drawIdField('Evaluador', idCols[1], y);
  y -= 15;
  drawIdField('Cuarto', idCols[0], y);
  drawIdField('Folio Evaluación', idCols[1], y);
  y -= 15;
  drawIdField('Fecha', idCols[0], y);
  y -= 15;

  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: BLACK });
  y -= 25; // Espacio antes de empezar las fotos

  if (!photos || photos.length === 0) {
    y -= 50;
    const noPhotosTxt = "No se agregaron fotografías en esta evaluación.";
    const nptw = italic.widthOfTextAtSize(noPhotosTxt, 11);
    page.drawText(noPhotosTxt, { x: (W - nptw) / 2, y, size: 11, font: italic, color: GRAY });
  } else {
    const boxW = 240;
    const boxH = 180;
    const colGap = W - 2 * M - 2 * boxW; // 612 - 80 - 480 = 52 pt

    for (let idx = 0; idx < photos.length; idx++) {
      const p = photos[idx];
      const itemIndexOnPage = idx % 4;
      const col = itemIndexOnPage % 2;
      const row = Math.floor(itemIndexOnPage / 2);
      const isFirstPage = idx < 4;

      // Crear nueva página si toca la primera foto de una página subsecuente
      if (idx > 0 && itemIndexOnPage === 0) {
        page = doc.addPage([W, H]);
        y = H - M;
        // Dibujar mini cabecera
        page.drawText("REPORTE FOTOGRÁFICO", { x: M, y: y - 10, size: 10, font: bold, color: BLACK });
        const folioTxt = safeText(`Folio: ${evaluation.id}`);
        const ftw = font.widthOfTextAtSize(folioTxt, 9);
        page.drawText(folioTxt, { x: W - M - ftw, y: y - 10, size: 9, font, color: BLACK });
        page.drawLine({ start: { x: M, y: y - 16 }, end: { x: W - M, y: y - 16 }, thickness: 0.5, color: GRAY });
      }

      // Calcular posiciones de la celda de la cuadrícula
      const colX = col === 0 ? M : M + boxW + colGap;
      const rowY = isFirstPage
        ? (row === 0 ? H - 175 : H - 175 - 220)
        : (row === 0 ? H - 75 : H - 75 - 220);

      let image = null;
      try {
        const arrayBuffer = await p.blob.arrayBuffer();
        if (p.blob.type === 'image/png') {
          image = await doc.embedPng(arrayBuffer);
        } else {
          image = await doc.embedJpg(arrayBuffer);
        }
      } catch (err) {
        console.error("Error al incrustar la imagen en el PDF:", err);
      }

      if (image) {
        const scale = Math.min(boxW / image.width, boxH / image.height);
        const w = image.width * scale;
        const h = image.height * scale;
        const x = colX + (boxW - w) / 2;
        const yOffset = (boxH - h) / 2;
        
        // Borde gris claro alrededor de la caja
        page.drawRectangle({
          x: colX,
          y: rowY - boxH,
          width: boxW,
          height: boxH,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 0.6
        });
        
        // Dibujar imagen centrada en la caja
        page.drawImage(image, { x, y: rowY - boxH + yOffset, width: w, height: h });
      } else {
        // Dibujar caja de error
        page.drawRectangle({
          x: colX,
          y: rowY - boxH,
          width: boxW,
          height: boxH,
          borderColor: rgb(0.8, 0, 0),
          borderWidth: 0.8,
          color: rgb(0.98, 0.95, 0.95)
        });
        const errTxt = safeText(`Error al cargar: ${p.nombre}`);
        const tw = font.widthOfTextAtSize(errTxt, 8);
        page.drawText(errTxt, { x: colX + (boxW - tw) / 2, y: rowY - (boxH / 2), size: 8, font, color: rgb(0.8, 0, 0) });
      }

      // Dibujar etiqueta abajo con truncamiento inteligente para evitar desbordes
      let labelText = `Foto ${idx + 1}: ${p.nombre}`;
      if (font.widthOfTextAtSize(labelText, 8) > boxW - 10) {
        const extIndex = p.nombre.lastIndexOf('.');
        const ext = extIndex !== -1 ? p.nombre.slice(extIndex) : '';
        const base = extIndex !== -1 ? p.nombre.slice(0, extIndex) : p.nombre;
        let baseLen = base.length;
        while (baseLen > 0 && font.widthOfTextAtSize(`Foto ${idx + 1}: ${base.slice(0, baseLen)}...${ext}`, 8) > boxW - 10) {
          baseLen--;
        }
        labelText = `Foto ${idx + 1}: ${base.slice(0, baseLen)}...${ext}`;
      }

      const lbl = safeText(labelText);
      const lw = font.widthOfTextAtSize(lbl, 8);
      page.drawText(lbl, { x: colX + (boxW - lw) / 2, y: rowY - boxH - 14, size: 8, font, color: BLACK });
    }
  }

  return doc.save();
}

// Genera una URL de objeto para previsualización.
export function bytesToBlobURL(bytes, type = 'application/pdf') {
  const blob = new Blob([bytes], { type });
  return URL.createObjectURL(blob);
}
