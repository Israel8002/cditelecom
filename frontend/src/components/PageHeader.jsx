import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, onBack, right }) {
  return (
    <header className="flex items-center gap-3 px-6 pt-6 pb-4">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.95 }} onClick={onBack} data-testid="back-btn"
          className="h-10 w-10 -ml-2 flex items-center justify-center rounded-full bg-[hsl(var(--muted))] shrink-0"
        >
          <ChevronLeft size={22} />
        </motion.button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold leading-tight truncate" style={{ fontWeight: 700 }}>{title}</h1>
        {subtitle && <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
