import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FieldLabel, Input } from '../ui/Input';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../lib/api';
import { unwrapOne } from '../../lib/api-helpers';
import type { Customer } from '../../types';

interface CustomerSearchPickerProps {
  id?: string;
  label?: string;
  customerId: number | null;
  onCustomerIdChange: (id: number | null) => void;
  required?: boolean;
  placeholder?: string;
  hideLabel?: boolean;
}

export function CustomerSearchPicker({
  id,
  label = 'Customer',
  customerId,
  onCustomerIdChange,
  required,
  placeholder = 'Search by name or phone',
  hideLabel = false,
}: CustomerSearchPickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query.trim(), 400);
  const searchQuery = useCustomerSearch(query, !customerId);

  const detailQuery = useQuery({
    queryKey: ['customers', customerId, 'picker'],
    enabled: customerId !== null,
    queryFn: async () => {
      const { data } = await api.get(`/customers/${customerId}`);
      return unwrapOne<Customer>(data);
    },
  });

  const selectedCustomer = detailQuery.data;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!customerId) setQuery('');
  }, [customerId]);

  const suggestions = searchQuery.data ?? [];
  const canSearch = debouncedQuery.length >= 2;
  const showList = open && canSearch && suggestions.length > 0 && !customerId;
  const showSearching =
    (query.trim() !== debouncedQuery || searchQuery.isFetching) &&
    !customerId &&
    query.trim().length >= 2;

  const selectCustomer = (customer: Customer) => {
    onCustomerIdChange(customer.id);
    setQuery('');
    setOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const clearSelection = () => {
    onCustomerIdChange(null);
    setQuery('');
    setOpen(true);
  };

  if (customerId) {
    return (
      <div>
        {!hideLabel ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
        <div className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-ledger-200 bg-ledger-50/50 px-3 py-2">
          {detailQuery.isLoading ? (
            <p className="text-sm text-ledger-600">Loading customer…</p>
          ) : selectedCustomer ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ledger-900">{selectedCustomer.name}</p>
              <p className="font-mono text-xs text-ledger-700">{selectedCustomer.phone}</p>
            </div>
          ) : (
            <p className="text-sm text-ledger-600">Customer #{customerId}</p>
          )}
          <button
            type="button"
            className="shrink-0 text-xs text-ledger-700 underline-offset-2 hover:text-ledger-900 hover:underline"
            onClick={clearSelection}
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      {!hideLabel ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <Input
        id={inputId}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
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
      {showSearching ? (
        <p className="mt-1 text-xs text-ledger-700" aria-live="polite">
          Searching…
        </p>
      ) : null}
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Customer matches"
          className="absolute z-[60] mt-1 max-h-52 w-full overflow-auto rounded-md border border-ledger-200 bg-surface py-1 shadow-sm"
        >
          {suggestions.map((customer) => (
            <li key={customer.id} role="option">
              <button
                type="button"
                className="min-h-11 w-full px-3 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-ledger-50 focus-visible:bg-ledger-50 focus-visible:outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCustomer(customer)}
              >
                <span className="block text-sm font-medium text-ledger-900">{customer.name}</span>
                <span className="font-mono text-xs text-ledger-700">{customer.phone}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {canSearch && !showSearching && open && suggestions.length === 0 && searchQuery.isFetched ? (
        <p className="mt-1 text-xs text-ledger-700">No customers found.</p>
      ) : null}
      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="mt-1 text-xs text-ledger-600">Type at least 2 characters to search.</p>
      ) : null}
    </div>
  );
}
