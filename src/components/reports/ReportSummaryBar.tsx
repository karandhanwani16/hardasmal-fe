import { formatINR } from '../../lib/currency';
import type { ReportSummaryField } from '../../config/reports';

interface ReportSummaryBarProps {
  fields: ReportSummaryField[];
  summary: Record<string, unknown> | null | undefined;
}

export function ReportSummaryBar({ fields, summary }: ReportSummaryBarProps) {
  if (!summary || fields.length === 0) return null;

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) => {
        const raw = summary[field.key];
        let display: string;

        if (field.format === 'money') {
          display = formatINR(Number(raw ?? 0));
        } else if (field.format === 'number') {
          display = String(Number(raw ?? 0));
        } else {
          display = String(raw ?? '—');
        }

        return (
          <div
            key={field.key}
            className="rounded-lg border border-ledger-200 bg-surface px-4 py-3"
          >
            <p className="text-xs text-ledger-700">{field.label}</p>
            <p className="mt-1 font-mono text-lg font-medium tabular-nums text-ledger-900">{display}</p>
          </div>
        );
      })}
    </div>
  );
}
