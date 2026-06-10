import type { ReactNode } from 'react';
import type { ViewMode } from './types';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex shrink-0 rounded-md border border-ledger-200 bg-surface p-0.5"
      role="group"
      aria-label="View mode"
    >
      <ToggleButton active={value === 'table'} onClick={() => onChange('table')} label="Table view">
        <TableIcon />
      </ToggleButton>
      <ToggleButton active={value === 'card'} onClick={() => onChange('card')} label="Card view">
        <CardIcon />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded px-2 transition-colors ${
        active
          ? 'bg-ledger-100 text-ledger-900'
          : 'text-ledger-700 hover:bg-ledger-50 hover:text-ledger-900'
      }`}
    >
      {children}
    </button>
  );
}

function TableIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="6" rx="1" />
      <rect x="3" y="13" width="18" height="6" rx="1" />
    </svg>
  );
}
