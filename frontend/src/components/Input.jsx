export default function Input({
  label, value, onChange, type = 'text', placeholder, error, testId, inputMode, maxLength, readOnly,
}) {
  return (
    <label className="block">
      {label && <span className="block text-sm text-[hsl(var(--muted-foreground))] mb-2">{label}</span>}
      <input
        data-testid={testId}
        type={type}
        inputMode={inputMode}
        value={value ?? ''}
        maxLength={maxLength}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full min-h-[56px] px-4 rounded-[16px] bg-[hsl(var(--input))] text-foreground
          placeholder:text-[hsl(var(--muted-foreground))] outline-none border
          ${error ? 'border-destructive' : 'border-transparent focus:border-primary'}
          ${readOnly ? 'opacity-70' : ''} transition-colors text-base`}
      />
      {error && <span className="block text-sm text-destructive mt-1.5">{error}</span>}
    </label>
  );
}
