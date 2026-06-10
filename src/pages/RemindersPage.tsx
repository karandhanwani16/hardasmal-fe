import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/crud/DataTable';
import { PageHeader } from '../components/crud/PageHeader';
import { ListToolbar } from '../components/list/ListToolbar';
import { Badge } from '../components/ui/Badge';
import { useListPage } from '../hooks/useListPage';
import api from '../lib/api';
import type { CrockeryReturnReminder } from '../types';

function filterReminders(rows: CrockeryReturnReminder[], query: string): CrockeryReturnReminder[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((row) => {
    const haystack = [
      row.order_number,
      row.order_id != null ? `#${row.order_id}` : '',
      row.customer?.name,
      row.customer?.phone,
      row.items_summary,
      row.days_pending != null ? String(row.days_pending) : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

const REMINDER_COLUMNS = [
  {
    key: 'order',
    header: 'Order',
    render: (r: CrockeryReturnReminder) => r.order_number ?? `#${r.order_id}`,
    mono: true,
    cardPrimary: true,
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (r: CrockeryReturnReminder) => r.customer?.name ?? '—',
  },
  {
    key: 'days',
    header: 'Days pending',
    render: (r: CrockeryReturnReminder) => (
      <span className="inline-flex items-center gap-2">
        <span className="font-mono">{r.days_pending}</span>
        <Badge label="Overdue" variant="due" />
      </span>
    ),
    mono: true,
  },
  {
    key: 'items',
    header: 'Items sent',
    render: (r: CrockeryReturnReminder) => r.items_summary || '—',
  },
] as const;

function reminderActions(row: CrockeryReturnReminder) {
  return (
    <Link
      to={`/crockery-returns?return_id=${row.id}`}
      className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-ledger-200 bg-surface px-3 text-xs font-medium text-ledger-900 transition-colors hover:bg-ledger-50 sm:w-auto"
    >
      View return
    </Link>
  );
}

export function RemindersPage() {
  const list = useListPage();

  const { data, isLoading } = useQuery({
    queryKey: ['reminders', 'crockery-returns'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: CrockeryReturnReminder[] }>('/reminders/crockery-returns');
      return res.data;
    },
  });

  const allRows = data ?? [];

  const filteredRows = useMemo(
    () => filterReminders(allRows, list.debouncedSearch),
    [allRows, list.debouncedSearch],
  );

  const emptyMessage =
    allRows.length === 0
      ? 'No overdue crockery returns — all pending returns are within 2 days of dispatch.'
      : 'No reminders match your search.';

  return (
    <div className="min-w-0">
      <PageHeader
        title="Reminders"
        description="Crockery returns still pending more than 2 days after dispatch"
      />

      <ListToolbar
        search={list.searchInput}
        onSearchChange={list.setSearchInput}
        searchPlaceholder="Search order, customer, phone, or items"
        viewMode={list.viewMode}
        onViewModeChange={list.setViewMode}
      />

      <DataTable
        isLoading={isLoading}
        rows={filteredRows}
        rowKey={(r) => r.id}
        viewMode={list.viewMode}
        cardGridClassName="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2"
        emptyMessage={emptyMessage}
        columns={[...REMINDER_COLUMNS]}
        actions={reminderActions}
      />
    </div>
  );
}
