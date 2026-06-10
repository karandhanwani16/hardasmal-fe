import type { ReactNode } from 'react';
import { DataCardList } from '../list/DataCardList';
import { renderColumnCell, type Column, type ViewMode } from '../list/types';

export type { Column } from '../list/types';

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  actions?: (row: T) => ReactNode;
  viewMode?: ViewMode;
  cardGridClassName?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  rowClassName?: (row: T) => string | undefined;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records yet.',
  isLoading,
  actions,
  viewMode = 'table',
  cardGridClassName,
  sortBy,
  sortDir,
  onSort,
  rowClassName,
}: DataTableProps<T>) {
  if (viewMode === 'card') {
    return (
      <DataCardList
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        actions={actions}
        gridClassName={cardGridClassName}
        rowClassName={rowClassName}
      />
    );
  }

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

  return (
    <div className="overflow-x-auto rounded-lg border border-ledger-200 bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ledger-200 text-left text-xs text-ledger-700">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
                {onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ledger-900"
                  >
                    {col.header}
                    {sortBy === col.key ? (
                      <span className="font-mono text-[10px] text-ledger-700">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    ) : null}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className={`border-b border-ledger-100 last:border-0 hover:bg-ledger-100 ${rowClassName?.(row) ?? ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${col.mono ? 'font-mono' : ''} ${col.className ?? ''}`}
                >
                  {renderColumnCell(col, row)}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
