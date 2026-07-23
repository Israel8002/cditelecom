/**
 * Scanner Engine Types & Constants
 */
export const SCAN_ENGINES = {
  BARCODE_DETECTOR: 'BARCODE_DETECTOR',
  ZXING: 'ZXING',
  OCR: 'OCR',
};

export const SUPPORTED_BARCODE_FORMATS = [
  'code_128',
  'code_39',
  'ean_13',
  'ean_8',
  'qr_code',
  'data_matrix',
];

export const SCANNER_STATUS = {
  INITIALIZING: 'Iniciando cámara...',
  SCANNING_BARCODE: 'Escaneando código de barras...',
  SCANNING_OCR: 'Analizando texto con OCR...',
  SUCCESS: '¡Código detectado!',
  ERROR: 'Error de cámara',
};
