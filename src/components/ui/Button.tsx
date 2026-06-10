import type { ButtonHTMLAttributes } from 'react';

const styles = {
  primary: 'bg-terracotta-500 text-white hover:bg-terracotta-600',
  secondary: 'border border-ledger-200 bg-surface text-ledger-900 hover:bg-ledger-100',
  ghost: 'text-ledger-700 hover:bg-ledger-100',
};

const sizes = {
  md: 'min-h-11 px-4 text-sm',
  sm: 'min-h-9 px-3 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
