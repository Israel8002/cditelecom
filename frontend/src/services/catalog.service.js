import { cities } from '../catalogs/cities';
import { units } from '../catalogs/units';
import { rooms } from '../catalogs/rooms';
import { sections } from '../catalogs/sections';
import { questions, NEUTRAL_VALUES } from '../catalogs/questions';

// Acceso a catálogos (estáticos, sin Internet).
export const getCities = () => cities;
export const getCityName = (id) => cities.find((c) => c.id === id)?.nombre || '';

export const getUnitsByCity = (cityId) => units.filter((u) => u.cityId === cityId && u.activo);
export const getUnitById = (id) => units.find((u) => u.id === Number(id));
export const getAllUnits = () => units;

export const getRoomsByUnit = (unitId) => rooms.filter((r) => r.unitId === Number(unitId));
export const getRoomById = (id) => rooms.find((r) => r.id === id);
export const getAllRooms = () => rooms;

export const getSections = () => sections;
export const getSectionName = (id) => sections.find((s) => s.id === id)?.nombre || id;

export const getAllQuestions = () => [...questions].sort((a, b) => a.orden - b.orden);
export const getQuestionById = (id) => questions.find((q) => q.id === id);

// Evalúa la condición visibleIf de una pregunta contra las respuestas actuales.
export function isQuestionVisible(question, answers) {
  if (question.visible === false) return false;
  const cond = question.visibleIf;
  if (!cond) return true;
  const val = answers[cond.question];
  const op = cond.operator || 'equals';
  if (val === undefined || val === null || val === '') return false;
  if (op === 'equals') return String(val) === String(cond.value);
  if (op === 'gt') return Number(val) > Number(cond.value);
  if (op === 'lt') return Number(val) < Number(cond.value);
  return true;
}

// Devuelve las preguntas visibles y ordenadas dado el estado de respuestas.
export function getVisibleQuestions(answers) {
  return getAllQuestions().filter((q) => isQuestionVisible(q, answers));
}

// Genera las recomendaciones automáticas según las respuestas.
export function buildRecommendations(answers) {
  const recs = [];
  getAllQuestions().forEach((q) => {
    if (!q.recommendations || !isQuestionVisible(q, answers)) return;
    const ans = answers[q.id];
    q.recommendations.forEach((r) => {
      if (ans === r.when) recs.push({ questionId: q.id, text: r.text });
    });
  });
  return recs;
}

// Calcula el puntaje. Conforme = primera opción del catálogo. No Aplica se excluye.
export function computeScore(answers) {
  let obtenido = 0;
  let maximo = 0;
  getAllQuestions().forEach((q) => {
    if (q.tipo !== 'radio' || !q.peso) return;
    if (!isQuestionVisible(q, answers)) return;
    const ans = answers[q.id];
    if (ans === undefined || ans === null || ans === '') return;
    if (NEUTRAL_VALUES.has(ans)) return;
    maximo += q.peso;
    if (ans === q.opciones[0]) obtenido += q.peso;
  });
  const porcentaje = maximo > 0 ? Math.round((obtenido / maximo) * 100) : 0;
  let clasificacion = 'Crítico';
  if (porcentaje >= 90) clasificacion = 'Óptimo';
  else if (porcentaje >= 70) clasificacion = 'Aceptable';
  else if (porcentaje >= 50) clasificacion = 'Requiere atención';
  return { obtenido, maximo, porcentaje, clasificacion };
}

export function getCatalogStats() {
  return {
    unidades: units.length,
    cuartos: rooms.length,
    ciudades: cities.length,
    preguntas: questions.length,
  };
}
