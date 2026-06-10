import type { ReactNode } from 'react';
import { PER_PAGE_OPTIONS, type ListMeta } from '../../lib/pagination';

interface PaginationBarProps {
  meta: ListMeta | undefined;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
}

export function PaginationBar({
  meta,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  isLoading,
}: PaginationBarProps) {
  if (!meta || meta.total === 0) return null;

  const { last_page: lastPage, total, from, to } = meta;
  const canPrev = page > 1;
  const canNext = page < lastPage;

  return (
    <nav
      className="mt-4 flex flex-col gap-3 border-t border-ledger-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-xs text-ledger-700">
        {isLoading ? (
          'Loading…'
        ) : (
          <>
            Showing{' '}
            <span className="font-mono text-ledger-900">{from ?? 0}</span>
            {' – '}
            <span className="font-mono text-ledger-900">{to ?? 0}</span>
            {' of '}
            <span className="font-mono text-ledger-900">{total}</span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ledger-700">
          <span className="sr-only sm:not-sr-only">Per page</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="min-h-9 rounded-md border border-ledger-200 bg-surface px-2 py-1 text-sm focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            aria-label="Rows per page"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <PageButton disabled={!canPrev || isLoading} onClick={() => onPageChange(page - 1)} label="Previous page">
            Prev
          </PageButton>
          <span className="min-w-[4.5rem] px-2 text-center text-xs font-mono text-ledger-900">
            {page} / {lastPage}
          </span>
          <PageButton disabled={!canNext || isLoading} onClick={() => onPageChange(page + 1)} label="Next page">
            Next
          </PageButton>
        </div>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
  label,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="min-h-9 rounded-md border border-ledger-200 bg-surface px-3 text-xs font-medium text-ledger-900 transition-colors hover:bg-ledger-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
