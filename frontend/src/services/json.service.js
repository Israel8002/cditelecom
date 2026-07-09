import { getAllQuestions, computeScore, getCityName, getUnitById, getRoomById, isQuestionVisible } from './catalog.service';
import { jsonSchema } from '../catalogs/json-schema';
import { appConfig } from '../catalogs/appConfig';
import { compactDate } from './format';

// Construye el mapa jsonField -> valor a partir de las respuestas por id de pregunta.
export function answersByField(answers) {
  const map = {};
  getAllQuestions().forEach((q) => {
    if (!isQuestionVisible(q, answers)) return;
    const v = answers[q.id];
    if (v !== undefined && v !== null && v !== '') map[q.jsonField] = v;
  });
  return map;
}

// Construye el objeto JSON completo de la evaluación según el esquema.
export function buildEvaluationObject(evaluation, user, photos = []) {
  const unit = getUnitById(evaluation.unidad);
  const room = getRoomById(evaluation.cuarto);
  const fields = answersByField(evaluation.answers || {});
  const puntaje = computeScore(evaluation.answers || {});
  const raw = {
    idEvaluacion: evaluation.id,
    fecha: evaluation.fecha,
    hora: evaluation.hora,
    usuario: user?.nombre || '',
    matricula: user?.matricula || '',
    correo: user?.correo || '',
    celular: user?.celular || '',
    ciudad: getCityName(user?.ciudad),
    unidad: unit ? `${unit.nombre} (ID ${unit.id})` : String(evaluation.unidad),
    cuarto: room?.nombre || String(evaluation.cuarto),
    puntaje,
    fotografias: photos.map((p) => ({ nombre: p.nombre, tipo: p.tipo, tamano: p.tamano, fecha: p.fecha })),
    respuestas: fields,
    observaciones: (evaluation.answers?.['Q042'] || '')
      .split('\n')
      .map((l) => l.trim().replace(/^•\s*/, ''))
      .filter((l) => l.length > 0)
      .map((text) => ({ text, auto: false })),
    versionApp: appConfig.version,
    fechaGeneracion: new Date().toISOString(),
  };
  // Reordenar según esquema.
  const ordered = {};
  jsonSchema.order.forEach((k) => { ordered[k] = raw[k]; });
  return ordered;
}

export function serializeJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

export function jsonFileName(evaluation) {
  return `${compactDate(new Date(evaluation.fechaCreacion || Date.now()))}_${evaluation.id}.json`;
}
