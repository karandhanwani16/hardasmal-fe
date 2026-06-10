import type { ReactNode } from 'react';

export type ViewMode = 'table' | 'card';

export interface Column<T> {
  key: string;
  header: string;
  /** Defaults to stringifying row[key] when omitted (e.g. report columns). */
  render?: (row: T) => ReactNode;
  className?: string;
  mono?: boolean;
  /** Shown as card title in card view (defaults to first column). */
  cardPrimary?: boolean;
  /** Hidden in card view to reduce noise. */
  hideInCard?: boolean;
}

export function renderColumnCell<T>(col: Column<T>, row: T): ReactNode {
  if (col.render) return col.render(row);
  const value = (row as Record<string, unknown>)[col.key];
  return value == null || value === '' ? '—' : String(value);
}
