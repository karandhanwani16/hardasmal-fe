import { useEffect, useRef, useState } from 'react';
import { getPageTitle } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AppHeaderProps {
  pathname: string;
}

export function AppHeader({ pathname }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const title = getPageTitle(pathname);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userOpen) return;

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userOpen]);

  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-3 border-b border-ledger-200 bg-surface/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/90 lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
        <p className="text-[11px] text-ledger-700">Hardasmal</p>
      </div>
      <ThemeToggle className="shrink-0" />
      <div className="relative shrink-0" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => setUserOpen((v) => !v)}
          aria-expanded={userOpen}
          aria-label="Account menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ledger-100 text-xs font-semibold uppercase text-ledger-900 transition-colors hover:bg-ledger-200"
        >
          {user?.name?.slice(0, 1) ?? '?'}
        </button>
        {userOpen ? (
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-ledger-200 bg-surface py-1 shadow-[0_8px_24px_rgba(31,28,24,0.08)]">
            <div className="border-b border-ledger-200 px-3 py-2">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs capitalize text-ledger-700">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none px-3 py-2 text-sm"
              onClick={() => {
                setUserOpen(false);
                logout();
              }}
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
