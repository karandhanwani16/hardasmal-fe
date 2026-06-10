import { useLocation, useNavigate } from 'react-router-dom';
import { getSmartBackRoute } from '../../lib/smartBackRoute';

function BackChevronIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobalBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const target = getSmartBackRoute(location.pathname);

  if (!target) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate(target)}
      aria-label="Go back"
      className="fixed z-30 flex h-11 min-h-11 w-11 min-w-11 items-center justify-center rounded-full border border-ledger-200 bg-surface text-ledger-900 shadow-[0_4px_16px_rgba(31,28,24,0.1)] transition-colors hover:border-ledger-700/30 hover:bg-ledger-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500 focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:active:scale-100 left-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 lg:left-6"
    >
      <BackChevronIcon />
    </button>
  );
}
