// ============================================================================
// CATÁLOGO DE PREGUNTAS (Configuration Driven Application)
// El Wizard NO conoce ninguna pregunta. Todo proviene de este archivo.
// Para agregar/quitar/reordenar preguntas, editar únicamente este arreglo.
// ----------------------------------------------------------------------------
// Campos por pregunta:
//   id, titulo, descripcion, seccion, tipo, required, orden, peso, criticidad,
//   visible, visibleIf, opciones, recommendations, jsonField, pdfField,
//   placeholder, validation
// tipos soportados: radio | number | textarea | text | select
// visibleIf: { question, operator: 'equals'|'gt'|'lt', value }
// recommendations: [{ when: <valorOpcion>, text }]
// ============================================================================

export const questions = [
  // ---- FÍSICA ----
  {
    id: 'Q001', titulo: 'Tipo de instalación', descripcion: 'Selecciona el tipo de instalación del cuarto.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 10, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, opciones: ['Rack', 'Gabinete', 'Ambos'],
    jsonField: 'tipoInstalacion', pdfField: null,
  },
  {
    id: 'Q002', titulo: 'Temperatura del cuarto', descripcion: 'Temperatura recomendada 18-24°C.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 20, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'temperatura', pdfField: 'Temperatura 18-24°C',
  },
  {
    id: 'Q003', titulo: 'Existe termómetro', descripcion: 'Selecciona el estado actual.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 30, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'termometro', pdfField: 'Termómetro',
  },
  {
    id: 'Q004', titulo: 'Estado de pisos', descripcion: 'Condición de limpieza de pisos.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 40, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Limpios', 'Sucios', 'Requiere mantenimiento'],
    jsonField: 'pisos', pdfField: 'Limpieza Pisos',
  },
  {
    id: 'Q005', titulo: 'Estado de muros', descripcion: 'Condición de limpieza de muros.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 50, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Limpios', 'Sucios', 'Requiere mantenimiento'],
    jsonField: 'muros', pdfField: 'Limpieza Muros',
  },
  {
    id: 'Q006', titulo: 'Estado del plafón', descripcion: 'Selecciona el estado actual.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 60, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'plafon', pdfField: 'Limpieza Plafón',
  },
  {
    id: 'Q007', titulo: 'Estado de ventanas', descripcion: 'Selecciona el estado actual.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 70, peso: 5, criticidad: 'Baja',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'ventanas', pdfField: 'Limpieza Ventanas',
  },
  {
    id: 'Q008', titulo: 'Estado de iluminación', descripcion: 'Luminarias adecuadas.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 80, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'iluminacion', pdfField: 'Luminarias Adecuadas',
  },
  {
    id: 'Q009', titulo: 'Existe Aire acondicionado o extracción', descripcion: 'Climatización del cuarto.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 90, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    recommendations: [{ when: 'No Cumple', text: 'Instalar sistema de climatización.' }],
    jsonField: 'climatizacion', pdfField: 'Climatizado (AC o Extractor)',
  },
  {
    id: 'Q010', titulo: 'Limpieza del cuarto', descripcion: 'Condición general de limpieza.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 100, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'Requiere limpieza'],
    jsonField: 'limpieza', pdfField: null,
  },

  // ---- SEGURIDAD ----
  {
    id: 'Q044', titulo: 'Llaves de acceso restringido', descripcion: '¿El acceso está restringido con llaves/control?',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 105, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'llaves', pdfField: 'Llaves',
  },
  {
    id: 'Q011', titulo: 'Existen objetos ajenos', descripcion: '¿El cuarto está libre de objetos ajenos?',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 110, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Libre de objetos ajenos', 'No esta libre'],
    recommendations: [{ when: 'No esta libre', text: 'Retirar objetos ajenos en el cuarto.' }],
    jsonField: 'objetosAjenos', pdfField: 'Libre de objetos ajenos',
  },
  {
    id: 'Q012', titulo: 'El Site está ordenado', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 120, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'siteOrdenado', pdfField: null,
  },
  {
    id: 'Q013', titulo: 'Sistema eléctrico independiente', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 130, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'sistemaIndependiente', pdfField: 'Sistema Independiente',
  },
  {
    id: 'Q014', titulo: 'Existe bitácora de accesos', descripcion: 'Bitácora de accesos al cuarto.',
    seccion: 'control', tipo: 'radio', required: true, orden: 202, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'bitacora', pdfField: 'Bitácora Accesos',
  },
  {
    id: 'Q015', titulo: 'Existe extintor', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 150, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Instalar extintor CO₂ vigente.' }],
    jsonField: 'extintor', pdfField: 'Extintor CO2',
  },
  {
    id: 'Q016', titulo: 'Tipo de extintor', descripcion: 'Selecciona el tipo de extintor.',
    seccion: 'seguridad', tipo: 'radio', required: false, orden: 160, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q015', operator: 'equals', value: 'Cumple' },
    opciones: ['CO₂', 'Otro', 'No Existe'],
    jsonField: 'tipoExtintor', pdfField: null,
  },
  {
    id: 'Q017', titulo: 'Extintor vigente', descripcion: '¿El extintor se encuentra vigente?',
    seccion: 'seguridad', tipo: 'radio', required: false, orden: 170, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: { question: 'Q015', operator: 'equals', value: 'Cumple' },
    opciones: ['Sí', 'No'],
    jsonField: 'extintorVigente', pdfField: null,
  },
  {
    id: 'Q018', titulo: 'Existe detector de humo', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 180, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Instalar detector de humo.' }],
    jsonField: 'detectorHumo', pdfField: 'Detector de Humo',
  },
  {
    id: 'Q019', titulo: 'Existe cámara de seguridad', descripcion: 'Selecciona el estado actual.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 190, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'camara', pdfField: null,
  },

  // ---- CONTROL ----
  {
    id: 'Q020', titulo: 'Existe diagrama de red', descripcion: 'Selecciona el estado actual.',
    seccion: 'control', tipo: 'radio', required: true, orden: 200, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'diagramaRed', pdfField: 'Diagrama de Red',
  },
  {
    id: 'Q042', titulo: 'Existe bitácora de mantenimiento', descripcion: 'Bitácora de mantenimiento del cuarto.',
    seccion: 'control', tipo: 'radio', required: true, orden: 204, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'bitacoraMantenimiento', pdfField: 'Bitácora Mantenimiento',
  },
  {
    id: 'Q043', titulo: 'Existe calendario de mantenimiento', descripcion: 'Calendario/programa de mantenimiento visible.',
    seccion: 'control', tipo: 'radio', required: true, orden: 206, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'calendarioMantenimiento', pdfField: 'Calendario Mantenimiento',
  },
  {
    id: 'Q045', titulo: 'Cuarto delimitado', descripcion: '¿El cuarto está debidamente delimitado?',
    seccion: 'control', tipo: 'radio', required: true, orden: 208, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'cuartoDelimitado', pdfField: 'Cuarto Delimitado',
  },

  // ---- INFRAESTRUCTURA ----
  {
    id: 'Q021', titulo: 'Número de nodos de datos instalados', descripcion: 'Captura la cantidad total de nodos de datos.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 210, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosInstalados', pdfField: 'Nodos de Datos',
  },
  {
    id: 'Q022', titulo: 'Número de nodos de datos funcionando', descripcion: 'Captura cuántos nodos de datos funcionan.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 220, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosFuncionando', pdfField: null,
  },
  {
    id: 'Q049', titulo: 'Número de nodos de voz', descripcion: 'Captura la cantidad de nodos de voz.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 222, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosVoz', pdfField: 'Nodos de Voz',
  },
  {
    id: 'Q050', titulo: 'Número de nodos de voz funcionando', descripcion: 'Captura cuántos nodos de voz funcionan.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 224, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosVozFuncionando', pdfField: null,
  },
  {
    id: 'Q023', titulo: 'Cableado dentro de canaletas', descripcion: 'Selecciona el estado actual.',
    seccion: 'infraestructura', tipo: 'radio', required: true, orden: 230, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'cableadoCanaletas', pdfField: null,
  },
  {
    id: 'Q024', titulo: 'Cableado ordenado', descripcion: 'Selecciona el estado actual.',
    seccion: 'infraestructura', tipo: 'radio', required: true, orden: 240, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'cableadoOrdenado', pdfField: null,
  },
  {
    id: 'Q025', titulo: 'Cableado identificado', descripcion: 'Selecciona el estado actual.',
    seccion: 'infraestructura', tipo: 'radio', required: true, orden: 250, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'cableadoIdentificado', pdfField: 'Enlaces Identificados',
  },

  // ---- EQUIPOS ----
  {
    id: 'Q026', titulo: 'Número de Switches', descripcion: 'Captura la cantidad de switches.',
    seccion: 'equipos', tipo: 'number', required: true, orden: 260, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'switches', pdfField: null,
  },
  {
    id: 'Q027', titulo: 'Número de Servidores', descripcion: 'Captura la cantidad de servidores.',
    seccion: 'equipos', tipo: 'number', required: true, orden: 270, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'servidores', pdfField: null,
  },
  {
    id: 'Q028', titulo: 'Existe programa de mantenimiento', descripcion: 'Selecciona el estado actual.',
    seccion: 'equipos', tipo: 'radio', required: true, orden: 280, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'programaMantenimiento', pdfField: null,
  },
  {
    id: 'Q029', titulo: 'Equipos (servidores) actualizados', descripcion: 'Selecciona el estado actual.',
    seccion: 'equipos', tipo: 'radio', required: false, orden: 290, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: { question: 'Q027', operator: 'gt', value: 0 }, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'equiposActualizados', pdfField: null,
  },
  {
    id: 'Q030', titulo: 'Equipos (switches) limpios', descripcion: 'Selecciona el estado actual.',
    seccion: 'equipos', tipo: 'radio', required: false, orden: 300, peso: 5, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q026', operator: 'gt', value: 0 }, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'equiposLimpios', pdfField: null,
  },
  {
    id: 'Q031', titulo: 'Estado de alarmas', descripcion: 'Selecciona el estado actual.',
    seccion: 'equipos', tipo: 'radio', required: true, orden: 310, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Sin Alarmas', 'Con Alarmas'],
    jsonField: 'alarmas', pdfField: null,
  },

  // ---- TELEFONÍA ----
  {
    id: 'Q032', titulo: 'Existe Conmutador', descripcion: '¿La unidad cuenta con conmutador?',
    seccion: 'telefonia', tipo: 'radio', required: true, orden: 320, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Sí', 'No'],
    jsonField: 'existeConmutador', pdfField: null,
  },
  {
    id: 'Q033', titulo: 'Número de PBX', descripcion: 'Captura la cantidad de PBX.',
    seccion: 'telefonia', tipo: 'number', required: false, orden: 330, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' }, placeholder: '0',
    validation: { min: 0, max: 1000 },
    jsonField: 'numeroPBX', pdfField: null,
  },
  {
    id: 'Q034', titulo: 'Tecnología', descripcion: 'Tecnología del conmutador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 340, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' },
    opciones: ['Digital', 'Analógico', 'IP'],
    jsonField: 'tecnologia', pdfField: null,
  },
  {
    id: 'Q035', titulo: 'Número de líneas troncales', descripcion: 'Captura la cantidad de troncales.',
    seccion: 'telefonia', tipo: 'number', required: false, orden: 350, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' }, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'lineasTroncales', pdfField: null,
  },
  {
    id: 'Q036', titulo: 'Número de extensiones', descripcion: 'Captura la cantidad de extensiones.',
    seccion: 'telefonia', tipo: 'number', required: false, orden: 360, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' }, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'extensiones', pdfField: null,
  },
  {
    id: 'Q037', titulo: 'Tipo de contestador', descripcion: 'Selecciona el tipo de contestador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 370, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' },
    opciones: ['Automático', 'Personal', 'No Existe'],
    jsonField: 'contestador', pdfField: null,
  },
  {
    id: 'Q038', titulo: 'Estado del conmutador', descripcion: 'Selecciona el estado actual.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 380, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' },
    opciones: ['Funcionando', 'Requiere mantenimiento', 'Fuera de servicio'],
    jsonField: 'estadoConmutador', pdfField: null,
  },
  {
    id: 'Q039', titulo: 'Garantía', descripcion: 'Estado de la garantía del conmutador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 390, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q032', operator: 'equals', value: 'Sí' },
    opciones: ['Con Garantía', 'Sin Garantía'],
    jsonField: 'garantia', pdfField: null,
  },

  // ---- UPS ----
  {
    id: 'Q040', titulo: 'Estado del UPS', descripcion: 'Selecciona el estado actual.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 400, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Funciona', 'No Funciona', 'Requiere Reemplazo'],
    jsonField: 'estadoUPS', pdfField: 'UPS Funcionando',
  },
  {
    id: 'Q046', titulo: 'Corriente regulada', descripcion: 'Selecciona el estado actual.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 402, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'corrienteRegulada', pdfField: 'Corriente Regulada',
  },
  {
    id: 'Q047', titulo: 'Tierra física Rack/Gabinete', descripcion: 'Selecciona el estado actual.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 404, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'tierraRack', pdfField: 'Tierra Física Rack/Gab',
  },
  {
    id: 'Q048', titulo: 'Tierra física de equipos', descripcion: 'Selecciona el estado actual.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 406, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    jsonField: 'tierraEquipos', pdfField: 'Tierra Física Equipos',
  },

  // ---- OBSERVACIONES ----
  {
    id: 'Q041', titulo: 'Observaciones', descripcion: 'Agrega cualquier observación relevante (sin límite).',
    seccion: 'observaciones', tipo: 'textarea', required: false, orden: 410, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: 'Escribe aquí las observaciones...',
    jsonField: 'observacionesTexto', pdfField: null,
  },
];

// Valores considerados "conformes" para el cálculo de puntaje (genérico).
export const COMPLIANT_VALUES = new Set([
  'Cumple', 'Limpios', 'Sí', 'Funciona', 'Funcionando', 'Con Garantía', 'Sin Alarmas', 'CO₂', 'No',
]);
// Valores neutros que se excluyen del puntaje.
export const NEUTRAL_VALUES = new Set(['No Aplica']);
// Nota: para Q011 (objetos ajenos) la respuesta conforme es "No"; ya incluida arriba.
