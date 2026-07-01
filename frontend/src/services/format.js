// Utilidades de fecha/formato.
const pad = (n) => String(n).padStart(2, '0');

export function generateFolio(date = new Date()) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `EVA-${y}${m}${d}-${hh}${mm}${ss}`;
}

export function formatDate(date = new Date()) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
export function formatTime(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function formatDateLong(date = new Date()) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${pad(date.getDate())} ${meses[date.getMonth()]} ${date.getFullYear()}`;
}
export function compactDate(date = new Date()) {
  return `${pad(date.getDate())}${pad(date.getMonth() + 1)}${date.getFullYear()}`;
}
export function sanitizeName(str) {
  return String(str || '').replace(/[^a-zA-Z0-9]/g, '');
}
export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}
