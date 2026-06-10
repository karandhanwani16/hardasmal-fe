const variants: Record<string, string> = {
  paid: 'bg-emerald-50 text-paid',
  partial: 'bg-amber-50 text-kitchen',
  pending: 'bg-ledger-100 text-ledger-700',
  dispatched: 'bg-blue-50 text-dispatch',
  due: 'bg-orange-50 text-due',
};

export function Badge({ label, variant = 'pending' }: { label: string; variant?: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${variants[variant] ?? variants.pending}`}>
      {label}
    </span>
  );
}
