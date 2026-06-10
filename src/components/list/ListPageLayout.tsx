import type { ReactNode } from 'react';
import type { ListMeta } from '../../lib/pagination';
import { PageHeader } from '../crud/PageHeader';
import { FloatingActionButton } from './FloatingActionButton';
import { ListToolbar } from './ListToolbar';
import { PaginationBar } from './PaginationBar';
import type { ViewMode } from './types';

interface ListPageLayoutProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAdd?: () => void;
  headerExtra?: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filtersSlot?: ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  meta: ListMeta | undefined;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
  children: ReactNode;
}

export function ListPageLayout({
  title,
  description,
  actionLabel,
  onAdd,
  headerExtra,
  search,
  onSearchChange,
  searchPlaceholder,
  viewMode,
  onViewModeChange,
  filtersSlot,
  activeFilterCount,
  onClearFilters,
  meta,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  isLoading,
  children,
}: ListPageLayoutProps) {
  return (
    <div className="min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <PageHeader
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAdd}
        hideActionOnMobile
      >
        {headerExtra}
      </PageHeader>

      <ListToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        filtersSlot={filtersSlot}
        activeFilterCount={activeFilterCount}
        onClearFilters={onClearFilters}
      />

      {children}

      <PaginationBar
        meta={meta}
        page={page}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        isLoading={isLoading}
      />

      {actionLabel && onAdd ? <FloatingActionButton label={actionLabel} onClick={onAdd} /> : null}
    </div>
  );
}
