import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle2, ScanLine, AlertCircle } from 'lucide-react';
import { RealtimeScannerService } from './scannerService';
import { SCANNER_STATUS } from './types';

export default function SerialScanner({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scannerServiceRef = useRef(null);

  const [status, setStatus] = useState(SCANNER_STATUS.INITIALIZING);
  const [detectedSerial, setDetectedSerial] = useState(null);
  const [torchActive, setTorchActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setDetectedSerial(null);
    setCameraError(false);
    setStatus(SCANNER_STATUS.INITIALIZING);

    const service = new RealtimeScannerService();
    scannerServiceRef.current = service;

    async function initCamera() {
      if (!videoRef.current || !canvasRef.current) return;

      const success = await service.startCamera(videoRef.current, canvasRef.current);

      if (!isMounted) return;

      if (success) {
        service.startScan({
          onStatusChange: (newStatus) => {
            if (isMounted) setStatus(newStatus);
          },
          onSuccess: (serial) => {
            if (!isMounted) return;
            setDetectedSerial(serial);
            setTimeout(() => {
              onScanSuccess(serial);
              onClose();
            }, 500);
          }
        });
      } else {
        setCameraError(true);
        setStatus(SCANNER_STATUS.ERROR);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (scannerServiceRef.current) {
        scannerServiceRef.current.destroy();
        scannerServiceRef.current = null;
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  const handleToggleTorch = async () => {
    if (scannerServiceRef.current) {
      const state = await scannerServiceRef.current.toggleTorch();
      setTorchActive(state);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden"
      >
        {/* Hidden Canvas for Frame Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Element for Stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Header Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Escáner en Tiempo Real
              </h3>
              <p className="text-xs text-zinc-400">
                Apunta al código de barras o número de serie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-3 rounded-full transition-colors ${
                torchActive ? 'bg-amber-500 text-black' : 'bg-zinc-800/80 text-white hover:bg-zinc-700'
              }`}
              title="Linterna"
            >
              <Zap className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-3 rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Target Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
          {/* Main Scanning Frame Container */}
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-3xl border-2 border-white/20 overflow-hidden shadow-2xl backdrop-blur-[1px]">
            {/* Viewfinder Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />

            {/* Laser Line Animation (Framer Motion) */}
            {!detectedSerial && !cameraError && (
              <motion.div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
                animate={{ top: ['5%', '95%', '5%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Success Overlay */}
            {detectedSerial && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest">
                  Número de Serie Detectado
                </span>
                <span className="text-xl font-extrabold text-white mt-1 tracking-wider bg-black/40 px-4 py-1.5 rounded-xl border border-emerald-500/40">
                  {detectedSerial}
                </span>
              </motion.div>
            )}

            {/* Camera Access Error State */}
            {cameraError && (
              <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                <p className="text-sm font-semibold text-white">
                  No se pudo acceder a la cámara
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Por favor, concede permisos de cámara a la aplicación.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="relative z-10 p-6 flex flex-col items-center justify-center bg-gradient-to-t from-black/90 to-transparent">
          <div className="px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-200 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{status}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
