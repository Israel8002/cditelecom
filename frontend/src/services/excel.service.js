import * as XLSX from 'xlsx';
import { getAllQuestions, getUnitById, getRoomById, getCityName, computeScore, buildRecommendations } from './catalog.service';

export function exportEvaluationsToExcel(evaluations, equipos = [], user, filename = 'evaluaciones.xlsx') {
  const qs = getAllQuestions();

  // Define header row for evaluations
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

  // Define header row for equipment
  const eqHeaders = [
    'ID Registro',
    'Unidad',
    'Cuarto',
    'Tipo de Dispositivo',
    'Marca',
    'Modelo',
    'Número de Serie',
    'Estado Operativo',
    'Puertos Totales',
    'Puertos Ocupados',
    'Dirección MAC',
    'Dirección IP',
    'Observaciones',
    'Fecha de Registro'
  ];

  const eqRows = [eqHeaders];

  equipos.forEach(eq => {
    const unit = getUnitById(eq.unitId);
    const room = getRoomById(eq.roomId);

    eqRows.push([
      eq.id,
      unit ? `${unit.nombre} (ID ${unit.id})` : String(eq.unitId),
      room?.nombre || String(eq.roomId),
      eq.tipo,
      eq.marca,
      eq.modelo,
      eq.numeroSerie,
      eq.estado,
      eq.puertosTotales !== undefined && eq.puertosTotales !== null ? eq.puertosTotales : '—',
      eq.puertosOcupados !== undefined && eq.puertosOcupados !== null ? eq.puertosOcupados : '—',
      eq.macAddress || '—',
      eq.ipAddress || '—',
      eq.observaciones || '—',
      eq.fechaRegistro ? new Date(eq.fechaRegistro).toLocaleString('es-MX') : '—'
    ]);
  });

  // Create workbook and sheets
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const eqWorksheet = XLSX.utils.aoa_to_sheet(eqRows);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluaciones');
  XLSX.utils.book_append_sheet(workbook, eqWorksheet, 'Equipamiento');

  // Write and download
  XLSX.writeFile(workbook, filename);
}

export function exportEquipmentToExcel(equipos, filename = 'inventario_equipos.xlsx') {
  const eqHeaders = [
    'ID Registro',
    'Unidad',
    'Cuarto',
    'Tipo de Dispositivo',
    'Marca',
    'Modelo',
    'Número de Serie',
    'Estado Operativo',
    'Puertos Totales',
    'Puertos Ocupados',
    'Dirección MAC',
    'Dirección IP',
    'Observaciones',
    'Fecha de Registro'
  ];

  const eqRows = [eqHeaders];

  equipos.forEach(eq => {
    const unit = getUnitById(eq.unitId);
    const room = getRoomById(eq.roomId);

    eqRows.push([
      eq.id,
      unit ? `${unit.nombre} (ID ${unit.id})` : String(eq.unitId),
      room?.nombre || String(eq.roomId),
      eq.tipo,
      eq.marca,
      eq.modelo,
      eq.numeroSerie,
      eq.estado,
      eq.puertosTotales !== undefined && eq.puertosTotales !== null ? eq.puertosTotales : '—',
      eq.puertosOcupados !== undefined && eq.puertosOcupados !== null ? eq.puertosOcupados : '—',
      eq.macAddress || '—',
      eq.ipAddress || '—',
      eq.observaciones || '—',
      eq.fechaRegistro ? new Date(eq.fechaRegistro).toLocaleString('es-MX') : '—'
    ]);
  });

  const eqWorksheet = XLSX.utils.aoa_to_sheet(eqRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, eqWorksheet, 'Equipamiento');
  XLSX.writeFile(workbook, filename);
}

