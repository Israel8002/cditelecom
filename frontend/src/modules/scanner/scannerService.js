import { SCAN_ENGINES, SCANNER_STATUS } from './types';
import { NativeBarcodeDetectorEngine } from './barcodeDetector';
import { ZXingScannerEngine } from './zxingScanner';
import { OcrScannerEngine } from './ocrScanner';
import { extractSerial } from './serialParser';

/**
 * Real-time Scanner Orchestrator service adhering to SOLID principles.
 */
export class RealtimeScannerService {
  constructor() {
    this.nativeEngine = new NativeBarcodeDetectorEngine();
    this.zxingEngine = new ZXingScannerEngine();
    this.ocrEngine = new OcrScannerEngine();

    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;

    this.isScanning = false;
    this.activeEngine = SCAN_ENGINES.BARCODE_DETECTOR;
    this.scanInterval = null;
    this.onStatusChange = null;
    this.onSuccessCallback = null;

    this.missCount = 0;
    this.torchEnabled = false;
  }

  /**
   * Initializes the camera stream on the target HTMLVideoElement.
   */
  async startCamera(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    if (canvasElement) {
      this.canvasCtx = canvasElement.getContext('2d', { willReadFrequently: true });
    }

    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        focusMode: { ideal: 'continuous' }
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Initialize engines
      await this.nativeEngine.init();
      this.zxingEngine.init();

      return true;
    } catch (err) {
      console.error('[ScannerService] Camera access error:', err);
      if (this.onStatusChange) this.onStatusChange(SCANNER_STATUS.ERROR);
      return false;
    }
  }

  /**
   * Starts the continuous frame processing loop.
   */
  startScan({ onStatusChange, onSuccess }) {
    if (this.isScanning) return;
    this.isScanning = true;
    this.onStatusChange = onStatusChange;
    this.onSuccessCallback = onSuccess;
    this.missCount = 0;

    if (this.onStatusChange) {
      this.onStatusChange(
        this.nativeEngine.supported
          ? SCANNER_STATUS.SCANNING_BARCODE
          : SCANNER_STATUS.SCANNING_BARCODE
      );
    }

    // High-performance detection loop (every 100ms)
    this.scanInterval = setInterval(() => {
      this.processNextFrame();
    }, 100);
  }

  /**
   * Single frame processing pipeline through detection layers.
   */
  async processNextFrame() {
    if (!this.isScanning || !this.videoElement || this.videoElement.readyState < 2) {
      return;
    }

    let detectedRawTexts = [];

    // Layer 1: Native BarcodeDetector API (Priority 1)
    if (this.nativeEngine.supported) {
      this.activeEngine = SCAN_ENGINES.BARCODE_DETECTOR;
      detectedRawTexts = await this.nativeEngine.detect(this.videoElement);
    }

    // Layer 2: ZXing Browser Engine (Priority 2 Fallback)
    if (detectedRawTexts.length === 0) {
      this.activeEngine = SCAN_ENGINES.ZXING;
      // Decode from canvas if canvas available, else video
      let zxingResult = null;
      if (this.canvasElement && this.canvasCtx) {
        this.canvasElement.width = this.videoElement.videoWidth || 640;
        this.canvasElement.height = this.videoElement.videoHeight || 480;
        this.canvasCtx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        zxingResult = this.zxingEngine.decodeCanvas(this.canvasElement);
      } else {
        zxingResult = this.zxingEngine.decodeImage(this.videoElement);
      }

      if (zxingResult) {
        detectedRawTexts = [zxingResult];
      }
    }

    // Evaluate Barcode Layer Results
    if (detectedRawTexts.length > 0) {
      for (const raw of detectedRawTexts) {
        const serial = extractSerial(raw);
        if (serial) {
          this.handleSuccess(serial);
          return;
        }
      }
    }

    // Track frame misses to activate OCR Fallback (Layer 3)
    this.missCount++;

    // Layer 3: OCR Fallback (after ~15 misses / 1.5s of no barcode match)
    if (this.missCount > 15 && this.canvasElement && this.canvasCtx) {
      if (this.onStatusChange) {
        this.onStatusChange(SCANNER_STATUS.SCANNING_OCR);
      }
      this.activeEngine = SCAN_ENGINES.OCR;

      const ocrSerial = await this.ocrEngine.detect(
        this.videoElement,
        this.canvasElement,
        this.canvasCtx
      );

      if (ocrSerial) {
        this.handleSuccess(ocrSerial);
        return;
      }
    }
  }

  /**
   * Handles successful serial capture with haptics & audio feedback.
   */
  handleSuccess(serial) {
    if (!this.isScanning) return;
    this.stopScan();

    // Haptic feedback (vibration)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {
        // ignore
      }
    }

    // Audio feedback (beep sound)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 1400; // Crisp high tone
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.03);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // ignore
    }

    if (this.onStatusChange) {
      this.onStatusChange(SCANNER_STATUS.SUCCESS);
    }

    if (this.onSuccessCallback) {
      this.onSuccessCallback(serial);
    }
  }

  /**
   * Toggles camera torch / flashlight.
   */
  async toggleTorch() {
    if (!this.stream) return false;
    const track = this.stream.getVideoTracks()[0];
    if (!track) return false;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) return false;

    try {
      this.torchEnabled = !this.torchEnabled;
      await track.applyConstraints({
        advanced: [{ torch: this.torchEnabled }]
      });
      return this.torchEnabled;
    } catch (err) {
      console.warn('[ScannerService] Torch error:', err);
      return false;
    }
  }

  /**
   * Stops frame processing loop.
   */
  stopScan() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Complete release of camera stream and engines.
   */
  async destroy() {
    this.stopScan();

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.zxingEngine.stop();
    await this.ocrEngine.terminate();

    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
  }
}
