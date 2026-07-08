import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-[hsl(var(--muted))] text-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  outline: 'bg-transparent border border-[hsl(var(--border))] text-foreground',
};

export default function Button({
  children, onClick, variant = 'primary', disabled = false, loading = false,
  icon: Icon, fullWidth = true, type = 'button', testId, className = '',
}) {
  return (
    <motion.button
      type={type}
      data-testid={testId}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2
        min-h-[56px] px-6 rounded-[18px] text-base font-600 font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      style={{ fontWeight: 600 }}
    >
      {loading ? (
        <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </motion.button>
  );
}
