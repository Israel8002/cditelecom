import { extractSerial } from './serialParser';

/**
 * Priority 3: OCR Engine using Tesseract.js for reading printed asset labels & serial text.
 * Lazy loaded on demand.
 */
export class OcrScannerEngine {
  constructor() {
    this.worker = null;
    this.isInitializing = false;
    this.isReady = false;
    this.isBusy = false;
  }

  /**
   * Dynamically loads Tesseract worker on demand (lazy loading).
   */
  async initWorker() {
    if (this.isReady && this.worker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    try {
      // Lazy import tesseract.js
      const { createWorker } = await import('tesseract.js');
      
      // Initialize worker for English/Spanish alphanumeric reading
      this.worker = await createWorker('eng');
      
      // Configure worker parameters for fast character recognition on labels
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:-. ',
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
      });

      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('[OCR] Failed to initialize Tesseract worker:', err);
      this.isInitializing = false;
      this.isReady = false;
      return false;
    }
  }

  /**
   * Pre-processes canvas context for optimal OCR text recognition.
   * Applies binarization & high contrast grayscale.
   */
  preprocessCanvas(videoElement, canvas, ctx) {
    const width = videoElement.videoWidth || 640;
    const height = videoElement.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    // Draw frame
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Image Binarization (Grayscale + High Contrast)
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Grayscale conversion
      const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      // Simple thresholding for text sharpness
      const thresholded = avg > 120 ? 255 : 0;
      data[i] = thresholded;     // Red
      data[i + 1] = thresholded; // Green
      data[i + 2] = thresholded; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Performs OCR recognition on the current video frame.
   * @param {HTMLVideoElement} videoElement 
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   * @returns {Promise<string|null>} Serial candidate or null
   */
  async detect(videoElement, canvas, ctx) {
    if (this.isBusy) return null;

    const ready = await this.initWorker();
    if (!ready || !this.worker) return null;

    this.isBusy = true;

    try {
      this.preprocessCanvas(videoElement, canvas, ctx);
      const { data } = await this.worker.recognize(canvas);

      if (data && data.text) {
        const foundSerial = extractSerial(data.text);
        if (foundSerial) {
          return foundSerial;
        }
      }
    } catch (err) {
      console.warn('[OCR] Recognition error:', err);
    } finally {
      this.isBusy = false;
    }

    return null;
  }

  /**
   * Terminate and clean up web worker.
   */
  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (e) {
        // ignore
      }
      this.worker = null;
    }
    this.isReady = false;
    this.isBusy = false;
    this.isInitializing = false;
  }
}
