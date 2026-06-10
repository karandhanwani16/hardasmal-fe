import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../lib/roles';

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-ledger-700">Loading…</p>;
  }

  if (!isSuperAdmin(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
