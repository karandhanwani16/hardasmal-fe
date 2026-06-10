import type { ReactNode } from 'react';
import { Input } from '../ui/Input';
import type { ViewMode } from './types';
import { ViewModeToggle } from './ViewModeToggle';

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filtersSlot?: ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  viewMode,
  onViewModeChange,
  filtersSlot,
  activeFilterCount = 0,
  onClearFilters,
}: ListToolbarProps) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="list-search" className="sr-only">
            Search
          </label>
          <Input
            id="list-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 text-xs text-ledger-700 hover:text-ledger-900"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      </div>

      {filtersSlot ? (
        <div className="flex flex-wrap items-end gap-3">
          {filtersSlot}
          {activeFilterCount > 0 && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="min-h-11 text-xs font-medium text-terracotta-600 hover:underline"
            >
              Clear filters ({activeFilterCount})
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
