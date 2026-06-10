import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListFilterField, ListFilterSelect } from '../components/list/ListFilterField';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { DataTable } from '../components/crud/DataTable';
import { CrockeryReturnReceiveModal } from '../components/crockery-returns/CrockeryReturnReceiveModal';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatINR } from '../lib/currency';
import {
  CROCKERY_PENDING_RECEIVE_BUTTON,
  CROCKERY_PENDING_RECEIVE_CARD,
  CROCKERY_PENDING_RECEIVE_TABLE_ROW,
  crockeryReturnStatusVariant,
  isCrockeryAwaitingReceive,
} from '../lib/crockery-return-ui';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedQuery } from '../hooks/usePaginatedQuery';
import type { CrockeryReturn } from '../types';

const RETURN_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partially_returned', label: 'Partially returned' },
  { value: 'fully_returned', label: 'Fully returned' },
  { value: 'fine_applied', label: 'Fine applied' },
];

export function CrockeryReturnsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const list = useListPage({ initialFilters: { status: '' } });
  const [receiveId, setReceiveId] = useState<number | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const { items, meta, isLoading, refetch } = usePaginatedQuery<CrockeryReturn>({
    endpoint: '/crockery-returns',
    queryKey: ['crockery-returns'],
    listParams: list.listParams,
  });

  useEffect(() => {
    const returnId = searchParams.get('return_id');
    if (!returnId) return;

    const id = Number(returnId);
    if (!Number.isFinite(id)) return;

    setReceiveId(id);
    setReceiveOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const openReceive = (row: CrockeryReturn) => {
    setReceiveId(row.id);
    setReceiveOpen(true);
  };

  return (
    <>
      <ListPageLayout
        title="Crockery Returns"
        description="Pending returns after dispatch"
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search order #, customer, or phone"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        activeFilterCount={list.activeFilterCount}
        onClearFilters={list.clearFilters}
        meta={meta}
        page={list.page}
        perPage={list.perPage}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        isLoading={isLoading}
        filtersSlot={
          <ListFilterField label="Status" htmlFor="ret-status">
            <ListFilterSelect
              id="ret-status"
              value={list.filters.status}
              onChange={(v) => list.setFilter('status', v)}
              placeholder="All statuses"
              options={RETURN_STATUS_OPTIONS}
            />
          </ListFilterField>
        }
      >
        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage="No crockery returns pending."
          columns={[
            {
              key: 'order',
              header: 'Order',
              render: (r) => r.order?.order_number ?? `#${r.order_id}`,
              mono: true,
              cardPrimary: true,
            },
            { key: 'customer', header: 'Customer', render: (r) => r.customer?.name ?? '—' },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <Badge
                  label={r.return_status.replace(/_/g, ' ')}
                  variant={crockeryReturnStatusVariant(r)}
                />
              ),
            },
            {
              key: 'fine',
              header: 'Fine',
              render: (r) => formatINR(r.total_fine),
              mono: true,
            },
          ]}
          rowClassName={(row) =>
            isCrockeryAwaitingReceive(row)
              ? list.viewMode === 'card'
                ? CROCKERY_PENDING_RECEIVE_CARD
                : CROCKERY_PENDING_RECEIVE_TABLE_ROW
              : undefined
          }
          actions={(row) => {
            const awaitingReceive = isCrockeryAwaitingReceive(row);
            return (
              <Button
                type="button"
                variant={awaitingReceive ? 'primary' : 'secondary'}
                size={awaitingReceive ? 'md' : 'sm'}
                className={
                  awaitingReceive ? CROCKERY_PENDING_RECEIVE_BUTTON : 'min-h-9 px-3 text-xs'
                }
                onClick={() => openReceive(row)}
              >
                {row.fine_applied ? 'View' : 'Receive'}
              </Button>
            );
          }}
        />
      </ListPageLayout>

      <CrockeryReturnReceiveModal
        returnId={receiveId}
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        onSaved={() => refetch()}
      />
    </>
  );
}
