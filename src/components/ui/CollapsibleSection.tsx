import { useId, type ReactNode } from 'react';

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 text-ledger-700 transition-transform duration-200 ease-out motion-reduce:transition-none ${
        expanded ? 'rotate-0' : '-rotate-90'
      }`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface CollapsibleSectionProps {
  title: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Shown in the header when collapsed (e.g. line count). */
  collapsedSummary?: string;
  headerAction?: ReactNode;
  bordered?: boolean;
  children: ReactNode;
  panelId?: string;
}

export function CollapsibleSection({
  title,
  expanded,
  onExpandedChange,
  collapsedSummary,
  headerAction,
  bordered = false,
  children,
  panelId: panelIdProp,
}: CollapsibleSectionProps) {
  const autoId = useId();
  const panelId = panelIdProp ?? `collapsible-${autoId}`;

  const shell = bordered
    ? 'rounded-md border border-ledger-200 bg-surface'
    : 'rounded-md border border-transparent';

  return (
    <section className={shell}>
      <div className={`flex flex-col gap-2 sm:flex-row sm:items-center ${bordered ? 'px-3 py-2.5 sm:px-4 sm:py-3' : 'py-1'}`}>
        <button
          type="button"
          className="flex min-h-11 w-full min-w-0 flex-1 items-start gap-2 rounded-md text-left transition-colors hover:bg-ledger-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-500 sm:min-h-10 sm:items-center"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => onExpandedChange(!expanded)}
        >
          <ChevronIcon expanded={expanded} />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 sm:gap-y-0.5">
            <span className="text-sm font-semibold text-ledger-900">{title}</span>
            {!expanded && collapsedSummary ? (
              <span className="font-mono text-xs text-ledger-700">{collapsedSummary}</span>
            ) : null}
          </span>
        </button>
        {headerAction ? (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            {headerAction}
          </div>
        ) : null}
      </div>

      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-label`}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <div
            className={`space-y-2 ${bordered ? 'border-t border-ledger-200 px-3 pb-3 pt-3 sm:px-4 sm:pb-4' : 'pt-1'}`}
            inert={!expanded}
          >
            <span id={`${panelId}-label`} className="sr-only">
              {title}
            </span>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
