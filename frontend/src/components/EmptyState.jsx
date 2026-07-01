export default function EmptyState({ icon: Icon, title, description, testId }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6" data-testid={testId}>
      {Icon && <Icon size={48} className="text-[hsl(var(--muted-foreground))] mb-4" />}
      <p className="text-lg font-semibold" style={{ fontWeight: 600 }}>{title}</p>
      {description && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 max-w-xs">{description}</p>}
    </div>
  );
}
