import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CustomerSearchPicker } from '../components/customers/CustomerSearchPicker';
import { DataTable } from '../components/crud/DataTable';
import { DeleteConfirm } from '../components/crud/DeleteConfirm';
import { RowActions } from '../components/crud/RowActions';
import { FormModal } from '../components/crud/FormModal';
import { ListFilterField, ListFilterInput, ListFilterSelect } from '../components/list/ListFilterField';
import { ListPageLayout } from '../components/list/ListPageLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import { FieldError, FieldLabel, Input, Select } from '../components/ui/Input';
import { formatINR, parseAmount } from '../lib/currency';
import { useListPage } from '../hooks/useListPage';
import { usePaginatedCrud } from '../hooks/usePaginatedCrud';
import api from '../lib/api';
import { todayIsoDate, unwrapList } from '../lib/api-helpers';
import type { OutstandingOrder, Payment } from '../types';
import { PAYMENT_MODES } from '../types';

type SharedPaymentFields = {
  customer_id: string;
  payment_mode: string;
  payment_date: string;
  reference_number: string;
  remarks: string;
};

type BillPaymentDraft = {
  amount: string;
  discount: string;
};

const emptyShared: SharedPaymentFields = {
  customer_id: '',
  payment_mode: PAYMENT_MODES[0],
  payment_date: todayIsoDate(),
  reference_number: '',
  remarks: '',
};

const emptyBillDraft: BillPaymentDraft = { amount: '', discount: '' };

const MODE_OPTIONS = [
  { value: '', label: 'All modes' },
  ...PAYMENT_MODES.map((m) => ({ value: m, label: m.replace(/_/g, ' ') })),
];

function paymentStatusLabel(order: OutstandingOrder): string {
  if (order.is_partially_paid || parseAmount(order.advance_paid) > 0) {
    return 'Partially paid';
  }

  return 'Unpaid';
}

function paymentStatusVariant(order: OutstandingOrder): string {
  return order.is_partially_paid || parseAmount(order.advance_paid) > 0 ? 'partial' : 'pending';
}

function restAsDiscount(outstanding: number, amountStr: string): string {
  const amount = parseAmount(amountStr);
  const discount = Math.max(0, outstanding - amount);
  return discount > 0 ? String(discount) : '';
}

function BillPaymentCard({
  order,
  draft,
  onDraftChange,
}: {
  order: OutstandingOrder;
  draft: BillPaymentDraft;
  onDraftChange: (next: BillPaymentDraft) => void;
}) {
  const fine = parseAmount(order.fine_amount ?? '0');
  const paid = parseAmount(order.advance_paid);
  const discountGiven = parseAmount(order.discount_amount ?? '0');
  const amount = parseAmount(draft.amount);
  const discount = parseAmount(draft.discount);

  return (
    <li className="rounded-md border border-ledger-200 bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-medium text-ledger-900">{order.order_number}</span>
            <Badge label={paymentStatusLabel(order)} variant={paymentStatusVariant(order)} />
          </div>
          <p className="text-xs text-ledger-600">
            Event {order.event_date} · Bill {formatINR(order.total_bill_amount)}
            {fine > 0 ? ` + ${formatINR(fine)} fine` : ''} · Total due {formatINR(order.final_amount)}
          </p>
          <p className="text-xs text-ledger-600">
            Received {formatINR(paid)}
            {discountGiven > 0 ? ` · Discount ${formatINR(discountGiven)}` : ''}
            {fine > 0 ? ` · Fine ${formatINR(fine)}` : ''} · Remaining{' '}
            <span className="font-mono text-due">{formatINR(order.outstanding_amount)}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={`bill-amount-${order.id}`}>Amount received</FieldLabel>
          <CurrencyInput
            id={`bill-amount-${order.id}`}
            value={draft.amount}
            onChange={(value) => onDraftChange({ ...draft, amount: value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor={`bill-discount-${order.id}`}>Discount</FieldLabel>
          <CurrencyInput
            id={`bill-discount-${order.id}`}
            value={draft.discount}
            onChange={(value) => onDraftChange({ ...draft, discount: value })}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={() =>
            onDraftChange({
              amount: String(order.outstanding_amount),
              discount: '',
            })
          }
        >
          Pay full {formatINR(order.outstanding_amount)}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="text-xs"
          onClick={() =>
            onDraftChange({
              ...draft,
              discount: restAsDiscount(order.outstanding_amount, draft.amount),
            })
          }
          disabled={!draft.amount}
        >
          Rest as discount
        </Button>
      </div>

      {amount + discount > 0 && (
        <p className="mt-2 text-xs text-ledger-600">
          Applying {formatINR(amount + discount)} to this bill
          {discount > 0 ? ` (${formatINR(amount)} received + ${formatINR(discount)} discount)` : ''}
          {amount + discount < order.outstanding_amount
            ? ` · ${formatINR(order.outstanding_amount - amount - discount)} will remain`
            : ' · bill will be fully cleared'}
        </p>
      )}
    </li>
  );
}

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const list = useListPage({
    initialFilters: {
      customer_id: '',
      payment_mode: '',
      payment_date_from: '',
      payment_date_to: '',
    },
  });

  const { items, meta, isLoading, create, remove, isDeleting } = usePaginatedCrud<Payment>({
    endpoint: '/payments',
    queryKey: ['payments'],
    listParams: list.listParams,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const [shared, setShared] = useState<SharedPaymentFields>(emptyShared);
  const [billDrafts, setBillDrafts] = useState<Record<number, BillPaymentDraft>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const outstandingQuery = useQuery({
    queryKey: ['customers', shared.customer_id, 'outstanding-orders'],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${shared.customer_id}/outstanding-orders`);
      return unwrapList<OutstandingOrder>(data);
    },
    enabled: modalOpen && shared.customer_id !== '',
  });

  const outstandingBills = outstandingQuery.data ?? [];
  const totalOutstanding = outstandingBills.reduce((sum, o) => sum + o.outstanding_amount, 0);

  const updateBillDraft = (orderId: number, next: BillPaymentDraft) => {
    setBillDrafts((current) => ({ ...current, [orderId]: next }));
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setShared({ ...emptyShared, payment_date: todayIsoDate() });
    setBillDrafts({});
    setError('');
  };

  const billsWithPayment = outstandingBills.filter((order) => {
    const draft = billDrafts[order.id] ?? emptyBillDraft;
    return parseAmount(draft.amount) + parseAmount(draft.discount) > 0;
  });

  const handleRecordPayment = async (e: FormEvent) => {
    e.preventDefault();

    if (shared.customer_id === '') {
      setError('Select a customer.');
      return;
    }

    if (billsWithPayment.length === 0) {
      setError('Enter an amount received or discount for at least one bill.');
      return;
    }

    setError('');
    setIsRecording(true);

    try {
      for (const order of billsWithPayment) {
        const draft = billDrafts[order.id] ?? emptyBillDraft;
        await create({
          customer_id: Number(shared.customer_id),
          order_id: order.id,
          amount: parseAmount(draft.amount),
          discount_amount: parseAmount(draft.discount),
          payment_mode: shared.payment_mode,
          payment_date: shared.payment_date,
          reference_number: shared.reference_number.trim() || null,
          remarks: shared.remarks.trim() || null,
        });
      }

      const recordedIds = new Set(billsWithPayment.map((order) => order.id));
      setBillDrafts((current) => {
        const next = { ...current };
        for (const id of recordedIds) {
          delete next[id];
        }
        return next;
      });

      await queryClient.invalidateQueries({
        queryKey: ['customers', shared.customer_id, 'outstanding-orders'],
      });
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });

      if (billsWithPayment.length >= outstandingBills.length) {
        handleModalClose();
      }
    } catch {
      setError('Could not record payment. Check amount, discount, and bill.');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <>
      <ListPageLayout
        title="Payments"
        description="Record payments against individual bills"
        actionLabel="Record payment"
        onAdd={() => {
          setShared({ ...emptyShared, payment_date: todayIsoDate() });
          setBillDrafts({});
          setError('');
          setModalOpen(true);
        }}
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search customer, phone, order #, or reference"
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
            <ListFilterField label="Customer" htmlFor="pay-filter-cust" className="sm:max-w-[16rem]">
              <CustomerSearchPicker
                id="pay-filter-cust"
                hideLabel
                placeholder="Name or phone"
                customerId={list.filters.customer_id ? Number(list.filters.customer_id) : null}
                onCustomerIdChange={(id) => list.setFilter('customer_id', id ? String(id) : '')}
              />
            </ListFilterField>
            <ListFilterField label="Mode" htmlFor="pay-filter-mode">
              <ListFilterSelect
                id="pay-filter-mode"
                value={list.filters.payment_mode}
                onChange={(v) => list.setFilter('payment_mode', v)}
                options={MODE_OPTIONS}
              />
            </ListFilterField>
            <ListFilterField label="From" htmlFor="pay-from">
              <ListFilterInput
                id="pay-from"
                type="date"
                value={list.filters.payment_date_from}
                onChange={(v) => list.setFilter('payment_date_from', v)}
              />
            </ListFilterField>
            <ListFilterField label="To" htmlFor="pay-to">
              <ListFilterInput
                id="pay-to"
                type="date"
                value={list.filters.payment_date_to}
                onChange={(v) => list.setFilter('payment_date_to', v)}
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
          emptyMessage="No payments recorded yet."
          columns={[
            { key: 'customer', header: 'Customer', render: (r) => r.customer?.name ?? '—', cardPrimary: true },
            {
              key: 'bill',
              header: 'Bill',
              render: (r) => r.allocations?.[0]?.order_number ?? '—',
              mono: true,
            },
            { key: 'amount', header: 'Received', render: (r) => formatINR(r.amount), mono: true },
            {
              key: 'discount',
              header: 'Discount',
              render: (r) => {
                const discount = parseAmount(r.allocations?.[0]?.discount_amount ?? '0');
                return discount > 0 ? formatINR(discount) : '—';
              },
              mono: true,
            },
            {
              key: 'mode',
              header: 'Mode',
              render: (r) => r.payment_mode.replace(/_/g, ' '),
            },
            { key: 'date', header: 'Date', render: (r) => r.payment_date, mono: true },
          ]}
          actions={(row) => (
            <RowActions
              onDelete={() => {
                setDeleting(row);
                setDeleteOpen(true);
              }}
            />
          )}
        />
      </ListPageLayout>

      <FormModal
        open={modalOpen}
        title="Record payment"
        onClose={handleModalClose}
        onSubmit={handleRecordPayment}
        isSubmitting={isRecording}
        submitLabel="Done"
      >
        <CustomerSearchPicker
          id="pay-customer"
          customerId={shared.customer_id ? Number(shared.customer_id) : null}
          onCustomerIdChange={(id) => {
            setShared({ ...shared, customer_id: id ? String(id) : '' });
            setBillDrafts({});
            setError('');
          }}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="pay-mode">Mode</FieldLabel>
            <Select
              id="pay-mode"
              value={shared.payment_mode}
              onChange={(e) => setShared({ ...shared, payment_mode: e.target.value })}
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel htmlFor="pay-date">Payment date</FieldLabel>
            <Input
              id="pay-date"
              type="date"
              value={shared.payment_date}
              onChange={(e) => setShared({ ...shared, payment_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="pay-ref">Reference</FieldLabel>
            <Input
              id="pay-ref"
              value={shared.reference_number}
              onChange={(e) => setShared({ ...shared, reference_number: e.target.value })}
            />
          </div>
          <div>
            <FieldLabel htmlFor="pay-remarks">Remarks</FieldLabel>
            <Input
              id="pay-remarks"
              value={shared.remarks}
              onChange={(e) => setShared({ ...shared, remarks: e.target.value })}
            />
          </div>
        </div>

        {shared.customer_id !== '' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ledger-900">Outstanding bills</p>
              {!outstandingQuery.isLoading && outstandingBills.length > 0 && (
                <p className="font-mono text-xs text-ledger-600">Total due · {formatINR(totalOutstanding)}</p>
              )}
            </div>

            {outstandingQuery.isLoading && <p className="text-sm text-ledger-600">Loading bills…</p>}
            {outstandingQuery.isError && <p className="text-sm text-due">Could not load outstanding bills.</p>}
            {!outstandingQuery.isLoading && !outstandingQuery.isError && outstandingBills.length === 0 && (
              <p className="text-sm text-ledger-600">No outstanding bills for this customer.</p>
            )}

            {outstandingBills.length > 0 && (
              <ul className="space-y-3">
                {outstandingBills.map((order) => (
                  <BillPaymentCard
                    key={order.id}
                    order={order}
                    draft={billDrafts[order.id] ?? emptyBillDraft}
                    onDraftChange={(next) => updateBillDraft(order.id, next)}
                  />
                ))}
              </ul>
            )}

            <p className="text-xs text-ledger-500">
              Enter amount and optional discount per bill, then click Done. Partial payments apply when the
              total is less than remaining; the bill clears automatically when received plus discount covers
              the balance.
            </p>
          </div>
        )}

        <FieldError message={error} />
      </FormModal>

      <DeleteConfirm
        open={deleteOpen}
        title="Delete payment"
        message={`Delete this payment for ${deleting?.customer?.name ?? 'customer'}${deleting?.allocations?.[0]?.order_number ? ` on bill ${deleting.allocations[0].order_number}` : ''} and remove the cleared order? This cannot be undone.`}
        onClose={() => setDeleteOpen(false)}
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!deleting) return;
          await remove(deleting.id);
          await queryClient.invalidateQueries({ queryKey: ['orders'] });
          await queryClient.invalidateQueries({ queryKey: ['customers'] });
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
