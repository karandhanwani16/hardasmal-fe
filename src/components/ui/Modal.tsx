import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { lockPageScroll, unlockPageScroll } from '../../lib/scroll-lock';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /** Tighter header/footer and single-row actions — for multi-step forms on mobile. */
  compact?: boolean;
  /** Wider dialog for printable previews (e.g. delivery receipt). */
  receipt?: boolean;
  /** Text label for the header close control (default: ×). */
  closeLabel?: string;
  closeDisabled?: boolean;
  /** Render above another open modal (portaled to document.body). */
  stacked?: boolean;
  /** Whether to allow overflow of the modal content. */
  isOverflow?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
  compact,
  receipt,
  closeLabel,
  closeDisabled,
  stacked,
  isOverflow = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (stacked) {
        e.preventDefault();
        e.stopPropagation();
      }
      onClose();
    };
    window.addEventListener('keydown', onKey, stacked);
    return () => window.removeEventListener('keydown', onKey, stacked);
  }, [open, onClose, stacked]);

  useEffect(() => {
    if (!open) return;

    lockPageScroll();

    return () => {
      unlockPageScroll();
    };
  }, [open]);

  if (!open) return null;

  const mobileSheet = wide && !receipt;
  const mobileReceipt = receipt;

  const layer = stacked ? 'z-[60]' : 'z-50';

  const modal = (
    <div
      className={`fixed inset-0 ${layer} flex justify-center${
        mobileSheet || mobileReceipt
          ? ' items-stretch p-0 sm:items-center sm:p-4'
          : ' items-end p-3 sm:items-center sm:p-4'
      }${receipt ? ' receipt-modal-host' : ''}`}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-scrim/40${receipt ? ' receipt-modal-backdrop receipt-no-print' : ''}`}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex w-full min-w-0 flex-col overflow-hidden border border-ledger-200 bg-surface shadow-lg ${
          receipt
            ? 'receipt-modal-dialog h-dvh max-h-dvh min-h-0 max-w-none rounded-none border-0 shadow-none sm:mx-4 sm:h-auto sm:max-h-[90vh] sm:max-w-[min(100%,170mm)] sm:rounded-lg sm:border sm:shadow-lg'
            : mobileSheet
              ? 'h-dvh max-h-dvh min-h-0 max-w-none rounded-none border-0 shadow-none sm:mx-4 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:border sm:shadow-lg'
              : `max-h-[min(90dvh,90vh)] min-h-0 rounded-lg sm:mx-4 ${wide ? 'max-w-2xl' : 'max-w-lg'}`
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-between gap-2 border-b border-ledger-200 sm:gap-3 ${
            compact
              ? 'px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-5 sm:py-3 sm:pt-3'
              : 'px-2 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-4'
          }${receipt ? ' receipt-modal-chrome receipt-no-print' : ''}`}
        >
          <h2
            id="modal-title"
            className={`min-w-0 flex-1 pr-1 font-semibold leading-snug tracking-tight ${
              compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
            }`}
          >
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size={compact ? 'sm' : 'md'}
            className={`shrink-0 ${closeLabel ? '' : compact ? 'min-w-9' : 'min-h-11 min-w-11'}`}
            onClick={onClose}
            disabled={closeDisabled}
            aria-label={closeLabel ?? 'Close'}
          >
            {closeLabel ?? '×'}
          </Button>
        </div>
        <div
          className={`min-h-0 min-w-0 flex-1 ${isOverflow ? 'overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y' : ''} overscroll-x-none overscroll-contain${
            receipt
              ? ' receipt-modal-body px-0 py-0 sm:px-5 sm:py-4'
              : compact
                ? ' px-3 py-3 sm:px-5 sm:py-4'
                : ' px-4 py-4 sm:px-5'
          }`}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={`flex shrink-0 border-t border-ledger-200 sm:px-5 sm:py-4 sm:pb-4 ${
              compact
                ? 'flex-row items-center gap-2 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:justify-end'
                : 'flex-col-reverse gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto'
            }${receipt ? ' receipt-modal-chrome receipt-no-print' : ''}`}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
