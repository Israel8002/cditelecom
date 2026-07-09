// ============================================================================
// CATÁLOGO DE PREGUNTAS (Configuration Driven Application)
// El Wizard NO conoce ninguna pregunta. Todo proviene de este archivo.
// Para agregar/quitar/reordenar preguntas, editar únicamente este arreglo.
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
    id: 'Q002', titulo: 'Cuarto delimitado', descripcion: '¿El cuarto se encuentra debidamente delimitado?',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 20, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere delimitar cuarto' }],
    jsonField: 'cuartoDelimitado', pdfField: 'Cuarto Delimitado',
  },
  {
    id: 'Q003', titulo: 'Estado de pisos', descripcion: 'Condición de limpieza de pisos.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 30, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Limpios', 'Sucios'],
    recommendations: [{ when: 'Sucios', text: 'Pisos requiere mantenimiento' }],
    jsonField: 'pisos', pdfField: 'Limpieza Pisos',
  },
  {
    id: 'Q004', titulo: 'Estado de muros', descripcion: 'Condición de limpieza de muros.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 40, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Limpios', 'Sucios'],
    recommendations: [{ when: 'Sucios', text: 'Muros requiere mantenimiento o pintura' }],
    jsonField: 'muros', pdfField: 'Limpieza Muros',
  },
  {
    id: 'Q005', titulo: 'Estado del plafón', descripcion: 'Condición de limpieza del plafón.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 50, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Plafón requiere mantenimiento o cambio' }],
    jsonField: 'plafon', pdfField: 'Limpieza Plafón',
  },
  {
    id: 'Q006', titulo: 'Estado de ventanas', descripcion: 'Condición de limpieza de ventanas.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 60, peso: 5, criticidad: 'Baja',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    recommendations: [{ when: 'No Cumple', text: 'Ventanas requiere mantenimiento' }],
    jsonField: 'ventanas', pdfField: 'Limpieza Ventanas',
  },
  {
    id: 'Q007', titulo: 'Estado de iluminación', descripcion: 'Luminarias adecuadas.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 70, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Iluminación no adecuada' }],
    jsonField: 'iluminacion', pdfField: 'Luminarias Adecuadas',
  },
  {
    id: 'Q008', titulo: 'Existe sistema climatización o Extracción', descripcion: 'Climatización del cuarto.',
    seccion: 'fisica', tipo: 'radio', required: true, orden: 80, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere sistema de climatización o extracción' }],
    jsonField: 'climatizacion', pdfField: 'Climatizado (AC o Extractor)',
  },

  // ---- SEGURIDAD ----
  {
    id: 'Q009', titulo: 'Llaves de acceso restringido', descripcion: '¿El acceso está restringido con llaves/control?',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 90, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere llaves de acceso restringido' }],
    jsonField: 'llaves', pdfField: 'Llaves',
  },
  {
    id: 'Q010', titulo: 'Existen objetos ajenos', descripcion: '¿El cuarto está libre de objetos ajenos?',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 100, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Libre de objetos ajenos', 'No esta libre'],
    recommendations: [{ when: 'No esta libre', text: 'Existen objetos ajenos al cuarto - RETIRARLOS A LA BREVEDAD' }],
    jsonField: 'objetosAjenos', pdfField: 'Libre de objetos ajenos',
  },
  {
    id: 'Q011', titulo: 'Existe termómetro', descripcion: 'Termómetro operativo en el cuarto.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 110, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere instalación de termometría' }],
    jsonField: 'termometro', pdfField: 'Termómetro',
  },
  {
    id: 'Q012', titulo: 'Temperatura del cuarto', descripcion: 'Temperatura recomendada 18-24°C.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 120, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple', 'No Aplica'],
    jsonField: 'temperatura', pdfField: 'Temperatura 18-24°C',
  },
  {
    id: 'Q013', titulo: 'Existe extintor', descripcion: 'Extintor CO2 en el cuarto.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 130, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Existe', 'No existe'],
    recommendations: [{ when: 'No existe', text: 'Requiere instalación de Extintor CO2' }],
    jsonField: 'extintor', pdfField: 'Extintor CO2',
  },
  {
    id: 'Q014', titulo: 'Tipo de extintor', descripcion: 'Selecciona el tipo de extintor.',
    seccion: 'seguridad', tipo: 'radio', required: false, orden: 140, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q013', operator: 'equals', value: 'Existe' },
    opciones: ['CO₂', 'Otro'],
    jsonField: 'tipoExtintor', pdfField: null,
  },
  {
    id: 'Q015', titulo: 'Extintor vigente', descripcion: '¿El extintor se encuentra vigente?',
    seccion: 'seguridad', tipo: 'radio', required: false, orden: 150, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: { question: 'Q014', operator: 'equals', value: 'CO₂' },
    opciones: ['Sí', 'No'],
    jsonField: 'extintorVigente', pdfField: null,
  },
  {
    id: 'Q016', titulo: 'Existe detector de humo', descripcion: 'Detector de humo operativo.',
    seccion: 'seguridad', tipo: 'radio', required: true, orden: 160, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere instalación de Detector de Humo' }],
    jsonField: 'detectorHumo', pdfField: 'Detector de Humo',
  },

  // ---- CONTROL ----
  {
    id: 'Q017', titulo: 'Cuenta con señalización?', descripcion: 'Señalamientos de seguridad e identificación.',
    seccion: 'control', tipo: 'radio', required: true, orden: 170, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Sí', 'No'],
    recommendations: [{ when: 'No', text: 'Requiere colocación de señalización' }],
    jsonField: 'senalizacion', pdfField: 'Señalización',
  },
  {
    id: 'Q018', titulo: 'Existe diagrama de red', descripcion: 'Diagrama de red del cuarto.',
    seccion: 'control', tipo: 'radio', required: true, orden: 180, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Colocar diagrama de red' }],
    jsonField: 'diagramaRed', pdfField: 'Diagrama de Red',
  },
  {
    id: 'Q019', titulo: 'Existe bitácora de accesos', descripcion: 'Bitácora de accesos al cuarto.',
    seccion: 'control', tipo: 'radio', required: true, orden: 190, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Colocar bitácora de accesos' }],
    jsonField: 'bitacora', pdfField: 'Bitácora Accesos',
  },
  {
    id: 'Q020', titulo: 'Existe bitácora de mantenimiento', descripcion: 'Bitácora de mantenimiento del cuarto.',
    seccion: 'control', tipo: 'radio', required: true, orden: 200, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Colocar bitácora de mantenimientos' }],
    jsonField: 'bitacoraMantenimiento', pdfField: 'Bitácora Mantenimiento',
  },
  {
    id: 'Q021', titulo: 'Existe calendario de mantenimiento', descripcion: 'Calendario/programa de mantenimiento visible.',
    seccion: 'control', tipo: 'radio', required: true, orden: 210, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Colocar calendario' }],
    jsonField: 'calendarioMantenimiento', pdfField: 'Calendario Mantenimiento',
  },

  // ---- INFRAESTRUCTURA ----
  {
    id: 'Q022', titulo: 'Enlaces y cascadeos identificados', descripcion: 'Etiquetas de identificación de enlaces.',
    seccion: 'infraestructura', tipo: 'radio', required: true, orden: 220, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Colocar etiquetas de identificación de enlaces' }],
    jsonField: 'cableadoIdentificado', pdfField: 'Enlaces Identificados',
  },
  {
    id: 'Q023', titulo: 'Número de nodos de Datos instalados', descripcion: 'Cantidad total de nodos de datos.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 230, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosInstalados', pdfField: 'Nodos de Datos',
  },
  {
    id: 'Q024', titulo: 'Número de nodos de Datos funcionando', descripcion: 'Nodos de datos en operación.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 240, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosFuncionando', pdfField: null,
  },
  {
    id: 'Q025', titulo: 'Número de nodos de Voz instalados', descripcion: 'Cantidad total de nodos de voz.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 250, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosVoz', pdfField: 'Nodos de Voz',
  },
  {
    id: 'Q026', titulo: 'Número de nodos de Voz funcionando', descripcion: 'Nodos de voz en operación.',
    seccion: 'infraestructura', tipo: 'number', required: true, orden: 260, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'nodosVozFuncionando', pdfField: null,
  },
  {
    id: 'Q027', titulo: 'Cableado ordenado en organizadores', descripcion: 'Orden del cableado de red.',
    seccion: 'infraestructura', tipo: 'radio', required: true, orden: 270, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere ordenar cableado en organizadores' }],
    jsonField: 'cableadoOrdenado', pdfField: null,
  },

  // ---- EQUIPOS ----
  {
    id: 'Q028', titulo: 'Número de Switches', descripcion: 'Switches instalados.',
    seccion: 'equipos', tipo: 'number', required: true, orden: 280, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'switches', pdfField: null,
  },
  {
    id: 'Q029', titulo: 'Número de Servidores', descripcion: 'Servidores instalados.',
    seccion: 'equipos', tipo: 'number', required: true, orden: 290, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'servidores', pdfField: null,
  },
  {
    id: 'Q030', titulo: 'Estado de alarmas', descripcion: 'Condición de alarmas de red.',
    seccion: 'equipos', tipo: 'radio', required: true, orden: 300, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Sin Alarmas', 'Con Alarmas'],
    jsonField: 'alarmas', pdfField: null,
  },

  // ---- TELEFONÍA ----
  {
    id: 'Q031', titulo: 'Existe Conmutador', descripcion: '¿La unidad cuenta con conmutador?',
    seccion: 'telefonia', tipo: 'radio', required: true, orden: 310, peso: 0, criticidad: 'Media',
    visible: true, visibleIf: null, opciones: ['Sí', 'No'],
    jsonField: 'existeConmutador', pdfField: null,
  },
  {
    id: 'Q032', titulo: 'Tecnología', descripcion: 'Tecnología del conmutador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 320, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q031', operator: 'equals', value: 'Sí' },
    opciones: ['Digital', 'Analógico', 'IP'],
    jsonField: 'tecnologia', pdfField: null,
  },
  {
    id: 'Q033', titulo: 'Número de líneas troncales', descripcion: 'Líneas troncales conectadas.',
    seccion: 'telefonia', tipo: 'number', required: false, orden: 330, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q031', operator: 'equals', value: 'Sí' }, placeholder: '0',
    validation: { min: 0, max: 10000 },
    jsonField: 'lineasTroncales', pdfField: null,
  },
  {
    id: 'Q034', titulo: 'Número de extensiones', descripcion: 'Extensiones habilitadas.',
    seccion: 'telefonia', tipo: 'number', required: false, orden: 340, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q031', operator: 'equals', value: 'Sí' }, placeholder: '0',
    validation: { min: 0, max: 100000 },
    jsonField: 'extensiones', pdfField: null,
  },
  {
    id: 'Q035', titulo: 'Tipo de contestadora', descripcion: 'Contestación del conmutador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 350, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: { question: 'Q031', operator: 'equals', value: 'Sí' },
    opciones: ['Automático', 'Personal humano', 'No Existe'],
    jsonField: 'contestador', pdfField: null,
  },
  {
    id: 'Q036', titulo: 'Estado del conmutador', descripcion: 'Condición del conmutador.',
    seccion: 'telefonia', tipo: 'radio', required: false, orden: 360, peso: 5, criticidad: 'Media',
    visible: true, visibleIf: { question: 'Q031', operator: 'equals', value: 'Sí' },
    opciones: ['Funcionando', 'Fuera de servicio'],
    jsonField: 'estadoConmutador', pdfField: null,
  },

  // ---- UPS ----
  {
    id: 'Q037', titulo: 'Estado del UPS', descripcion: 'Operatividad de la unidad de respaldo.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 370, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Funciona', 'No Funciona', 'Requiere'],
    recommendations: [
      { when: 'No Funciona', text: 'Requiere UPS' },
      { when: 'Requiere', text: 'Requiere UPS' }
    ],
    jsonField: 'estadoUPS', pdfField: 'UPS Funcionando',
  },
  {
    id: 'Q038', titulo: 'Sistema eléctrico independiente', descripcion: 'Circuito eléctrico dedicado.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 380, peso: 15, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere sistema eléctrico independiente' }],
    jsonField: 'sistemaIndependiente', pdfField: 'Sistema Independiente',
  },
  {
    id: 'Q039', titulo: 'Corriente regulada (Naranja)', descripcion: 'Contactos color naranja disponibles.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 390, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere corriente regulada contactos NARANJA' }],
    jsonField: 'corrienteRegulada', pdfField: 'Corriente Regulada',
  },
  {
    id: 'Q040', titulo: 'Tierra física en Rack/Gabinete', descripcion: 'Conexión a tierra física del rack/gabinete.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 400, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere instalación de tierra' }],
    jsonField: 'tierraRack', pdfField: 'Tierra Física Rack/Gab',
  },
  {
    id: 'Q041', titulo: 'Tierra física en equipos switch', descripcion: 'Equipos switches conectados a tierra.',
    seccion: 'ups', tipo: 'radio', required: true, orden: 410, peso: 10, criticidad: 'Alta',
    visible: true, visibleIf: null, opciones: ['Cumple', 'No Cumple'],
    recommendations: [{ when: 'No Cumple', text: 'Requiere tierra física' }],
    jsonField: 'tierraEquipos', pdfField: 'Tierra Física Equipos',
  },

  // ---- OBSERVACIONES ----
  {
    id: 'Q042', titulo: 'Observaciones', descripcion: 'Modifica o agrega observaciones/recomendaciones técnicas relevantes.',
    seccion: 'observaciones', tipo: 'textarea', required: false, orden: 420, peso: 0, criticidad: 'Baja',
    visible: true, visibleIf: null, placeholder: 'Modifica o escribe aquí las observaciones...',
    jsonField: 'observacionesTexto', pdfField: null,
  },
];

// Valores considerados "conformes" para el cálculo de puntaje (genérico).
export const COMPLIANT_VALUES = new Set([
  'Cumple', 'Limpios', 'Sí', 'Existe', 'Funciona', 'Funcionando', 'Libre de objetos ajenos', 'CO₂', 'Sin Alarmas', 'Automático',
]);

// Valores neutros que se excluyen del puntaje.
export const NEUTRAL_VALUES = new Set(['No Aplica']);
