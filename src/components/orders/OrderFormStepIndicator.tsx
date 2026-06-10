const STEPS = [
  { label: 'Customer', short: 'Customer' },
  { label: 'Event', short: 'Event' },
  { label: 'Menu', short: 'Menu' },
  { label: 'Crockery', short: 'Crockery' },
  { label: 'Order & payment', short: 'Payment' },
] as const;

interface OrderFormStepIndicatorProps {
  currentStep: number;
}

export function OrderFormStepIndicator({ currentStep }: OrderFormStepIndicatorProps) {
  return (
    <nav aria-label="Order form progress" className="mb-3 min-w-0 max-w-full overflow-hidden px-2">
      <ol className="flex min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 scrollbar-none">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <li key={step.label} className="shrink-0">
              <span
                className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[0.6875rem] font-medium transition-colors duration-150 ease-out sm:h-8 sm:gap-2 sm:px-3 sm:text-xs ${
                  isActive
                    ? 'border-terracotta-600 bg-terracotta-50 text-terracotta-900'
                    : isComplete
                      ? 'border-paid/40 bg-paid/5 text-ledger-900'
                      : 'border-ledger-200 bg-surface text-ledger-600'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full font-mono text-[0.6rem] sm:size-5 sm:text-[0.65rem] ${
                    isActive
                      ? 'bg-terracotta-600 text-white'
                      : isComplete
                        ? 'bg-paid text-white'
                        : 'bg-ledger-100 text-ledger-700'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="whitespace-nowrap sm:hidden">{step.short}</span>
                <span className="hidden whitespace-nowrap sm:inline">{step.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const ORDER_FORM_STEP_COUNT = STEPS.length;
