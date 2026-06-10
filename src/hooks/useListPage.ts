import { useCallback, useEffect, useState } from 'react';
import type { ViewMode } from '../components/list/types';
import { useDebounce } from './useDebounce';

const VIEW_MODE_KEY = 'cms_list_view_mode';

function readStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'table';
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  if (stored === 'card' || stored === 'table') return stored;
  return window.matchMedia('(max-width: 1023px)').matches ? 'card' : 'table';
}

export interface UseListPageOptions {
  initialFilters?: Record<string, string>;
  defaultPerPage?: number;
  debounceMs?: number;
}

export function useListPage({
  initialFilters = {},
  defaultPerPage = 20,
  debounceMs = 350,
}: UseListPageOptions = {}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFiltersState] = useState<Record<string, string>>(initialFilters);
  const [viewMode, setViewModeState] = useState<ViewMode>(readStoredViewMode);

  const debouncedSearch = useDebounce(searchInput, debounceMs);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const setFilters = useCallback((next: Record<string, string>) => {
    setFiltersState(next);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setPage(1);
  }, [initialFilters]);

  const handlePerPageChange = useCallback((next: number) => {
    setPerPage(next);
    setPage(1);
  }, []);

  const listParams = {
    page,
    perPage,
    search: debouncedSearch,
    filters,
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== '' && value !== (initialFilters[key] ?? ''),
  ).length;

  return {
    page,
    setPage,
    perPage,
    setPerPage: handlePerPageChange,
    searchInput,
    setSearchInput,
    debouncedSearch,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    viewMode,
    setViewMode,
    listParams,
  };
}
