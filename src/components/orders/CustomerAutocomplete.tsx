import { useEffect, useId, useRef, useState } from 'react';
import { FieldLabel, Input, Textarea } from '../ui/Input';
import { useCustomerSearch } from '../../hooks/useCustomerSearch';
import { useDebounce } from '../../hooks/useDebounce';
import type { Customer } from '../../types';

export type CustomerFields = {
  phone: string;
  name: string;
  address: string;
};

interface CustomerAutocompleteProps {
  customer: CustomerFields;
  customerId: number | null;
  onCustomerChange: (fields: CustomerFields) => void;
  onCustomerIdChange: (id: number | null) => void;
  onAddressSuggest?: (address: string) => void;
  /** Hide billing address — order form collects venue separately. */
  showAddress?: boolean;
}

function customerSearchQuery(fields: CustomerFields): string {
  const phone = fields.phone.trim();
  if (phone.length >= 2) return phone;
  return fields.name.trim();
}

export function CustomerAutocomplete({
  customer,
  customerId,
  onCustomerChange,
  onCustomerIdChange,
  onAddressSuggest,
  showAddress = true,
}: CustomerAutocompleteProps) {
  const searchTerm = customerSearchQuery(customer);
  const debouncedTerm = useDebounce(searchTerm, 400);
  const searchQuery = useCustomerSearch(searchTerm);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const phoneId = useId();
  const nameId = useId();

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const suggestions = searchQuery.data ?? [];
  const canSearch = debouncedTerm.length >= 2;
  const showList = open && canSearch && suggestions.length > 0 && !customerId;
  const isPendingSearch = searchTerm !== debouncedTerm && searchTerm.length >= 2;
  const showSearching = (isPendingSearch || searchQuery.isFetching) && !customerId && searchTerm.length >= 2;

  const selectCustomer = (c: Customer) => {
    onCustomerIdChange(c.id);
    onCustomerChange({
      phone: c.phone,
      name: c.name,
      address: c.address ?? '',
    });
    if (c.address) onAddressSuggest?.(c.address);
    setOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const clearLink = () => {
    onCustomerIdChange(null);
    setOpen(true);
  };

  return (
    <div ref={wrapRef} className="space-y-4">
      <div className="relative">
        <FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
        <Input
          id={phoneId}
          type="tel"
          inputMode="tel"
          value={customer.phone}
          onChange={(e) => {
            onCustomerIdChange(null);
            onCustomerChange({ ...customer, phone: e.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="10-digit mobile"
          required
          autoComplete="tel"
          className="font-mono"
        />
        {showSearching && (
          <p className="mt-1 text-xs text-ledger-700" aria-live="polite">
            Searching…
          </p>
        )}
        {customerId && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs">
            <span className="text-paid">Existing customer linked</span>
            <button
              type="button"
              className="min-h-11 text-ledger-700 underline-offset-2 hover:text-ledger-900 hover:underline"
              onClick={clearLink}
            >
              Change customer
            </button>
          </p>
        )}
        {showList && (
          <ul
            className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-ledger-200 bg-surface py-1 shadow-sm"
            role="listbox"
            aria-label="Customer matches"
          >
            {suggestions.map((c) => (
              <li key={c.id} role="option">
                <button
                  type="button"
                  className="min-h-11 w-full px-3 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-ledger-50 focus-visible:bg-ledger-50 focus-visible:outline-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectCustomer(c)}
                >
                  <span className="block text-sm font-medium text-ledger-900">{c.name}</span>
                  <span className="font-mono text-xs text-ledger-700">{c.phone}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {!customerId && canSearch && !showSearching && open && suggestions.length === 0 && searchQuery.isFetched && (
          <p className="mt-1 text-xs text-ledger-700">No match — a new customer will be created on save.</p>
        )}
      </div>

      <div>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <Input
          id={nameId}
          value={customer.name}
          onChange={(e) => {
            onCustomerIdChange(null);
            onCustomerChange({ ...customer, name: e.target.value });
            if (customer.phone.trim().length < 2) setOpen(true);
          }}
          onFocus={() => {
            if (customer.phone.trim().length < 2) setOpen(true);
          }}
          placeholder="Customer or host name"
          required
          autoComplete="name"
        />
        {customer.phone.trim().length < 2 && (
          <p className="mt-1 text-xs text-ledger-600">Type at least 2 characters in phone or name to search.</p>
        )}
      </div>

      {showAddress ? (
        <div>
          <FieldLabel htmlFor="ord-address">Address</FieldLabel>
          <Textarea
            id="ord-address"
            value={customer.address}
            onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
            placeholder="Billing or default address"
            rows={2}
          />
        </div>
      ) : null}
    </div>
  );
}
