import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { todayIsoDate, unwrapOne } from '../lib/api-helpers';
import type { KitchenCombinedRow, KitchenOrderGroup } from '../types';
import { Button } from '../components/ui/Button';
import { FieldLabel, Input } from '../components/ui/Input';

type ViewMode = 'grouped' | 'combined';

function isGroupedPayload(rows: unknown[]): rows is KitchenOrderGroup[] {
  return rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null && 'order_id' in (rows[0] as object);
}

export function KitchenPage() {
  const [date, setDate] = useState(todayIsoDate());
  const [view, setView] = useState<ViewMode>('grouped');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['kitchen-summary', date, view],
    queryFn: async () => {
      const { data: res } = await api.get('/kitchen-summary', {
        params: {
          date,
          grouped: view === 'grouped' ? 'orders' : 'combined',
        },
      });
      const summary = unwrapOne<{
        orders?: KitchenOrderGroup[];
        items?: KitchenCombinedRow[];
      }>(res);
      return view === 'grouped' ? (summary.orders ?? []) : (summary.items ?? []);
    },
  });

  const rows = data ?? [];
  const grouped = isGroupedPayload(rows);

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Kitchen Summary</h1>
          <p className="mt-1 text-sm text-ledger-700">Prep quantities for the selected event date</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-auto">
            <FieldLabel htmlFor="kitchen-date">Event date</FieldLabel>
            <Input id="kitchen-date" type="date" className="w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex w-full rounded-md border border-ledger-200 bg-surface p-1 sm:inline-flex sm:w-auto">
            <Button
              type="button"
              variant={view === 'grouped' ? 'primary' : 'ghost'}
              className="min-h-11 flex-1 px-3 text-xs sm:flex-none"
              onClick={() => setView('grouped')}
            >
              By order
            </Button>
            <Button
              type="button"
              variant={view === 'combined' ? 'primary' : 'ghost'}
              className="min-h-11 flex-1 px-3 text-xs sm:flex-none"
              onClick={() => setView('combined')}
            >
              Combined
            </Button>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-ledger-700">Loading kitchen summary…</p>}
      {isError && (
        <p className="rounded-md border border-dashed border-ledger-200 bg-surface px-4 py-6 text-sm text-ledger-700">
          Could not load kitchen summary for this date.
        </p>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <p className="rounded-md border border-dashed border-ledger-200 bg-surface px-4 py-8 text-center text-sm text-ledger-700">
          No kitchen prep for this date.
        </p>
      )}

      {!isLoading && !isError && grouped && (
        <div className="space-y-4">
          {(rows as KitchenOrderGroup[]).map((order) => (
            <section key={order.order_id} className="overflow-hidden rounded-lg border border-ledger-200 bg-surface">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ledger-200 bg-ledger-50 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-medium">{order.order_number}</p>
                  <p className="text-xs text-ledger-700">
                    {order.customer_name ?? 'Customer'}
                    {order.meal_type ? ` · ${order.meal_type}` : ''}
                  </p>
                </div>
              </header>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[240px] text-sm">
                <thead>
                  <tr className="border-b border-ledger-100 text-left text-xs text-ledger-700">
                    <th className="px-4 py-2 font-medium">Item</th>
                    <th className="px-4 py-2 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${order.order_id}-${item.item_name}`} className="border-b border-ledger-50 last:border-0">
                      <td className="px-4 py-2">{item.item_name}</td>
                      <td className="px-4 py-2 font-mono text-base">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {!isLoading && !isError && !grouped && rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-ledger-200 bg-surface">
          <table className="w-full max-w-lg text-sm">
            <thead>
              <tr className="border-b border-ledger-200 text-left text-xs text-ledger-700">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Total quantity</th>
              </tr>
            </thead>
            <tbody>
              {(rows as KitchenCombinedRow[]).map((row) => (
                <tr key={row.item_name} className="border-b border-ledger-100 last:border-0">
                  <td className="px-4 py-3">{row.item_name}</td>
                  <td className="px-4 py-3 font-mono text-lg">{row.total_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
