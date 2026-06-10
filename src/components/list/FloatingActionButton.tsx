interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
}

export function FloatingActionButton({ label, onClick }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-600 text-white shadow-lg transition-colors hover:bg-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:hidden"
    >
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    </button>
  );
}
