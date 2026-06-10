import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../crud/FormModal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { QuantityInput } from '../ui/QuantityInput';
import { FieldError, FieldLabel, Input, Textarea } from '../ui/Input';
import api from '../../lib/api';
import { formatINR, parseAmount } from '../../lib/currency';
import { unwrapOne } from '../../lib/api-helpers';
import type { CrockeryReturn, CrockeryReturnItem } from '../../types';

interface LineForm {
  id: number;
  crockery_name: string;
  qty_sent: number;
  qty_returned: number;
  qty_damaged: number;
}

interface CrockeryReturnReceiveModalProps {
  returnId: number | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function qtyLost(line: Pick<LineForm, 'qty_sent' | 'qty_returned' | 'qty_damaged'>): number {
  return Math.max(0, line.qty_sent - line.qty_returned - line.qty_damaged);
}

function returnedForDamaged(qtySent: number, qtyDamaged: number): number {
  return Math.max(0, qtySent - qtyDamaged);
}

function resolveInitialTotalFine(record: CrockeryReturn): string {
  const headerFine = parseAmount(record.total_fine ?? '0');
  if (headerFine > 0) {
    return record.total_fine ?? '0';
  }

  const legacySum = (record.items ?? []).reduce(
    (sum, item) => sum + parseAmount(item.fine_amount ?? '0'),
    0,
  );

  return legacySum > 0 ? String(legacySum) : '0';
}

export function CrockeryReturnReceiveModal({
  returnId,
  open,
  onClose,
  onSaved,
}: CrockeryReturnReceiveModalProps) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<LineForm[]>([]);
  const [totalFine, setTotalFine] = useState('0');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const detailQuery = useQuery({
    queryKey: ['crockery-returns', returnId],
    enabled: open && !!returnId,
    queryFn: async () => {
      const { data } = await api.get(`/crockery-returns/${returnId}`);
      return unwrapOne<CrockeryReturn>(data);
    },
  });

  const record = detailQuery.data;

  useEffect(() => {
    if (!record?.items) return;

    const pending = record.return_status === 'pending';
    setLines(
      record.items.map((item: CrockeryReturnItem) => ({
        id: item.id,
        crockery_name: item.crockery_name ?? `Item #${item.crockery_id}`,
        qty_sent: item.qty_sent,
        qty_returned: pending ? item.qty_sent : item.qty_returned,
        qty_damaged: item.qty_damaged,
      })),
    );
    setTotalFine(resolveInitialTotalFine(record));
    setReturnDate(record.return_date ?? new Date().toISOString().slice(0, 10));
    setNotes(record.notes ?? '');
    setError('');
  }, [record]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/crockery-returns/${returnId}`, {
        return_date: returnDate || null,
        notes: notes.trim() || null,
        total_fine: parseAmount(totalFine),
        items: lines.map((line) => ({
          id: line.id,
          qty_returned: line.qty_returned,
          qty_damaged: line.qty_damaged,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crockery-returns'] });
      queryClient.invalidateQueries({ queryKey: ['crockery-returns', returnId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const readOnly = record?.fine_applied ?? false;
  const isSaving = saveMutation.isPending;
  const manualTotalFine = parseAmount(totalFine);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (readOnly) {
      onClose();
      return;
    }

    const invalid = lines.find((l) => l.qty_returned + l.qty_damaged > l.qty_sent);
    if (invalid) {
      setError(
        `Returned and damaged cannot exceed sent for ${invalid.crockery_name}.`,
      );
      return;
    }

    try {
      await saveMutation.mutateAsync();
      onSaved();
      onClose();
    } catch {
      setError('Could not save return. Check quantities and try again.');
    }
  };

  const updateLine = (id: number, patch: Partial<LineForm>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  return (
    <FormModal
      open={open}
      title={record ? `Receive crockery · Order #${record.order_id}` : 'Receive crockery'}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      submitLabel={readOnly ? 'Close' : 'Save return'}
      wide
    >
      {detailQuery.isLoading && <p className="text-sm text-ledger-700">Loading return details…</p>}

      {record && !detailQuery.isLoading && (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-lg border border-ledger-200 bg-surface">
            <div className="border-b border-ledger-200 bg-ledger-50/80 px-3 py-2.5 sm:px-4">
              <p className="text-sm font-medium text-ledger-900">Return details</p>
              <p className="mt-0.5 text-xs text-ledger-600">
                {record.customer?.name ?? 'Customer'}
                {record.order?.order_number ? (
                  <>
                    {' '}
                    · <span className="font-mono">{record.order.order_number}</span>
                  </>
                ) : null}
              </p>
            </div>

            {readOnly && (
              <p className="border-b border-ledger-200 bg-ledger-50 px-3 py-2 text-sm text-ledger-700 sm:px-4">
                Fine already applied. Quantities and fines are locked.
              </p>
            )}

            <fieldset disabled={readOnly} className="disabled:opacity-60">
              <div className="hidden border-b border-ledger-100 bg-ledger-50/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-ledger-600 sm:grid sm:grid-cols-[minmax(0,1.4fr)_3.5rem_5rem_5rem_3.5rem] sm:gap-3 sm:px-4">
                <span>Item</span>
                <span className="text-center">Sent</span>
                <span className="text-center">Returned</span>
                <span className="text-center">Damaged</span>
                <span className="text-center">Lost</span>
              </div>

              <div className="divide-y divide-ledger-100">
                {lines.map((line) => {
                  const lost = qtyLost(line);
                  const returnedId = `returned-${line.id}`;
                  const damagedId = `damaged-${line.id}`;

                  return (
                    <div
                      key={line.id}
                      className="px-3 py-3 sm:grid sm:grid-cols-[minmax(0,1.4fr)_3.5rem_5rem_5rem_3.5rem] sm:items-center sm:gap-3 sm:px-4"
                    >
                      <p className="min-w-0 text-sm font-medium text-ledger-900">{line.crockery_name}</p>

                      <div className="mt-2 grid grid-cols-4 gap-x-2 gap-y-1 sm:mt-0 sm:contents">
                        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-ledger-600 sm:hidden">
                          Sent
                        </span>
                        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-ledger-600 sm:hidden">
                          Returned
                        </span>
                        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-ledger-600 sm:hidden">
                          Damaged
                        </span>
                        <span className="text-center text-[10px] font-medium uppercase tracking-wide text-ledger-600 sm:hidden">
                          Lost
                        </span>

                        <div className="flex h-11 items-center justify-center sm:h-auto">
                          <span className="font-mono text-sm tabular-nums text-ledger-900">{line.qty_sent}</span>
                        </div>

                        <QuantityInput
                          id={returnedId}
                          aria-label={`${line.crockery_name} returned`}
                          className="min-w-0 px-1.5 text-center tabular-nums sm:px-3"
                          min={0}
                          max={line.qty_sent}
                          value={line.qty_returned}
                          onChange={(qty_returned) => {
                            const maxReturned = Math.max(0, line.qty_sent - line.qty_damaged);
                            updateLine(line.id, {
                              qty_returned: Math.min(qty_returned, maxReturned),
                            });
                          }}
                        />

                        <QuantityInput
                          id={damagedId}
                          aria-label={`${line.crockery_name} damaged`}
                          className="min-w-0 px-1.5 text-center tabular-nums sm:px-3"
                          min={0}
                          max={line.qty_sent}
                          value={line.qty_damaged}
                          onChange={(qty_damaged) => {
                            const clamped = Math.min(qty_damaged, line.qty_sent);
                            updateLine(line.id, {
                              qty_damaged: clamped,
                              qty_returned: returnedForDamaged(line.qty_sent, clamped),
                            });
                          }}
                        />

                        <div className="flex h-11 items-center justify-center sm:h-auto">
                          <span
                            className={`font-mono text-sm tabular-nums ${lost > 0 ? 'text-due' : 'text-ledger-700'}`}
                          >
                            {lost}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-ledger-200 px-3 py-3 sm:px-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="ret-date">Return date</FieldLabel>
                    <Input
                      id="ret-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="total-fine">Total fine</FieldLabel>
                    <CurrencyInput id="total-fine" value={totalFine} onChange={setTotalFine} />
                    <p className="mt-1 text-xs text-ledger-600">
                      {manualTotalFine > 0
                        ? `${formatINR(manualTotalFine)} will be added to the order bill when you save.`
                        : 'Leave at zero if no fine is due.'}
                    </p>
                  </div>
                </div>
                <div>
                  <FieldLabel htmlFor="ret-notes">Notes</FieldLabel>
                  <Textarea id="ret-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </fieldset>
          </section>

          {record.fine_applied && (
            <p className="text-sm text-ledger-700">
              Applied fine on record: <span className="font-mono">{formatINR(record.total_fine)}</span>
            </p>
          )}
        </div>
      )}

      <FieldError message={error} />
    </FormModal>
  );
}
