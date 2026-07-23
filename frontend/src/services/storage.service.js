import { dbPut, dbGet, dbGetAll, dbDelete, dbGetAllByIndex, dbCount, dbClearAll } from '../db/indexeddb';
import { uid } from './format';

// ---------------- USUARIO ----------------
const USER_ID = 'singleton';

export async function saveUser(data) {
  const existing = await dbGet('usuarios', USER_ID);
  const now = new Date().toISOString();
  const user = {
    id: USER_ID,
    ...existing,
    ...data,
    fechaRegistro: existing?.fechaRegistro || now,
    fechaActualizacion: now,
  };
  await dbPut('usuarios', user);
  return user;
}
export async function getUser() {
  return dbGet('usuarios', USER_ID);
}

export async function saveEvaluation(evaluation) {
  const now = new Date().toISOString();
  const data = {
    ...evaluation,
    fechaModificacion: now,
    fechaCreacion: evaluation.fechaCreacion || now,
    version: 1,
  };
  await dbPut('evaluaciones', data);

  // Auto-sync findings to 'pendientes' store if the evaluation is finalized
  if (data.estado !== 'borrador') {
    try {
      const questions = getAllQuestions();
      const answers = data.answers || {};
      for (const q of questions) {
        const answerVal = answers[q.id];
        const idKey = `${data.id}_${q.id}`;
        const isAFinding = isFinding(q, answerVal);

        if (isAFinding) {
          const existing = await dbGet('pendientes', idKey);
          if (!existing) {
            const newPendiente = {
              id: idKey,
              evaluationId: data.id,
              unidadId: Number(data.unidad),
              roomId: data.cuarto,
              questionId: q.id,
              questionTitle: q.titulo,
              originalAnswer: answerVal,
              resolved: false,
              resolvedAt: null,
              resolutionComment: null,
              fechaDeteccion: data.fecha,
            };
            await dbPut('pendientes', newPendiente);
          }
        } else {
          const existing = await dbGet('pendientes', idKey);
          if (existing && !existing.resolved) {
            await dbDelete('pendientes', idKey);
          }
        }
      }
    } catch (err) {
      console.error("Error auto-syncing findings on saveEvaluation:", err);
    }
  }

  return data;
}
export async function getEvaluation(id) {
  return dbGet('evaluaciones', id);
}
export async function getAllEvaluations() {
  const all = await dbGetAll('evaluaciones');
  return all.sort((a, b) => (a.fechaCreacion < b.fechaCreacion ? 1 : -1));
}
export async function deleteEvaluationCascade(id) {
  const fotos = await dbGetAllByIndex('fotografias', 'idEvaluacion', id);
  await Promise.all(fotos.map((f) => dbDelete('fotografias', f.id)));
  const resp = await dbGetAllByIndex('respaldos', 'idEvaluacion', id);
  await Promise.all(resp.map((r) => dbDelete('respaldos', r.id)));
  await dbDelete('evaluaciones', id);
}
export async function countEvaluations() {
  return dbCount('evaluaciones');
}
// Evaluación en progreso (recuperación automática)
export async function getDraft() {
  const all = await getAllEvaluations();
  return all.find((e) => e.estado === 'borrador');
}

// ---------------- FOTOGRAFÍAS ----------------
export async function addPhoto(idEvaluacion, file) {
  const photo = {
    id: uid(),
    idEvaluacion,
    nombre: file.name || `foto-${Date.now()}.jpg`,
    tipo: file.type || 'image/jpeg',
    tamano: file.size || 0,
    fecha: new Date().toISOString(),
    blob: file, // se conserva el archivo original (sin modificar)
  };
  await dbPut('fotografias', photo);
  return photo;
}
export async function getPhotos(idEvaluacion) {
  return dbGetAllByIndex('fotografias', 'idEvaluacion', idEvaluacion);
}
export async function deletePhoto(id) {
  return dbDelete('fotografias', id);
}
export async function countPhotos() {
  return dbCount('fotografias');
}

// ---------------- RESPALDOS ----------------
export async function saveBackup(backup) {
  const data = { id: backup.id || uid(), ...backup };
  await dbPut('respaldos', data);
  return data;
}
export async function getBackupByEvaluation(idEvaluacion) {
  const list = await dbGetAllByIndex('respaldos', 'idEvaluacion', idEvaluacion);
  return list.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
}
export async function getAllBackups() {
  const all = await dbGetAll('respaldos');
  return all.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}
export async function countBackups() {
  return dbCount('respaldos');
}

// ---------------- EQUIPOS ----------------
export async function saveEquipo(equipo) {
  const now = new Date().toISOString();
  const data = {
    ...equipo,
    fechaModificacion: now,
    fechaRegistro: equipo.fechaRegistro || now,
  };
  await dbPut('equipos', data);
  return data;
}
export async function getEquipo(id) {
  return dbGet('equipos', id);
}
export async function getAllEquipos() {
  const all = await dbGetAll('equipos');
  return all.sort((a, b) => {
    const da = a.fechaRegistro || a.id || '';
    const db = b.fechaRegistro || b.id || '';
    return da < db ? 1 : -1;
  });
}
export async function getEquiposByRoom(roomId) {
  const list = await dbGetAllByIndex('equipos', 'roomId', roomId);
  return list.sort((a, b) => {
    const da = a.fechaRegistro || a.id || '';
    const db = b.fechaRegistro || b.id || '';
    return da < db ? 1 : -1;
  });
}
export async function deleteEquipo(id) {
  await dbDelete('equipos', id);
}
export async function countEquipos() {
  return dbCount('equipos');
}

// ---------------- CONFIGURACIÓN ----------------
export async function setConfig(key, value) {
  await dbPut('configuracion', { key, value });
}
export async function getConfig(key) {
  const r = await dbGet('configuracion', key);
  return r?.value;
}

// ---------------- PENDIENTES ----------------
import { getAllQuestions } from './catalog.service';
import { NEUTRAL_VALUES } from '../catalogs/questions';

const PENDIENTES_QUESTIONS_SET = new Set([
  'Q002', 'Q003', 'Q004', 'Q005', 'Q006', 'Q007', 'Q008', 'Q009', 'Q010', 'Q011',
  'Q013', 'Q014', 'Q016', 'Q017', 'Q018', 'Q019', 'Q020', 'Q021', 'Q022', 'Q027',
  'Q037', 'Q038', 'Q039', 'Q040', 'Q041'
]);

export function isFinding(question, answer) {
  if (!question || !PENDIENTES_QUESTIONS_SET.has(question.id)) return false;
  if (answer === undefined || answer === null || answer === '') return false;
  if (NEUTRAL_VALUES.has(answer)) return false;
  return answer !== question.opciones[0];
}

export async function savePendiente(pendiente) {
  await dbPut('pendientes', pendiente);
  return pendiente;
}

export async function getPendiente(id) {
  return dbGet('pendientes', id);
}

export async function getAllPendientes() {
  return dbGetAll('pendientes');
}

export async function getPendientesByUnit(unitId) {
  return dbGetAllByIndex('pendientes', 'unidadId', Number(unitId));
}

export async function syncPendientesFromEvaluations() {
  const evaluations = await dbGetAll('evaluaciones');
  const finalized = evaluations.filter((e) => e.estado !== 'borrador');
  const questions = getAllQuestions();
  const currentPendientes = await dbGetAll('pendientes');
  const currentMap = new Map(currentPendientes.map((p) => [p.id, p]));

  for (const evalObj of finalized) {
    const answers = evalObj.answers || {};
    for (const q of questions) {
      const answerVal = answers[q.id];
      const idKey = `${evalObj.id}_${q.id}`;
      const isAFinding = isFinding(q, answerVal);

      if (isAFinding) {
        if (!currentMap.has(idKey)) {
          const newPendiente = {
            id: idKey,
            evaluationId: evalObj.id,
            unidadId: Number(evalObj.unidad),
            roomId: evalObj.cuarto,
            questionId: q.id,
            questionTitle: q.titulo,
            originalAnswer: answerVal,
            resolved: false,
            resolvedAt: null,
            resolutionComment: null,
            fechaDeteccion: evalObj.fecha,
          };
          await dbPut('pendientes', newPendiente);
        }
      } else {
        const existing = currentMap.get(idKey);
        if (existing && !existing.resolved) {
          await dbDelete('pendientes', idKey);
        }
      }
    }
  }
}

// ---------------- ALMACENAMIENTO ----------------
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const e = await navigator.storage.estimate();
    return { usage: e.usage || 0, quota: e.quota || 0 };
  }
  return { usage: 0, quota: 0 };
}

export async function clearAllData() {
  await dbClearAll();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
}
