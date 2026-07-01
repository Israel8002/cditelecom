import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';
import Input from '../Input';
import { appConfig } from '../../catalogs/appConfig';

// Renderiza una pregunta del catálogo según su tipo. No conoce ninguna pregunta concreta.
export default function QuestionView({ question, value, onAnswer, onNext }) {
  const [local, setLocal] = useState(value ?? '');
  useEffect(() => { setLocal(value ?? ''); }, [question.id, value]);

  const isOptionType = question.tipo === 'radio' || question.tipo === 'select';

  const handleOption = (opt) => {
    onAnswer(opt);
    setLocal(opt);
    // Guardar y avanzar automáticamente.
    setTimeout(() => onNext(), appConfig.autoAdvanceMs);
  };

  return (
    <div className="px-6 pt-4 flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-tight" style={{ fontWeight: 700 }}>{question.titulo}</h2>
        {question.descripcion && (
          <p className="text-[hsl(var(--muted-foreground))] mt-2">{question.descripcion}</p>
        )}
      </div>

      {isOptionType && (
        <div className="flex flex-col gap-3">
          {question.opciones.map((opt) => {
            const selected = local === opt;
            return (
              <motion.button
                key={opt} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}
                data-testid={`option-${question.id}-${opt}`}
                onClick={() => handleOption(opt)}
                className={`min-h-[64px] px-6 rounded-[18px] text-lg font-semibold text-left transition-colors
                  ${selected ? 'bg-primary text-primary-foreground' : 'bg-[hsl(var(--card))] text-foreground'}`}
                style={{ fontWeight: 600 }}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      )}

      {question.tipo === 'number' && (
        <div className="flex flex-col gap-6">
          <Input
            type="number" inputMode="numeric" value={local}
            placeholder={question.placeholder} testId={`input-${question.id}`}
            onChange={(v) => { setLocal(v); onAnswer(v === '' ? '' : Number(v)); }}
          />
          <Button testId="question-next-btn" onClick={onNext}>Continuar</Button>
        </div>
      )}

      {(question.tipo === 'text' || question.tipo === 'textarea') && (
        <div className="flex flex-col gap-6">
          <textarea
            data-testid={`input-${question.id}`}
            value={local}
            placeholder={question.placeholder}
            onChange={(e) => { setLocal(e.target.value); onAnswer(e.target.value); }}
            rows={question.tipo === 'textarea' ? 8 : 2}
            className="w-full px-4 py-3 rounded-[16px] bg-[hsl(var(--input))] text-foreground
              placeholder:text-[hsl(var(--muted-foreground))] outline-none border border-transparent
              focus:border-primary transition-colors text-base resize-none"
          />
          <Button testId="question-next-btn" onClick={onNext}>Continuar</Button>
        </div>
      )}
    </div>
  );
}
