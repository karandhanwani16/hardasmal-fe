import { formatINR, parseAmount } from '../../lib/currency';
import { CurrencyInput } from '../ui/CurrencyInput';
import { FieldLabel, Select, Textarea } from '../ui/Input';

export type AdvancePaymentMode = 'cash' | 'upi' | '';

interface OrderFormSummaryProps {
  personsCount: number;
  perPlateCost: string;
  transportationCharges: string;
  washingCharges: string;
  orderTotal: string;
  advancePaid: string;
  advancePaymentMode: AdvancePaymentMode;
  specialInstructions: string;
  onPerPlateCostChange: (value: string) => void;
  onTransportationChargesChange: (value: string) => void;
  onWashingChargesChange: (value: string) => void;
  onAdvanceChange: (value: string) => void;
  onAdvancePaymentModeChange: (value: AdvancePaymentMode) => void;
  onSpecialInstructionsChange: (value: string) => void;
  disabled?: boolean;
  /** Crockery fines already applied to the order bill (read-only on edit). */
  crockeryFine?: string;
}

function SummaryLine({
  label,
  amount,
  emphasis,
  subtract,
}: {
  label: string;
  amount: number;
  emphasis?: boolean;
  subtract?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 font-mono text-sm ${
        emphasis ? 'border-t border-ledger-200 pt-3 text-base font-semibold text-ledger-900' : 'text-ledger-800'
      }`}
    >
      <span className={subtract && !emphasis ? 'text-ledger-700' : undefined}>
        {subtract && !emphasis ? `− ${label}` : label}
      </span>
      <span className={emphasis ? 'text-ledger-900' : 'tabular-nums'}>
        {subtract && !emphasis ? `−${formatINR(amount)}` : formatINR(amount)}
      </span>
    </div>
  );
}

export function OrderFormSummary({
  personsCount,
  perPlateCost,
  transportationCharges,
  washingCharges,
  orderTotal,
  advancePaid,
  advancePaymentMode,
  specialInstructions,
  onPerPlateCostChange,
  onTransportationChargesChange,
  onWashingChargesChange,
  onAdvanceChange,
  onAdvancePaymentModeChange,
  onSpecialInstructionsChange,
  disabled,
  crockeryFine = '0',
}: OrderFormSummaryProps) {
  const perPlate = parseAmount(perPlateCost);
  const transport = parseAmount(transportationCharges);
  const washing = parseAmount(washingCharges);
  const plateSubtotal = personsCount * perPlate;
  const total = parseAmount(orderTotal);
  const advance = parseAmount(advancePaid);
  const fine = parseAmount(crockeryFine);
  const balanceDue = Math.max(0, total - advance + fine);
  const showAdvanceMode = advance > 0;

  return (
    <section className="space-y-4 rounded-md border border-ledger-200 bg-ledger-50 px-3 py-4 sm:px-4">
      <div>
        <h3 className="text-sm font-semibold text-ledger-900">Order &amp; payment</h3>
        <p className="mt-1 text-sm text-ledger-700">
          Enter per-plate rate and charges. Total is calculated from {personsCount} persons.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="ord-per-plate">Per plate cost</FieldLabel>
          <CurrencyInput
            id="ord-per-plate"
            value={perPlateCost}
            onChange={onPerPlateCostChange}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="ord-transport">Transportation charges</FieldLabel>
          <CurrencyInput
            id="ord-transport"
            value={transportationCharges}
            onChange={onTransportationChargesChange}
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel htmlFor="ord-washing">Washing charges</FieldLabel>
          <CurrencyInput
            id="ord-washing"
            value={washingCharges}
            onChange={onWashingChargesChange}
            disabled={disabled}
          />
        </div>
        <div>
          <FieldLabel htmlFor="ord-advance">Advance amount</FieldLabel>
          <CurrencyInput
            id="ord-advance"
            value={advancePaid}
            onChange={onAdvanceChange}
            disabled={disabled}
          />
        </div>
        {showAdvanceMode ? (
          <div>
            <FieldLabel htmlFor="ord-advance-mode">Advance payment type</FieldLabel>
            <Select
              id="ord-advance-mode"
              value={advancePaymentMode}
              onChange={(e) => onAdvancePaymentModeChange(e.target.value as AdvancePaymentMode)}
              disabled={disabled}
              required
            >
              <option value="">Select mode</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-md border border-ledger-200 bg-surface px-3 py-3" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-wide text-ledger-600">Amount breakdown</p>
        <SummaryLine
          label={`Plate subtotal (${personsCount} × ${formatINR(perPlate)})`}
          amount={plateSubtotal}
        />
        {transport > 0 ? <SummaryLine label="Transportation" amount={transport} /> : null}
        {washing > 0 ? <SummaryLine label="Washing" amount={washing} /> : null}
        <SummaryLine label="Order total" amount={total} emphasis />
        {fine > 0 ? <SummaryLine label="Crockery fine" amount={fine} /> : null}
        {advance > 0 ? <SummaryLine label="Advance" amount={advance} subtract /> : null}
        <SummaryLine label="Balance due" amount={balanceDue} emphasis />
      </div>

      <div>
        <FieldLabel htmlFor="ord-notes">Special instructions</FieldLabel>
        <Textarea
          id="ord-notes"
          value={specialInstructions}
          onChange={(e) => onSpecialInstructionsChange(e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Delivery notes, dietary requests, or setup details"
        />
      </div>
    </section>
  );
}
