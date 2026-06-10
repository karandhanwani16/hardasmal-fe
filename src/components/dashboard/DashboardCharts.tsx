import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatINR } from '../../lib/currency';
import type { DashboardChartSeries, DashboardPaymentSlice, DashboardStatusSlice } from '../../types';
import { useChartColors } from './chartTheme';

function ChartShell({
  title,
  subtitle,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
}) {
  return (
    <section className="rounded-lg border border-ledger-200 bg-surface">
      <header className="border-b border-ledger-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-ledger-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-ledger-700">{subtitle}</p> : null}
      </header>
      {isEmpty ? (
        <p className="px-4 py-10 text-center text-sm text-ledger-700 sm:px-5">{emptyMessage}</p>
      ) : (
        <div className="px-2 py-4 sm:px-3 motion-reduce:[&_*]:!transition-none">{children}</div>
      )}
    </section>
  );
}

function formatCompactINR(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return formatINR(value);
}

function chartTooltipStyle(colors: ReturnType<typeof useChartColors>['colors']) {
  return {
    border: `1px solid ${colors.ledger200}`,
    borderRadius: 6,
    fontSize: 12,
    backgroundColor: colors.tooltipBg,
    color: colors.tooltipText,
  };
}

export function CollectionsTrendChart({
  series,
  rangeDays,
}: {
  series: DashboardChartSeries;
  rangeDays: 7 | 30;
}) {
  const { colors } = useChartColors();
  const data = series.labels.map((label, i) => ({
    label,
    amount: series.values[i] ?? 0,
  }));
  const total = data.reduce((sum, row) => sum + row.amount, 0);
  const isEmpty = total === 0;

  return (
    <ChartShell
      title="Collections"
      subtitle={`Payment received · last ${rangeDays} days`}
      emptyMessage="No payments recorded in this period."
      isEmpty={isEmpty}
    >
      <div className="h-52 w-full min-w-0 sm:h-56" role="img" aria-label={`Collections trend for ${rangeDays} days`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: colors.ledger700, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: colors.ledger200 }}
              interval={rangeDays === 30 ? 4 : 0}
            />
            <YAxis
              tick={{ fill: colors.ledger700, fontSize: 11 }}
              tickFormatter={(v) => formatCompactINR(Number(v))}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value: number) => [formatINR(value), 'Collected']}
              contentStyle={chartTooltipStyle(colors)}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={colors.terracotta}
              strokeWidth={2}
              dot={{ r: 3, fill: colors.terracotta }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export function OrdersVolumeChart({ series }: { series: DashboardChartSeries }) {
  const { colors } = useChartColors();
  const data = series.labels.map((label, i) => ({
    label,
    orders: series.values[i] ?? 0,
  }));
  const total = data.reduce((sum, row) => sum + row.orders, 0);
  const isEmpty = total === 0;

  return (
    <ChartShell
      title="Event volume"
      subtitle="Orders by event date · last 7 days"
      emptyMessage="No events scheduled in the last week."
      isEmpty={isEmpty}
    >
      <div className="h-52 w-full min-w-0 sm:h-56" role="img" aria-label="Orders by event date for last 7 days">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: colors.ledger700, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: colors.ledger200 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: colors.ledger700, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Orders']}
              contentStyle={chartTooltipStyle(colors)}
            />
            <Bar dataKey="orders" fill={colors.dispatch} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export function OrdersStatusChart({ slices }: { slices: DashboardStatusSlice[] }) {
  const { colors, statusColors } = useChartColors();
  const data = slices.map((s) => ({ name: s.label, value: s.value, key: s.key }));
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <ChartShell
      title="Order pipeline"
      subtitle="Active orders by status"
      emptyMessage="No orders in the system yet."
      isEmpty={total === 0}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="mx-auto h-44 w-44 shrink-0" role="img" aria-label="Order status breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={statusColors[entry.key] ?? colors.ledger700} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={chartTooltipStyle(colors)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-2 text-sm">
          {data.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-ledger-900">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusColors[row.key] ?? colors.ledger700 }}
                  aria-hidden
                />
                {row.name}
              </span>
              <span className="font-mono text-ledger-900">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}

export function PaymentsStatusChart({ slices }: { slices: DashboardPaymentSlice[] }) {
  const { colors, statusColors } = useChartColors();
  const data = slices.map((s) => ({
    name: s.label,
    count: s.count,
    key: s.key,
    outstanding: s.amount,
  }));
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <ChartShell
      title="Payment collection"
      subtitle="Orders by payment status"
      emptyMessage="No payment data to show."
      isEmpty={total === 0}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="mx-auto h-44 w-44 shrink-0" role="img" aria-label="Payment status breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={statusColors[entry.key] ?? colors.ledger700} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props) => {
                  const outstanding = props.payload?.outstanding as number | undefined;
                  const due =
                    outstanding && outstanding > 0 ? ` · Due ${formatINR(outstanding)}` : '';
                  return [`${value} orders${due}`, name];
                }}
                contentStyle={chartTooltipStyle(colors)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-2 text-sm">
          {data.map((row) => (
            <li key={row.key} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="flex items-center gap-2 text-ledger-900">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: statusColors[row.key] ?? colors.ledger700 }}
                  aria-hidden
                />
                {row.name}
                <span className="text-xs text-ledger-700">· {row.count} orders</span>
              </span>
              {row.outstanding > 0 ? (
                <span className="font-mono text-xs text-due">Due {formatINR(row.outstanding)}</span>
              ) : (
                <span className="text-xs text-ledger-700">Cleared</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}
