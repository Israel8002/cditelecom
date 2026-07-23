import { SUPPORTED_BARCODE_FORMATS } from './types';

/**
 * Priority 1: Native Barcode Detection API engine
 */
export class NativeBarcodeDetectorEngine {
  constructor() {
    this.detector = null;
    this.supported = false;
  }

  /**
   * Feature detection check for native BarcodeDetector API.
   */
  static isSupported() {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  }

  /**
   * Initializes the native BarcodeDetector instance.
   */
  async init() {
    if (!NativeBarcodeDetectorEngine.isSupported()) {
      this.supported = false;
      return false;
    }

    try {
      // Filter formats supported by this specific browser
      const supportedFormats = await window.BarcodeDetector.getSupportedFormats();
      const formatsToUse = SUPPORTED_BARCODE_FORMATS.filter((f) => supportedFormats.includes(f));

      if (formatsToUse.length > 0) {
        this.detector = new window.BarcodeDetector({ formats: formatsToUse });
        this.supported = true;
      } else {
        // Fallback to all supported formats by the browser
        this.detector = new window.BarcodeDetector({ formats: supportedFormats });
        this.supported = supportedFormats.length > 0;
      }
    } catch (err) {
      console.warn('[BarcodeDetector] Initialization failed:', err);
      this.supported = false;
    }

    return this.supported;
  }

  /**
   * Scans a video element or canvas image source.
   * @param {HTMLVideoElement|HTMLCanvasElement|ImageBitmap} imageSource 
   * @returns {Promise<string[]>} Array of raw detected strings
   */
  async detect(imageSource) {
    if (!this.supported || !this.detector) return [];

    try {
      const barcodes = await this.detector.detect(imageSource);
      if (barcodes && barcodes.length > 0) {
        return barcodes.map((b) => b.rawValue).filter(Boolean);
      }
    } catch (err) {
      // Ignore frame detection errors (e.g. video not ready)
    }

    return [];
  }
}
