import { ChevronDown } from 'lucide-react';

export default function Select({ label, value, onChange, options, placeholder = 'Selecciona...', disabled, error, testId }) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">{label}</span>}
      <div className="relative">
        <select
          data-testid={testId}
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[56px] pl-4 pr-10 rounded-[16px] bg-[hsl(var(--input))] text-foreground
            outline-none border appearance-none text-base
            ${error ? 'border-destructive' : 'border-transparent focus:border-primary'}
            ${disabled ? 'opacity-50' : ''} ${value ? '' : 'text-[hsl(var(--muted-foreground))]'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-foreground bg-[hsl(var(--card))]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] pointer-events-none" />
      </div>
      {error && <span className="block text-sm text-destructive mt-1.5">{error}</span>}
    </label>
  );
}
