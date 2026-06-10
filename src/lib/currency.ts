const inrCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrAmount = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Display amount in Indian locale with ₹ symbol (en-IN grouping). */
export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return inrCurrency.format(Number.isFinite(n) ? n : 0);
}

/** Strip grouping commas and parse a numeric amount. */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  if (cleaned === '' || cleaned === '-') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Format for amount inputs on blur (no currency symbol). */
export function formatAmountInput(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return inrAmount.format(Number.isFinite(n) ? n : 0);
}
