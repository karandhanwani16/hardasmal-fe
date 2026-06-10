import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
  /** Hides the primary action on viewports below lg (use with list FAB). */
  hideActionOnMobile?: boolean;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  children,
  hideActionOnMobile,
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ledger-700">{description}</p>}
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        {children}
        {actionLabel && onAction && (
          <Button
            type="button"
            className={`w-full sm:w-auto ${hideActionOnMobile ? 'hidden lg:inline-flex' : ''}`}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
