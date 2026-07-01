import { motion } from 'framer-motion';

export default function Card({ children, onClick, className = '', testId, padding = 'p-5', interactive = false }) {
  const Comp = onClick ? motion.button : motion.div;
  return (
    <Comp
      data-testid={testId}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      className={`bg-[hsl(var(--card))] rounded-[20px] ${padding} text-left w-full
        ${onClick || interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Comp>
  );
}
