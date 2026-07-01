// Configuración del layout del PDF institucional. Sin posiciones codificadas en el generador.
// Cada fila referencia el jsonField de la pregunta (o null si es un campo del formato sin captura).
export const pdfLayout = {
  pageSize: [612, 792], // Carta (8.5 x 11 in @72dpi)
  margin: 40,
  title: 'REPORTE DE EVALUACIÓN',
  subtitle: 'Telecom - Informática',
  focus: 'Control de Seguridad para Redes de Voz y Datos',
  identification: ['Unidad', 'Cuarto', 'Evaluador', 'Folio Evaluación', 'Fecha'],
  sections: [
    {
      title: 'MANTENIMIENTO Y LIMPIEZA',
      rows: [
        { label: 'Limpieza Pisos', field: 'pisos' },
        { label: 'Limpieza Muros', field: 'muros' },
        { label: 'Limpieza Plafón', field: 'plafon' },
        { label: 'Limpieza Ventanas', field: 'ventanas' },
      ],
    },
    {
      title: 'SEGURIDAD BÁSICA',
      rows: [
        { label: 'Llaves', field: null },
        { label: 'Libre de objetos ajenos', field: 'objetosAjenos' },
        { label: 'Extintor CO2', field: 'extintor' },
        { label: 'Detector de Humo', field: 'detectorHumo' },
        { label: 'Climatizado (AC o Extractor)', field: 'climatizacion' },
        { label: 'Luminarias Adecuadas', field: 'iluminacion' },
      ],
    },
    {
      title: 'CONTROL',
      rows: [
        { label: 'Diagrama de Red', field: 'diagramaRed' },
        { label: 'Cuarto Delimitado', field: null },
        { label: 'Termómetro', field: 'termometro' },
        { label: 'Temperatura 18-24°C', field: 'temperatura' },
        { label: 'Bitácora Accesos', field: 'bitacora' },
        { label: 'Bitácora Mantenimiento', field: 'bitacora' },
        { label: 'Calendario Mantenimiento', field: 'programaMantenimiento' },
      ],
    },
    {
      title: 'SISTEMA ELÉCTRICO',
      rows: [
        { label: 'Sistema Independiente', field: 'sistemaIndependiente' },
        { label: 'Corriente Regulada', field: null },
        { label: 'Tierra Física Rack/Gab', field: null },
        { label: 'Tierra Física Equipos', field: null },
        { label: 'UPS Funcionando', field: 'estadoUPS' },
      ],
    },
    {
      title: 'INFRAESTRUCTURA DE RED',
      rows: [
        { label: 'Inventario Equipos', field: null },
        { label: 'Enlaces Identificados', field: 'cableadoIdentificado' },
        { label: 'Nodos de Datos', field: 'nodosInstalados' },
        { label: 'Nodos de Voz', field: null },
      ],
    },
  ],
  legalTitle: 'Nota Referente:',
  legalText:
    'Los requerimientos detectados, están alineados con los criterios que utiliza la Unidad de Evaluación de Órganos Desconcentrados (UEOD) durante las supervisiones que efectúa, por lo que su incumplimiento u omisión puede dar lugar a una observación por parte de esta autoridad o en su caso más extremo, comprometer el correcto funcionamiento de los servidores de aplicaciones y equipos de las redes de voz y datos.',
  legalRef: 'Manual de Organización de la Coordinación Delegacional de Informática. Apartado: 7 Funciones Sustantivas (7.1) Incisos 18 y 24.',
  sealLabel: 'SELLO DE LA UNIDAD',
};
