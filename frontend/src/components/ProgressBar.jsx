export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full">
      <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%`, transitionDuration: '250ms' }}
        />
      </div>
      <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-2" data-testid="wizard-progress">
        Paso {current} de {total}
      </p>
    </div>
  );
}
