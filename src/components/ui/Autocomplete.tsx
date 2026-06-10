import { useEffect, useId, useRef, useState } from 'react';
import { Input } from './Input';

interface AutocompleteProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  isLoading?: boolean;
  placeholder?: string;
  required?: boolean;
  onSelect?: (value: string) => void;
}

export function Autocomplete({
  id,
  label,
  value,
  onChange,
  suggestions,
  isLoading,
  placeholder,
  required,
  onSelect,
}: AutocompleteProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-ledger-700">
        {label}
      </label>
      <Input
        id={inputId}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={showList ? listId : undefined}
        aria-expanded={showList}
      />
      {isLoading && <p className="mt-1 text-xs text-ledger-700">Loading…</p>}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[60] mt-1 max-h-40 w-full overflow-auto rounded-md border border-ledger-200 bg-surface py-1 shadow-sm"
        >
          {suggestions.map((s) => (
            <li key={s} role="option">
              <button
                type="button"
                className="min-h-11 w-full px-3 py-2.5 text-left text-sm hover:bg-ledger-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s);
                  onSelect?.(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
