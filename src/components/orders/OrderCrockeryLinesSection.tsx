import type { KeyboardEvent, MouseEvent } from 'react';
import type { CrockeryLineRow } from '../../lib/order-lines';
import type { Crockery } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { QuantityInput } from '../ui/QuantityInput';
import { FieldLabel, Textarea } from '../ui/Input';

export type { CrockeryLineRow };

interface OrderCrockeryLinesSectionProps {
  lines: CrockeryLineRow[];
  crockeries: Crockery[] | undefined;
  personsCount: number;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  collapsedSummary: string;
  crockeryRemarks: string;
  onCrockeryRemarksChange: (v: string) => void;
  onUpdateLine: (key: string, patch: Partial<CrockeryLineRow>) => void;
}

const lineRowClass =
  'grid grid-cols-[auto_minmax(0,1fr)_4.25rem] items-center gap-2 border-b border-ledger-100 py-2.5 last:border-b-0 odd:bg-ledger-50/60 sm:grid-cols-[auto_minmax(0,1fr)_5.5rem] sm:gap-3 sm:py-3';

function stopRowToggle(e: MouseEvent | KeyboardEvent) {
  e.stopPropagation();
}

export function OrderCrockeryLinesSection({
  lines,
  crockeries,
  personsCount,
  expanded,
  onExpandedChange,
  collapsedSummary,
  crockeryRemarks,
  onCrockeryRemarksChange,
  onUpdateLine,
}: OrderCrockeryLinesSectionProps) {
  const crockeryNameById = new Map(crockeries?.map((c) => [c.id, c.name]) ?? []);

  if (!crockeries?.length) {
    return (
      <section className="rounded-md border border-ledger-200 bg-ledger-50 p-4">
        <h3 className="text-sm font-semibold text-ledger-900">Crockery items</h3>
        <p className="mt-2 text-sm text-ledger-700">Loading crockery catalog…</p>
      </section>
    );
  }

  if (personsCount < 1) {
    return (
      <section className="rounded-md border border-ledger-200 bg-ledger-50 p-4">
        <h3 className="text-sm font-semibold text-ledger-900">Crockery items</h3>
        <p className="mt-2 text-sm text-ledger-700">Enter the number of persons to show crockery lines.</p>
      </section>
    );
  }

  return (
    <CollapsibleSection
      title="Crockery items"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      collapsedSummary={collapsedSummary}
      bordered
    >
      <p className="mb-3 text-sm text-ledger-700">
        All crockery is shown for context ({personsCount} per included line). Click a row to include or exclude;
        adjust quantity without toggling.
      </p>

      <div className="space-y-0">
        {lines.map((line) => {
          const name = crockeryNameById.get(line.crockery_id) ?? 'Crockery';
          const inputId = `ord-crock-${line.key}`;
          const toggleIncluded = () => onUpdateLine(line.key, { included: !line.included });

          return (
            <div
              key={line.key}
              role="button"
              tabIndex={0}
              aria-pressed={line.included}
              aria-labelledby={inputId}
              onClick={toggleIncluded}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleIncluded();
                }
              }}
              className={`${lineRowClass} cursor-pointer transition-colors duration-150 ease-out hover:bg-ledger-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-terracotta-600 ${
                !line.included ? 'opacity-60' : ''
              }`}
            >
              <div className="flex min-h-11 items-center" onClick={stopRowToggle} onKeyDown={stopRowToggle}>
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-terracotta-600"
                  checked={line.included}
                  onChange={(e) => onUpdateLine(line.key, { included: e.target.checked })}
                  onClick={stopRowToggle}
                  aria-labelledby={inputId}
                  tabIndex={-1}
                />
              </div>
              <span id={inputId} className="min-w-0 text-sm font-medium leading-snug text-ledger-900 break-words">
                {name}
              </span>
              <div className="w-full max-w-[4.25rem] sm:max-w-[5.5rem]" onClick={stopRowToggle} onKeyDown={stopRowToggle}>
                <span className="sr-only">Quantity for {name}</span>
                <QuantityInput
                  min={1}
                  value={line.quantity}
                  disabled={!line.included}
                  onChange={(quantity) => onUpdateLine(line.key, { quantity })}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-ledger-200 pt-4">
        <FieldLabel htmlFor="ord-crock-remarks">Crockery remarks</FieldLabel>
        <Textarea
          id="ord-crock-remarks"
          value={crockeryRemarks}
          onChange={(e) => onCrockeryRemarksChange(e.target.value)}
          placeholder="Delivery or return notes"
          rows={2}
        />
      </div>
    </CollapsibleSection>
  );
}
