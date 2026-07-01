import { dbPut, dbGetAll, dbCount } from '../db/indexeddb';
import { appConfig } from '../catalogs/appConfig';

// Tipos de evento del log del sistema.
export const LOG = {
  INICIO: 'Inicio de aplicación',
  REGISTRO: 'Registro',
  NUEVA_EVAL: 'Nueva evaluación',
  FOTO: 'Fotografía agregada',
  PDF: 'PDF generado',
  JSON: 'JSON generado',
  RESPALDO: 'Respaldo generado',
  DESCARGA: 'Archivo descargado',
  ELIMINAR: 'Evaluación eliminada',
  ERROR: 'Error',
};

export async function logEvent(tipo, descripcion = '') {
  try {
    const now = new Date();
    await dbPut('logs', {
      fechaISO: now.toISOString(),
      fecha: now.toLocaleDateString('es-MX'),
      hora: now.toLocaleTimeString('es-MX'),
      tipo,
      descripcion,
    });
    await pruneLogs();
  } catch (e) {
    // Nunca interrumpir la app por un error de log; registrar en consola para diagnóstico.
    console.error('log.service: no se pudo escribir el log', e);
  }
}

async function pruneLogs() {
  const total = await dbCount('logs');
  if (total <= appConfig.maxLogRecords) return;
  const { getDB } = await import('../db/indexeddb');
  const db = await getDB();
  const tx = db.transaction('logs', 'readwrite');
  let cursor = await tx.store.openCursor();
  let toDelete = total - appConfig.maxLogRecords;
  while (cursor && toDelete > 0) {
    await cursor.delete();
    toDelete -= 1;
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function getLogs() {
  const all = await dbGetAll('logs');
  return all.sort((a, b) => (a.fechaISO < b.fechaISO ? 1 : -1));
}
