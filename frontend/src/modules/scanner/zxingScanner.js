import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

/**
 * Priority 2: ZXing Engine for continuous video stream scanning.
 */
export class ZXingScannerEngine {
  constructor() {
    this.reader = null;
    this.controls = null;
    this.isScanning = false;
  }

  /**
   * Initializes the ZXing reader with hint formats.
   */
  init() {
    const hints = new Map();
    const formats = [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.ITF,
    ];

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    hints.set(DecodeHintType.TRY_HARDER, true);

    this.reader = new BrowserMultiFormatReader(hints, 300);
  }

  /**
   * Decodes a single video frame or canvas.
   * @param {HTMLVideoElement|HTMLCanvasElement} element 
   * @returns {string|null}
   */
  decodeImage(element) {
    if (!this.reader) this.init();

    try {
      const result = this.reader.decodeFromVideoElement
        ? this.reader.decode(element)
        : null;
      return result ? result.getText() : null;
    } catch (err) {
      // Normal frame-miss error in ZXing
      return null;
    }
  }

  /**
   * Decodes directly from canvas frame element.
   * @param {HTMLCanvasElement} canvas 
   * @returns {string|null}
   */
  decodeCanvas(canvas) {
    if (!this.reader) this.init();
    try {
      const result = this.reader.decodeFromCanvas(canvas);
      return result ? result.getText() : null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Stops and releases resources.
   */
  stop() {
    if (this.controls) {
      try {
        this.controls.stop();
      } catch (e) {
        // ignore
      }
      this.controls = null;
    }
    if (this.reader) {
      try {
        this.reader.reset();
      } catch (e) {
        // ignore
      }
    }
    this.isScanning = false;
  }
}
