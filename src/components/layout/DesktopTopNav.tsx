import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export function DesktopTopNav() {
  const { user, logout } = useAuth();
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
    <header className="hidden shrink-0 border-b border-ledger-200 bg-surface lg:block">
      <div className="flex min-h-14 items-center gap-4 px-6 xl:px-8">
        <NavLink
          to="/"
          end
          className="shrink-0 rounded-md transition-colors hover:bg-ledger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ledger-400"
        >
          <p className="text-sm font-semibold tracking-tight">Hardasmal</p>
          <p className="text-[11px] text-ledger-700">Catering CMS</p>
        </NavLink>

        <div className="flex-1" aria-hidden />

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
              aria-label="Account menu"
              className="flex min-h-10 max-w-[12rem] items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-ledger-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ledger-100 text-xs font-semibold uppercase text-ledger-900">
                {user?.name?.slice(0, 1) ?? '?'}
              </span>
              <span className="min-w-0 hidden xl:block">
                <span className="block truncate text-sm font-medium">{user?.name}</span>
                <span className="block truncate text-[11px] capitalize text-ledger-700">{user?.role?.replace(/_/g, ' ')}</span>
              </span>
            </button>
            {userOpen ? (
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-ledger-200 bg-surface py-1 shadow-[0_8px_24px_rgba(31,28,24,0.08)]">
                <div className="border-b border-ledger-200 px-3 py-2 xl:hidden">
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
        </div>
      </div>
    </header>
  );
}
