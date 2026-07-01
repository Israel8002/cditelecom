import { Search } from 'lucide-react';

export default function SearchBox({ value, onChange, placeholder = 'Buscar...', testId }) {
  return (
    <div className="relative">
      <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
      <input
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[56px] pl-12 pr-4 rounded-[16px] bg-[hsl(var(--input))] text-foreground
          placeholder:text-[hsl(var(--muted-foreground))] outline-none border border-transparent
          focus:border-primary transition-colors text-base"
      />
    </div>
  );
}
