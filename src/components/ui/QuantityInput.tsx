import { useState, type InputHTMLAttributes } from 'react';
import { Input } from './Input';

type QuantityInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export function QuantityInput({ value, onChange, min = 0, onBlur, onFocus, ...props }: QuantityInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const displayValue = focused ? draft : String(value ?? 0);

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onFocus={(e) => {
        setFocused(true);
        setDraft(String(value ?? 0));
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        const parsed = parseInt(draft, 10);
        const next =
          draft === '' || Number.isNaN(parsed)
            ? Math.max(min, value ?? 0)
            : Math.max(min, parsed);
        onChange(next);
        onBlur?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setDraft(raw);
        if (raw !== '') {
          onChange(Math.max(min, parseInt(raw, 10) || 0));
        }
      }}
    />
  );
}
