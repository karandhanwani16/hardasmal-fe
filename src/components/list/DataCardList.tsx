import type { ReactNode } from 'react';
import { renderColumnCell, type Column } from './types';

interface DataCardListProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  actions?: (row: T) => ReactNode;
  /** Tailwind grid classes for the card layout. */
  gridClassName?: string;
  rowClassName?: (row: T) => string | undefined;
}

export function DataCardList<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records yet.',
  isLoading,
  actions,
  gridClassName = 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
  rowClassName,
}: DataCardListProps<T>) {
  if (isLoading) {
    return <p className="text-sm text-ledger-700">Loading…</p>;
  }

  if (!rows.length) {
    return (
      <p className="rounded-md border border-dashed border-ledger-200 bg-surface px-4 py-8 text-center text-sm text-ledger-700">
        {emptyMessage}
      </p>
    );
  }

  const visibleColumns = columns.filter((c) => !c.hideInCard);
  const primaryCol =
    visibleColumns.find((c) => c.cardPrimary) ?? visibleColumns[0];
  const detailColumns = visibleColumns.filter((c) => c.key !== primaryCol?.key);

  return (
    <div className={gridClassName}>
      {rows.map((row) => (
        <article
          key={rowKey(row)}
          className={`flex flex-col rounded-lg border border-ledger-200 bg-surface p-4 shadow-sm ${rowClassName?.(row) ?? ''}`}
        >
          {primaryCol ? (
            <header className="mb-3 border-b border-ledger-100 pb-2">
              <div className={`text-sm font-medium ${primaryCol.mono ? 'font-mono' : ''}`}>
                {renderColumnCell(primaryCol, row)}
              </div>
            </header>
          ) : null}

          <dl className="flex-1 space-y-2">
            {detailColumns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-xs font-medium text-ledger-700">{col.header}</dt>
                <dd
                  className={`min-w-0 text-right text-sm ${col.mono ? 'font-mono' : ''} ${col.className ?? ''}`}
                >
                  {renderColumnCell(col, row)}
                </dd>
              </div>
            ))}
          </dl>

          {actions ? (
            <footer className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-ledger-100 pt-3">
              {actions(row)}
            </footer>
          ) : null}
        </article>
      ))}
    </div>
  );
}
