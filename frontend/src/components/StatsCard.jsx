import Card from './Card';

export default function StatsCard({ label, value, accent = false, testId }) {
  return (
    <Card padding="p-4" testId={testId} className="h-full">
      <p className={`text-2xl font-bold ${accent ? 'text-primary' : 'text-foreground'}`} style={{ fontWeight: 700 }}>
        {value}
      </p>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 leading-tight">{label}</p>
    </Card>
  );
}
