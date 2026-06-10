import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const controlClass =
  'field-control h-11 w-full rounded-md border border-ledger-200 bg-surface px-3 text-base text-ledger-900 sm:text-sm focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500';

const textareaClass =
  'field-control field-textarea min-h-[80px] w-full resize-y rounded-md border border-ledger-200 bg-surface px-3 py-2 text-base leading-normal text-ledger-900 sm:text-sm focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlClass} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${textareaClass} ${className}`} {...props} />;
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={`${controlClass} field-select ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-ledger-700">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-alert">{message}</p>;
}
