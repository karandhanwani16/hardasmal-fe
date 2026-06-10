import type { CrockeryReturn } from '../types';

/** Crockery dispatched but nothing received yet — primary "awaiting receive" state. */
export function isCrockeryAwaitingReceive(
  row: Pick<CrockeryReturn, 'return_status' | 'fine_applied'>,
): boolean {
  return row.return_status === 'pending' && !row.fine_applied;
}

export function crockeryReturnStatusVariant(
  row: Pick<CrockeryReturn, 'return_status' | 'fine_applied'>,
): string {
  if (row.fine_applied) return 'paid';
  if (row.return_status === 'pending') return 'due';
  if (row.return_status === 'partially_returned') return 'partial';
  if (row.return_status === 'fully_returned') return 'paid';
  return 'pending';
}

/** Table row — strong due tint + left accent so pending rows stand out in the grid. */
export const CROCKERY_PENDING_RECEIVE_TABLE_ROW =
  'border-l-4 border-l-due bg-due/12 border-b-2 border-b-due/45 hover:bg-due/16 dark:bg-due/20 dark:hover:bg-due/26';

/** Card — thick due border + ring so pending returns are obvious at a glance. */
export const CROCKERY_PENDING_RECEIVE_CARD =
  'border-2 border-due/75 bg-due/12 ring-2 ring-due/25 shadow-[0_2px_8px_rgba(156,66,33,0.12)] hover:border-due hover:bg-due/16 dark:bg-due/22 dark:hover:bg-due/28';

/** Receive CTA — filled due button with pulse ring (pending rows only). */
export const CROCKERY_PENDING_RECEIVE_BUTTON =
  'crockery-receive-cta min-h-11 px-5 text-sm font-semibold !bg-due !text-white shadow-md ring-2 ring-due/60 ring-offset-2 hover:!bg-due/90';
