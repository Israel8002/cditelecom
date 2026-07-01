import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button';

export default function ConfirmDialog({ open, title, description, confirmText = 'Eliminar', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-[560px] bg-[hsl(var(--card))] rounded-[20px] p-6"
            initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()} data-testid="confirm-dialog"
          >
            <h3 className="text-lg font-semibold mb-2" style={{ fontWeight: 600 }}>{title}</h3>
            {description && <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">{description}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onCancel} testId="confirm-cancel-btn">Cancelar</Button>
              <Button variant="danger" onClick={onConfirm} testId="confirm-accept-btn">{confirmText}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
