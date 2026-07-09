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

function drawJustifiedText(page, text, x, y, size, font, maxWidth, color = BLACK) {
  const lines = wrapText(text, font, size, maxWidth);
  let cy = y;
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const words = trimmedLine.split(/\s+/);
    
    if (index < lines.length - 1 && words.length > 1) {
      // Calculate total width of words without space characters
      let wordsWidth = 0;
      words.forEach(w => {
        wordsWidth += font.widthOfTextAtSize(safeText(w), size);
      });
      // Space width for each gap
      const spaceWidth = (maxWidth - wordsWidth) / (words.length - 1);
      
      let cx = x;
      words.forEach(w => {
        const cleanWord = safeText(w);
        page.drawText(cleanWord, { x: cx, y: cy, size, font, color });
        cx += font.widthOfTextAtSize(cleanWord, size) + spaceWidth;
      });
    } else {
      // Last line or single-word line: draw standard spaces
      page.drawText(safeText(trimmedLine), { x, y: cy, size, font, color });
    }
    cy -= 13;
  });
  return cy;
}

// Devuelve las preguntas respondidas y visibles agrupadas por sección (sin observaciones).
function answeredBySection(answers) {
  return getSections()
    .map((sec) => ({
      nombre: sec.nombre,
      preguntas: getAllQuestions().filter(
        (q) => q.seccion === sec.id
          && q.id !== 'Q042'
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

  // ----- Cuerpo dinámico: todas las respuestas visibles, flujo a 2 columnas / forzado a 1 sola página -----
  let rowHeight = 13;
  let headerHeight = 19;
  let spacing = 4;
  let fontSize = 8;
  let sectionFontSize = 9;
  let footerReserve = 200;
  let obsBoxHeight = 100;
  let legalFontSize = 7;
  let legalLineHeight = 8.5;

  let pageTop = y;
  let contentBottom = M + footerReserve;

  // Simulator function to check how many pages are required with current parameters
  const simulateLayout = (rHeight, hHeight, sp, fReserve) => {
    let currentY = pageTop;
    let currentCol = 0;
    let pagesCount = 1;
    const cBottom = M + fReserve;

    const testEnsure = (h) => {
      if (currentY - h < cBottom) {
        if (currentCol === 0) {
          currentCol = 1;
          currentY = pageTop;
        } else {
          pagesCount++;
          currentY = pageTop;
          currentCol = 0;
        }
      }
    };

    const sections = answeredBySection(answers);
    sections.forEach((sec) => {
      testEnsure(hHeight + rHeight);
      currentY -= hHeight;
      sec.preguntas.forEach(() => {
        testEnsure(rHeight);
        currentY -= rHeight;
      });
      currentY -= sp;
    });

    return pagesCount;
  };

  // Shrink parameters dynamically if layout requires more than 1 page
  let pages = simulateLayout(rowHeight, headerHeight, spacing, footerReserve);
  if (pages > 1) {
    // Shrink level 1
    rowHeight = 11.5;
    headerHeight = 17;
    spacing = 2;
    fontSize = 7.5;
    sectionFontSize = 8.5;
    footerReserve = 180;
    obsBoxHeight = 85;
    legalFontSize = 6.5;
    legalLineHeight = 8.0;
    contentBottom = M + footerReserve;
    pages = simulateLayout(rowHeight, headerHeight, spacing, footerReserve);
  }
  if (pages > 1) {
    // Shrink level 2
    rowHeight = 10.2;
    headerHeight = 15;
    spacing = 1;
    fontSize = 7.0;
    sectionFontSize = 8.0;
    footerReserve = 160;
    obsBoxHeight = 75;
    legalFontSize = 6.0;
    legalLineHeight = 7.2;
    contentBottom = M + footerReserve;
    pages = simulateLayout(rowHeight, headerHeight, spacing, footerReserve);
  }
  if (pages > 1) {
    // Shrink level 3 (Maximum shrink)
    rowHeight = 9.2;
    headerHeight = 13;
    spacing = 0;
    fontSize = 6.0;
    sectionFontSize = 7.2;
    footerReserve = 140;
    obsBoxHeight = 60;
    legalFontSize = 5.2;
    legalLineHeight = 6.5;
    contentBottom = M + footerReserve;
  }

  const colGap = 16;
  const colW = (W - 2 * M - colGap) / 2;
  const colX = [M, M + colW + colGap];

  let cy = y;
  let col = 0;

  const ensure = (h) => {
    if (cy - h < contentBottom) {
      if (col === 0) { col = 1; cy = pageTop; }
      // strictly lock to page 1, don't generate page 2
    }
  };
  const drawSectionHeader = (title) => {
    ensure(headerHeight + rowHeight);
    const x = colX[col];
    const boxHeight = Math.max(10, headerHeight - 5);
    page.drawRectangle({ x, y: cy - (boxHeight - 2), width: colW, height: boxHeight, color: HEADER_BG });
    page.drawText(safeText(title), { x: x + 4, y: cy - (boxHeight - 5), size: sectionFontSize, font: bold, color: BLACK });
    cy -= headerHeight;
  };
  const drawRow = (label, value) => {
    ensure(rowHeight);
    const x = colX[col];
    page.drawText(safeText(label), { x, y: cy, size: fontSize, font, color: BLACK });
    const v = safeText(value);
    const vw = bold.widthOfTextAtSize(v, fontSize);
    page.drawText(v, { x: x + colW - vw, y: cy, size: fontSize, font: bold, color: BLACK });
    page.drawLine({ start: { x, y: cy - 4 }, end: { x: x + colW, y: cy - 4 }, thickness: 0.3, color: GRAY });
    cy -= rowHeight;
  };

  answeredBySection(answers).forEach((sec) => {
    drawSectionHeader(sec.nombre);
    sec.preguntas.forEach((q) => drawRow(q.titulo, String(answers[q.id])));
    cy -= spacing;
  });

  // ----- Pie: Observaciones + Sello (misma fila) y nota legal -----
  const totalW = W - 2 * M;
  const gapOS = 12;
  const obsW = Math.round(totalW * 0.62);
  const sealW = totalW - obsW - gapOS;
  const sealX = M + obsW + gapOS;
  const obsLabelY = M + footerReserve - 12;
  const obsBoxTop = obsLabelY - 6;
  const obsBoxBottom = obsBoxTop - obsBoxHeight;

  page.drawText('OBSERVACIONES', { x: M, y: obsLabelY, size: 9, font: bold, color: BLACK });
  page.drawText(safeText(pdfLayout.sealLabel), { x: sealX, y: obsLabelY, size: 8, font: bold, color: BLACK });

  page.drawRectangle({ x: M, y: obsBoxBottom, width: obsW, height: obsBoxHeight, borderColor: BLACK, borderWidth: 0.6 });
  page.drawRectangle({ x: sealX, y: obsBoxBottom, width: sealW, height: obsBoxHeight, borderColor: GRAY, borderWidth: 0.8, borderDashArray: [3, 3] });

  const obsText = evaluation.answers['Q042'] || '';
  const obsLines = obsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let obsFontSize = Math.max(4.8, fontSize - 1.5);
  let obsLineHeight = obsFontSize + 2.0;

  const padding = 6;
  const innerW = obsW - 2 * padding;
  const obsColGap = 8;
  const subColW = (innerW - obsColGap) / 2;

  let wrappedLines = obsLines.flatMap((l) => wrapText(l, font, obsFontSize, subColW));

  const availableHeight = obsBoxHeight - 8;
  let linesPerCol = Math.floor(availableHeight / obsLineHeight);
  let totalCapacity = linesPerCol * 2;

  if (wrappedLines.length > totalCapacity) {
    obsFontSize = 4.8;
    obsLineHeight = 6.2;
    wrappedLines = obsLines.flatMap((l) => wrapText(l, font, obsFontSize, subColW));
    linesPerCol = Math.floor(availableHeight / obsLineHeight);
    totalCapacity = linesPerCol * 2;
  }

  wrappedLines.slice(0, totalCapacity).forEach((line, idx) => {
    const isCol2 = idx >= linesPerCol;
    const x = isCol2 ? M + padding + subColW + obsColGap : M + padding;
    const lineIdxInCol = isCol2 ? idx - linesPerCol : idx;
    const yPos = obsBoxTop - padding - (lineIdxInCol * obsLineHeight) - obsFontSize;
    page.drawText(line, { x, y: yPos, size: obsFontSize, font, color: BLACK });
  });

  // Fecha centrada al fondo del cuadro del sello.
  const dateStr = safeText(`${evaluation.fecha}   ${evaluation.hora}`);
  const dw = font.widthOfTextAtSize(dateStr, fontSize);
  page.drawText(dateStr, { x: sealX + (sealW - dw) / 2, y: obsBoxBottom + 6, size: fontSize, font, color: BLACK });

  // Nota legal
  let ly = obsBoxBottom - 13;
  page.drawText(safeText(pdfLayout.legalTitle), { x: M, y: ly, size: fontSize, font: bold, color: BLACK });
  ly -= (legalLineHeight + 1);
  wrapText(safeText(pdfLayout.legalText), font, legalFontSize, totalW).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: legalFontSize, font, color: BLACK });
    ly -= legalLineHeight;
  });
  ly -= 2;
  wrapText(safeText(pdfLayout.legalRef), font, legalFontSize, totalW).forEach((l) => {
    page.drawText(l, { x: M, y: ly, size: legalFontSize, font: bold, color: BLACK });
    ly -= legalLineHeight;
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

export function pdfOficioFileName(evaluation) {
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const u = sanitizeName(unit?.nombre || evaluation.unidad);
  const r = sanitizeName(room?.nombre || evaluation.cuarto);
  return `Oficio_Evaluacion_${evaluation.id}_${u}_${r}.pdf`;
}

// Genera el PDF del Oficio de Evaluación. Devuelve Uint8Array.
export async function generateOficioPDF(evaluation, user, oficioData) {
  const doc = await PDFDocument.create();
  const [W, H] = pdfLayout.pageSize;
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const M = 50; // Margins

  const unit = getUnitById(evaluation.unidad);
  
  let page = doc.addPage([W, H]);
  let y = H - M;

  const center = (txt, size, f = bold) => {
    const s = safeText(txt);
    const w = f.widthOfTextAtSize(s, size);
    page.drawText(s, { x: (W - w) / 2, y, size, font: f, color: BLACK });
  };

  const formatDate = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  // Encabezado
  center("OFICIO EVALUACION TELECOMUNICACIONES", 12, bold); y -= 15;
  center("Control de Seguridad para Redes de Voz y Datos", 9, bold); y -= 25;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: BLACK });
  y -= 18;

  // Metadata Folio y Fecha
  const folioStr = `OFICIO: ${evaluation.id}`;
  const dateStr = `FECHA: ${formatDate(evaluation.fecha)} ${evaluation.hora}`;
  page.drawText(safeText(folioStr), { x: M, y, size: 9, font: bold, color: BLACK });
  const dateW = bold.widthOfTextAtSize(safeText(dateStr), 9);
  page.drawText(safeText(dateStr), { x: W - M - dateW, y, size: 9, font: bold, color: BLACK });
  y -= 25;

  // Recipient block
  const directorNombre = oficioData?.directorNombre || 'C. DIRECTOR DE LA UNIDAD';
  const directorCargo = oficioData?.directorCargo || 'Director de la Unidad';
  const atencionNombre = oficioData?.atencionNombre || 'ADMINISTRADOR DE LA UNIDAD';
  const atencionCargo = oficioData?.atencionCargo || 'Administrador del Sitio';

  page.drawText(safeText(directorNombre.toUpperCase()), { x: M, y, size: 9, font: bold, color: BLACK });
  y -= 12;
  page.drawText(safeText(directorCargo), { x: M, y, size: 9, font, color: BLACK });
  y -= 20;

  const attLbl = "Atención: ";
  const attName = attLbl + atencionNombre;
  const attNameWidth = bold.widthOfTextAtSize(attName, 9);
  const attX = W - M - attNameWidth;
  page.drawText(safeText(attName), { x: attX, y, size: 9, font: bold, color: BLACK });
  y -= 12;
  const cargoWidth = font.widthOfTextAtSize(atencionCargo, 9);
  const cargoX = W - M - cargoWidth;
  page.drawText(safeText(atencionCargo), { x: cargoX, y, size: 9, font, color: BLACK });
  y -= 25;

  page.drawText("Presente", { x: M, y, size: 9, font: bold, color: BLACK });
  y -= 18;

  // Paragraph 1
  const p1 = "Con el propósito de dar cumplimiento al proceso de Administración de la Seguridad de la información y de los criterios y controles publicados en la Norma de Seguridad Informática (ASI ACT 00), recientemente el personal de la Coordinación de Informática evaluó el cumplimiento de Criterios de Seguridad, Conservación, Servicios Básicos, Cableado y Mantenimientos de Equipos TICs en todos los cuartos de comunicaciones, principal (MDF) Y secundarios (IDFs), instalados en Unidades de la Delegación.";
  y = drawJustifiedText(page, p1, M, y, 9, font, W - 2 * M);
  y -= 10;

  // Paragraph 2
  const p2 = "Como resultado de esta evaluación se determinaron los siguientes requerimientos, para los cuales pido su amable intervención. Afín de que sean reparados y/o adquiridos e instalados, según lo que corresponda:";
  y = drawJustifiedText(page, p2, M, y, 9, font, W - 2 * M);
  y -= 15;

  // Unidad name
  const unitText = "UNIDAD: " + (unit ? unit.nombre : evaluation.unidad);
  page.drawText(safeText(unitText), { x: M, y, size: 9, font: bold, color: BLACK });
  y -= 11;

  // Recommendations list
  const recs = evaluation.recomendaciones || [];
  recs.forEach(rec => {
    const recText = `• ${rec}`;
    const recLines = wrapText(recText, font, 9, W - 2 * M - 20);
    recLines.forEach(line => {
      page.drawText(safeText(line), { x: M + 20, y, size: 9, font, color: BLACK });
      y -= 13;
    });
    y -= 4;
  });
  if (recs.length > 0) y -= 10;

  // Check if we need to add a page if y is too low
  if (y < 180) {
    page = doc.addPage([W, H]);
    y = H - M;
  }

  // Paragraph 3
  const p3 = "No omito mencionar, que los requerimientos detectados, están alineados con los criterios que utiliza la Unidad de Evaluación a Delegaciones (UEOD) durante las supervisiones que efectúa, por lo que su incumplimiento u omisión puede dar lugar a una observación por parte de esta autoridad o en su caso más extremo, comprometer el correcto funcionamiento de los servidores de aplicaciones y equipos de las redes de voz y datos.";
  y = drawJustifiedText(page, p3, M, y, 9, font, W - 2 * M);
  y -= 10;

  const p4 = "Le agradezco de antemano su atención y quedo a sus órdenes para cualquier aclaración.";
  y = drawJustifiedText(page, p4, M, y, 9, font, W - 2 * M);
  y -= 30;

  // Check if we need a new page for signatures
  if (y < 140) {
    page = doc.addPage([W, H]);
    y = H - M;
  }

  const stampTopY = y;

  // ATENTAMENTE block
  page.drawText("ATENTAMENTE", { x: M, y, size: 9, font: bold, color: BLACK });
  y -= 12;
  page.drawText("“Instituto Mexicano del Seguro Social”", { x: M, y: y, size: 9, font: italic, color: BLACK });
  y -= 45;
  page.drawLine({ start: { x: M, y }, end: { x: M + 180, y }, thickness: 0.6, color: BLACK });
  y -= 12;
  page.drawText("Evaluador: " + (user?.nombre || ''), { x: M, y, size: 9, font: bold, color: BLACK });

  // Sello block (Right side)
  page.drawRectangle({
    x: 370,
    y: stampTopY - 70,
    width: 140,
    height: 75,
    borderWidth: 0.8,
    borderColor: GRAY,
    borderDashArray: [3, 3]
  });
  const stampTxt = "SELLO DE LA UNIDAD";
  const stW = font.widthOfTextAtSize(stampTxt, 8);
  page.drawText(stampTxt, { x: 370 + (140 - stW) / 2, y: stampTopY - 37, size: 8, font, color: GRAY });

  y = stampTopY - 85;

  // Ccp block at the very bottom
  if (y < 60) {
    page = doc.addPage([W, H]);
    y = H - M;
  }
  
  y -= 15;
  page.drawText("Ccp. Jefe de Oficina de Infraestructura Coordinación de Informática", { x: M, y, size: 7, font: italic, color: GRAY });
  y -= 10;
  page.drawText("Ccp. Telecomunicaciones Oficina de Infraestructura", { x: M, y, size: 7, font: italic, color: GRAY });
  y -= 10;
  page.drawText("Ccp. Expediente", { x: M, y, size: 7, font: italic, color: GRAY });

  // Page numbering in footer of all pages
  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    const pagenum = `Página ${idx + 1} de ${pages.length}`;
    p.drawText(pagenum, { x: W - M - font.widthOfTextAtSize(pagenum, 8), y: 35, size: 8, font, color: GRAY });
  });

  return doc.save();
}
