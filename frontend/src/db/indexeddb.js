import { openDB } from 'idb';

// Base de datos local. Toda la información crítica vive aquí (no LocalStorage).
const DB_NAME = 'telecom-imss';
const DB_VERSION = 2;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('usuarios')) {
          db.createObjectStore('usuarios', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('evaluaciones')) {
          const s = db.createObjectStore('evaluaciones', { keyPath: 'id' });
          s.createIndex('fechaCreacion', 'fechaCreacion');
          s.createIndex('estado', 'estado');
        }
        if (!db.objectStoreNames.contains('fotografias')) {
          const s = db.createObjectStore('fotografias', { keyPath: 'id' });
          s.createIndex('idEvaluacion', 'idEvaluacion');
        }
        if (!db.objectStoreNames.contains('respaldos')) {
          const s = db.createObjectStore('respaldos', { keyPath: 'id' });
          s.createIndex('idEvaluacion', 'idEvaluacion');
        }
        if (!db.objectStoreNames.contains('logs')) {
          const s = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
          s.createIndex('fechaISO', 'fechaISO');
        }
        if (!db.objectStoreNames.contains('configuracion')) {
          db.createObjectStore('configuracion', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('equipos')) {
          const s = db.createObjectStore('equipos', { keyPath: 'id' });
          s.createIndex('unitId', 'unitId');
          s.createIndex('roomId', 'roomId');
        }
      },
    });
  }
  return dbPromise;
}

export async function dbPut(store, value) {
  const db = await getDB();
  return db.put(store, value);
}
export async function dbGet(store, key) {
  const db = await getDB();
  return db.get(store, key);
}
export async function dbGetAll(store) {
  const db = await getDB();
  return db.getAll(store);
}
export async function dbDelete(store, key) {
  const db = await getDB();
  return db.delete(store, key);
}
export async function dbGetAllByIndex(store, index, value) {
  const db = await getDB();
  return db.getAllFromIndex(store, index, value);
}
export async function dbCount(store) {
  const db = await getDB();
  return db.count(store);
}
