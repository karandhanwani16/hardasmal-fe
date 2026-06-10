import { useId, type InputHTMLAttributes } from 'react';
import { FieldError, FieldLabel } from './Input';

type PinInputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
};

export function PinInput({ id, label, value, onChange, error, autoComplete = 'off' }: PinInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        id={inputId}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        className="field-control h-14 w-full rounded-md border border-ledger-200 bg-surface px-4 text-center font-mono text-2xl tracking-[0.45em] text-ledger-900 focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}
