import { dbPut, dbGet, dbGetAll, dbDelete, dbGetAllByIndex, dbCount } from '../db/indexeddb';
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

// ---------------- EVALUACIONES ----------------
export async function saveEvaluation(evaluation) {
  const now = new Date().toISOString();
  const data = {
    ...evaluation,
    fechaModificacion: now,
    fechaCreacion: evaluation.fechaCreacion || now,
    version: 1,
  };
  await dbPut('evaluaciones', data);
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

// ---------------- ALMACENAMIENTO ----------------
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const e = await navigator.storage.estimate();
    return { usage: e.usage || 0, quota: e.quota || 0 };
  }
  return { usage: 0, quota: 0 };
}
