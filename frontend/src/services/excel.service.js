import * as XLSX from 'xlsx';
import { getAllQuestions, getUnitById, getRoomById, getCityName, computeScore, buildRecommendations } from './catalog.service';

export function exportEvaluationsToExcel(evaluations, user, filename = 'evaluaciones.xlsx') {
  const qs = getAllQuestions();

  // Define header row
  const headers = [
    'Folio',
    'Fecha',
    'Hora',
    'Evaluador',
    'Matrícula',
    'Ciudad',
    'Unidad',
    'Cuarto',
    'Porcentaje Cumplimiento',
    'Clasificación',
    'Observaciones',
    'Recomendaciones'
  ];

  // Add question columns
  qs.forEach(q => {
    headers.push(`${q.id} - ${q.titulo}`);
  });

  const rows = [headers];

  evaluations.forEach(e => {
    const unit = getUnitById(e.unidad);
    const room = getRoomById(e.cuarto);
    const score = computeScore(e.answers || {});
    const recs = buildRecommendations(e.answers || {}).map(r => r.text).join('; ');
    const obs = (e.observaciones || []).map(o => o.text).join('; ');

    const row = [
      e.id,
      e.fecha,
      e.hora,
      user?.nombre || '',
      user?.matricula || '',
      getCityName(user?.ciudad),
      unit ? `${unit.nombre} (ID ${unit.id})` : String(e.unidad),
      room?.nombre || String(e.cuarto),
      `${score.porcentaje}%`,
      score.clasificacion,
      obs,
      recs
    ];

    // Add answer values
    qs.forEach(q => {
      const val = e.answers?.[q.id];
      row.push(val !== undefined && val !== null ? String(val) : '—');
    });

    rows.push(row);
  });

  // Create workbook and sheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluaciones');

  // Write and download
  XLSX.writeFile(workbook, filename);
}
