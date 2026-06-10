interface CrockeryRequiredToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CrockeryRequiredToggle({ checked, onChange, disabled }: CrockeryRequiredToggleProps) {
  const id = 'ord-crockery-required';

  return (
    <div className="rounded-md border border-ledger-200 bg-surface px-4 py-3">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-ledger-900">
            Crockery required
          </label>
          <p className="mt-0.5 text-sm text-ledger-700">
            Enable to add crockery lines and security for this order.
          </p>
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-600 disabled:cursor-not-allowed disabled:opacity-50 ${
            checked
              ? 'border-terracotta-600 bg-terracotta-600'
              : 'border-ledger-300 bg-ledger-100'
          }`}
        >
          <span className="sr-only">{checked ? 'Crockery required on' : 'Crockery required off'}</span>
          <span
            aria-hidden
            className={`pointer-events-none absolute top-0.5 size-6 rounded-full bg-surface shadow-sm transition-transform duration-150 ease-out ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
