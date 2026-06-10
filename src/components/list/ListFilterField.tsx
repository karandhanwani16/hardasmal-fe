import type { ReactNode } from 'react';
import { FieldLabel, Input, Select } from '../ui/Input';

interface ListFilterFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

export function ListFilterField({ label, htmlFor, children, className = '' }: ListFilterFieldProps) {
  return (
    <div className={`min-w-[8rem] flex-1 sm:max-w-[12rem] ${className}`}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function ListFilterSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11">
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}

export function ListFilterInput({
  id,
  type = 'text',
  value,
  onChange,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11"
    />
  );
}
