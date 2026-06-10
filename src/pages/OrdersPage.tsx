import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/crud/DataTable';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListFilterField, ListFilterInput, ListFilterSelect } from '../components/list/ListFilterField';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { OrderFormModal } from '../components/orders/OrderFormModal';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { Badge } from '../components/ui/Badge';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import api from '../lib/api';
import { unwrapOne } from '../lib/api-helpers';
import { formatINR, parseAmount } from '../lib/currency';
import { buildReceiptDataFromOrder } from '../lib/order-receipt';
import type { Order } from '../types';
import type { OrderReceiptData } from '../lib/order-receipt';

const LOCKED_STATUSES = ['dispatched', 'delivered', 'completed'];

const ORDER_STATUS_OPTIONS = [
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function canEdit(order: Order): boolean {
  return !LOCKED_STATUSES.includes(order.order_status);
}

function canDelete(order: Order): boolean {
  const fullyCleared =
    order.payment_status === 'paid' && Number(order.remaining_amount) <= 0;

  if (fullyCleared) {
    return true;
  }

  return (
    !LOCKED_STATUSES.includes(order.order_status) &&
    Number(order.advance_paid) <= 0
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useListPage({
    initialFilters: { dispatched_only: '1', status: '', event_date_from: '', event_date_to: '' },
  });

  const { items, meta, isLoading, remove, isDeleting, refetch } = usePaginatedCrud<Order>({
    endpoint: '/orders',
    queryKey: ['orders', 'dispatched'],
    listParams: list.listParams,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptData, setReceiptData] = useState<OrderReceiptData | null>(null);

  const receiptDetailQuery = useQuery({
    queryKey: ['orders', receiptOrder?.id, 'receipt'],
    enabled: receiptOpen && !!receiptOrder?.id,
    queryFn: async () => {
      const { data } = await api.get(`/orders/${receiptOrder!.id}`);
      return unwrapOne<Order>(data);
    },
  });

  const openReceipt = (order: Order) => {
    setReceiptOrder(order);
    setReceiptData(buildReceiptDataFromOrder(order, [], []));
    setReceiptOpen(true);
  };

  useEffect(() => {
    if (receiptDetailQuery.data) {
      setReceiptData(buildReceiptDataFromOrder(receiptDetailQuery.data, [], []));
    }
  }, [receiptDetailQuery.data]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditing(order);
    setFormOpen(true);
  };

  const columns = [
    { key: 'order_number', header: 'Order #', render: (r: Order) => r.order_number, mono: true, cardPrimary: true },
    { key: 'customer', header: 'Customer', render: (r: Order) => r.customer?.name ?? '—' },
    {
      key: 'event',
      header: 'Event',
      render: (r: Order) => (
        <>
          {r.event_date} · <span className="capitalize">{r.meal_type}</span>
        </>
      ),
    },
    { key: 'persons', header: 'Persons', render: (r: Order) => r.number_of_persons, mono: true },
    {
      key: 'amount',
      header: 'Amount',
      render: (r: Order) => {
        const fine = parseAmount(r.fine_amount ?? '0');
        return (
          <span className="inline-flex flex-col gap-0.5">
            <span className="font-mono">{formatINR(r.final_amount)}</span>
            {fine > 0 ? (
              <span className="text-xs font-normal text-ledger-600">
                incl. {formatINR(fine)} fine
              </span>
            ) : null}
          </span>
        );
      },
      mono: true,
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (r: Order) => <Badge label={r.payment_status} variant={r.payment_status} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Order) => (
        <Badge
          label={r.order_status}
          variant={r.order_status === 'dispatched' ? 'dispatched' : 'pending'}
        />
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Orders"
        description="Dispatched and completed catering orders"
        actionLabel="New order"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search customer, phone, or order #"
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
          <>
            <ListFilterField label="Status" htmlFor="ord-status">
              <ListFilterSelect
                id="ord-status"
                value={list.filters.status}
                onChange={(v) => list.setFilter('status', v)}
                placeholder="All statuses"
                options={ORDER_STATUS_OPTIONS}
              />
            </ListFilterField>
            <ListFilterField label="Event from" htmlFor="ord-from">
              <ListFilterInput
                id="ord-from"
                type="date"
                value={list.filters.event_date_from}
                onChange={(v) => list.setFilter('event_date_from', v)}
              />
            </ListFilterField>
            <ListFilterField label="Event to" htmlFor="ord-to">
              <ListFilterInput
                id="ord-to"
                type="date"
                value={list.filters.event_date_to}
                onChange={(v) => list.setFilter('event_date_to', v)}
              />
            </ListFilterField>
          </>
        }
      >
        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage="No dispatched orders yet. New orders appear under Delivery until dispatched."
          columns={columns}
          actions={(row) => (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-ledger-700 hover:underline"
                onClick={() => openReceipt(row)}
              >
                Receipt
              </button>
              <RowActions
                onEdit={canEdit(row) ? () => openEdit(row) : undefined}
                onDelete={
                  canDelete(row)
                    ? () => {
                        setDeleting(row);
                        setDeleteOpen(true);
                      }
                    : undefined
                }
              />
            </div>
          )}
        />
      </ListPageLayout>

      <OrderFormModal
        open={formOpen}
        order={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          if (editing) {
            refetch();
            return;
          }
          void queryClient.invalidateQueries({ queryKey: ['orders'] });
          navigate('/delivery-pending');
        }}
      />

      <OrderReceiptModal
        open={receiptOpen}
        data={receiptData}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptOrder(null);
          setReceiptData(null);
        }}
      />

      <DeleteConfirm
        open={deleteOpen}
        title="Delete order"
        message={
          deleting &&
          deleting.payment_status === 'paid' &&
          Number(deleting.remaining_amount) <= 0
            ? `Delete cleared bill ${deleting.order_number} and its linked payment record? This cannot be undone.`
            : `Delete order ${deleting?.order_number}? This cannot be undone.`
        }
        onClose={() => setDeleteOpen(false)}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
          await queryClient.invalidateQueries({ queryKey: ['customers'] });
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
