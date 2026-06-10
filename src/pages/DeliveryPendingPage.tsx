import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../components/crud/DataTable';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { DispatchOrderModal } from '../components/orders/DispatchOrderModal';
import { OrderFormModal } from '../components/orders/OrderFormModal';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { Badge } from '../components/ui/Badge';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import api from '../lib/api';
import { unwrapOne } from '../lib/api-helpers';
import { formatINR } from '../lib/currency';
import { buildReceiptDataFromOrder } from '../lib/order-receipt';
import type { Order } from '../types';
import type { OrderReceiptData } from '../lib/order-receipt';

function canEdit(order: Order): boolean {
  return order.order_status === 'pending' || order.order_status === 'confirmed';
}

function canDelete(order: Order): boolean {
  const fullyCleared =
    order.payment_status === 'paid' && Number(order.remaining_amount) <= 0;

  if (fullyCleared) {
    return true;
  }

  return (
    (order.order_status === 'pending' || order.order_status === 'confirmed') &&
    Number(order.advance_paid) <= 0
  );
}

function canDispatch(order: Order): boolean {
  return order.order_status === 'confirmed' || order.order_status === 'pending';
}

export function DeliveryPendingPage() {
  const queryClient = useQueryClient();
  const list = useListPage({
    initialFilters: { dispatch_pending: '1' },
  });

  const { items, meta, isLoading, remove, isDeleting, refetch } = usePaginatedCrud<Order>({
    endpoint: '/orders',
    queryKey: ['orders', 'delivery-pending'],
    listParams: list.listParams,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatching, setDispatching] = useState<Order | null>(null);
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

  const invalidateOrderLists = async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    refetch();
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
    { key: 'amount', header: 'Amount', render: (r: Order) => formatINR(r.final_amount), mono: true },
    {
      key: 'status',
      header: 'Status',
      render: (r: Order) => (
        <Badge label={r.order_status.replace(/_/g, ' ')} variant={r.order_status === 'confirmed' ? 'paid' : 'pending'} />
      ),
    },
  ];

  return (
    <>
      <ListPageLayout
        title="Delivery"
        description="Orders waiting to be dispatched to the customer"
        actionLabel="New order"
        onAdd={openCreate}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search customer, phone, or order #"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
        activeFilterCount={0}
        meta={meta}
        page={list.page}
        perPage={list.perPage}
        onPageChange={list.setPage}
        onPerPageChange={list.setPerPage}
        isLoading={isLoading}
      >
        <DataTable
          viewMode={list.viewMode}
          isLoading={isLoading}
          rows={items}
          rowKey={(r) => r.id}
          columns={columns}
          emptyMessage="No orders waiting to dispatch. Create a new order to get started."
          actions={(row) => (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canDispatch(row) && (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-terracotta-600 hover:underline"
                  onClick={() => {
                    setDispatching(row);
                    setDispatchOpen(true);
                  }}
                >
                  Dispatch
                </button>
              )}
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
          invalidateOrderLists();
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

      <DispatchOrderModal
        open={dispatchOpen}
        order={dispatching}
        onClose={() => setDispatchOpen(false)}
        onDispatched={async () => {
          await invalidateOrderLists();
          if (dispatching) {
            openReceipt(dispatching);
          }
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
