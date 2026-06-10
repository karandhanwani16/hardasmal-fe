import { useState, type InputHTMLAttributes } from 'react';
import { formatAmountInput, parseAmount } from '../../lib/currency';
import { Input } from './Input';

type CurrencyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
};

export function CurrencyInput({ value, onChange, onBlur, onFocus, ...props }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  const displayValue = focused ? draft : formatAmountInput(value);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={(e) => {
        setFocused(true);
        setDraft(value === '0' || value === '0.00' ? '' : String(parseAmount(value)));
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        const parsed = parseAmount(draft);
        onChange(String(parsed));
        onBlur?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
        setDraft(raw);
        onChange(raw === '' ? '0' : String(parseAmount(raw)));
      }}
    />
  );
}
