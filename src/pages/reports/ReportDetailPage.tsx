import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';
import { DataTable } from '../../components/crud/DataTable';
import { ListFilterField, ListFilterInput, ListFilterSelect } from '../../components/list/ListFilterField';
import { ListPageLayout } from '../../components/list/ListPageLayout';
import { ReportSummaryBar } from '../../components/reports/ReportSummaryBar';
import { Button } from '../../components/ui/Button';
import { getReportByPath } from '../../config/reports';
import { useListPage } from '../../hooks/useListPage';
import { useReportQuery } from '../../hooks/useReportQuery';
import api from '../../lib/api';
import { unwrapList } from '../../lib/api-helpers';
import { downloadReportExport } from '../../lib/reportExport';
import type { Customer } from '../../types';

export function ReportDetailPage() {
  const { reportPath = '' } = useParams<{ reportPath: string }>();
  const definition = getReportByPath(reportPath);

  const list = useListPage({
    initialFilters: definition?.initialFilters ?? {},
    defaultPerPage: 25,
  });

  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState<'xlsx' | 'pdf' | null>(null);

  const customersQuery = useQuery({
    queryKey: ['customers', 'report-options'],
    queryFn: async () => {
      const { data } = await api.get('/customers', { params: { per_page: 200 } });
      return unwrapList<Customer>(data);
    },
  });

  const ridersQuery = useQuery({
    queryKey: ['dispatch-suggestions', 'rider_names', 'report-options'],
    queryFn: async () => {
      const { data } = await api.get<{ rider_names: string[] }>('/orders/dispatch-suggestions', {
        params: { field: 'rider_names' },
      });
      return data.rider_names ?? [];
    },
  });

  const customerOptions = useMemo(
    () => [
      { value: '', label: 'All customers' },
      ...(customersQuery.data?.map((c) => ({ value: String(c.id), label: `${c.name} · ${c.phone}` })) ?? []),
    ],
    [customersQuery.data],
  );

  const riderOptions = useMemo(
    () => [
      { value: '', label: 'All delivery staff' },
      ...(ridersQuery.data?.map((name) => ({ value: name, label: name })) ?? []),
    ],
    [ridersQuery.data],
  );

  const enabled =
    !!definition &&
    (!definition.requiresCustomer || list.filters.customer_id !== '');

  const { items, meta, summary, isLoading, isFetching } = useReportQuery<Record<string, unknown>>({
    endpoint: definition?.endpoint ?? '',
    queryKey: ['reports', reportPath],
    listParams: list.listParams,
    sortBy,
    sortDir,
    enabled,
  });

  const columns = useMemo(() => {
    if (!definition) return [];
    return typeof definition.columns === 'function'
      ? definition.columns(list.filters)
      : definition.columns;
  }, [definition, list.filters]);

  const handleExport = useCallback(
    async (format: 'xlsx' | 'pdf') => {
      if (!definition) return;
      setExporting(format);
      try {
        await downloadReportExport(definition.endpoint, format, list.listParams, sortBy, sortDir);
      } finally {
        setExporting(null);
      }
    },
    [definition, list.listParams, sortBy, sortDir],
  );

  if (!definition) {
    return <Navigate to="/reports/collections" replace />;
  }

  const exportButtons = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={!enabled || !!exporting}
        onClick={() => handleExport('xlsx')}
      >
        {exporting === 'xlsx' ? 'Exporting…' : 'Excel'}
      </Button>
      <Button
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        disabled={!enabled || !!exporting}
        onClick={() => handleExport('pdf')}
      >
        {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
      </Button>
    </div>
  );

  return (
    <ListPageLayout
      title={definition.title}
      description={definition.description}
      headerExtra={exportButtons}
      search={list.searchInput}
      onSearchChange={list.setSearchInput}
      searchPlaceholder={definition.searchPlaceholder ?? 'Search…'}
      viewMode={list.viewMode}
      onViewModeChange={list.setViewMode}
      activeFilterCount={list.activeFilterCount}
      onClearFilters={list.clearFilters}
      meta={meta}
      page={list.page}
      perPage={list.perPage}
      onPageChange={list.setPage}
      onPerPageChange={list.setPerPage}
      isLoading={isLoading || isFetching}
      filtersSlot={
        <>
          {definition.filterFields.map((field) => {
            const fieldId = `report-${field.key}`;
            const options =
              field.key === 'customer_id'
                ? customerOptions
                : field.key === 'rider_name'
                  ? riderOptions
                  : (field.options ?? []);

            if (field.type === 'date') {
              return (
                <ListFilterField key={field.key} label={field.label} htmlFor={fieldId}>
                  <ListFilterInput
                    id={fieldId}
                    type="date"
                    value={list.filters[field.key] ?? ''}
                    onChange={(v) => list.setFilter(field.key, v)}
                  />
                </ListFilterField>
              );
            }

            return (
              <ListFilterField key={field.key} label={field.label} htmlFor={fieldId}>
                <ListFilterSelect
                  id={fieldId}
                  value={list.filters[field.key] ?? ''}
                  onChange={(v) => list.setFilter(field.key, v)}
                  options={options}
                />
              </ListFilterField>
            );
          })}
        </>
      }
    >
      {definition.requiresCustomer && !list.filters.customer_id ? (
        <div className="rounded-lg border border-dashed border-ledger-300 bg-ledger-50 px-4 py-10 text-center text-sm text-ledger-700">
          Select a customer to generate this report.
        </div>
      ) : (
        <>
          <ReportSummaryBar fields={definition.summaryFields ?? []} summary={summary} />
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(row) =>
              String(
                row.id ??
                  row.order_id ??
                  row.order_number ??
                  row.item_name ??
                  row.period_key ??
                  `${row.date}-${row.reference}`,
              )
            }
            isLoading={isLoading}
            viewMode={list.viewMode}
            emptyMessage="No records match your filters."
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={(key) => {
              if (sortBy === key) {
                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortBy(key);
                setSortDir('asc');
              }
            }}
          />
        </>
      )}
    </ListPageLayout>
  );
}
