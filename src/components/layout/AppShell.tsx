import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { DesktopTopNav } from './DesktopTopNav';
import { GlobalBackButton } from './GlobalBackButton';

export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-ledger-50">
      <DesktopTopNav />
      <AppHeader pathname={location.pathname} />

      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>

      <GlobalBackButton />
    </div>
  );
}
