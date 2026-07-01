// Todos los textos reutilizables viven aquí (facilita futuras traducciones).
export const TXT = {
  // Acciones
  guardar: 'Guardar',
  cancelar: 'Cancelar',
  continuar: 'Continuar',
  eliminar: 'Eliminar',
  regresar: 'Regresar',
  cerrar: 'Cerrar',
  descargar: 'Descargar',
  compartir: 'Compartir',
  // Módulos
  dashboard: 'Inicio',
  nuevaEvaluacion: 'Nueva Evaluación',
  historial: 'Historial',
  respaldos: 'Respaldos',
  configuracion: 'Configuración',
  // Wizard
  seleccionaUnidad: 'Selecciona la Unidad',
  seleccionaUnidadDesc: 'Selecciona la unidad donde realizarás la evaluación.',
  seleccionaCuarto: 'Selecciona el cuarto de telecomunicaciones',
  fotografias: 'Fotografías del cuarto',
  fotografiasDesc: 'Agrega todas las fotografías necesarias para documentar la evaluación.',
  tomarFoto: 'Tomar fotografía',
  desdeGaleria: 'Seleccionar desde galería',
  resumen: 'Resumen',
  // Estados
  pendienteRespaldo: 'Respaldo Pendiente',
  respaldado: 'Respaldado',
  // Errores
  errPDF: 'No fue posible generar el PDF.',
  errFoto: 'No fue posible guardar la fotografía.',
  errRespaldo: 'No fue posible crear el respaldo.',
  // Confirmaciones
  confirmEliminar: '¿Desea eliminar esta evaluación?',
  confirmEliminarDesc: 'Se eliminará el registro, PDF, JSON y fotografías. Esta acción no puede deshacerse.',
};

// Estados de evaluación
export const ESTADO = {
  PENDIENTE: 'pendiente',
  RESPALDADO: 'respaldado',
};
