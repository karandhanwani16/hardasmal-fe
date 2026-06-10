import { HomeNavGrid } from '../components/home/HomeNavGrid';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const greeting = getGreeting();

  return (
    <div className="min-w-0">
      <header>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{greeting}</h1>
        <p className="mt-1 text-sm text-ledger-700">
          {user?.name ? `${user.name} · ` : ''}
          Tap a coloured tile to open that section
        </p>
      </header>

      <div className="mt-5 sm:mt-6">
        <HomeNavGrid />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
