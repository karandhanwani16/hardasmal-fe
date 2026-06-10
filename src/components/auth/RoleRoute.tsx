import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessPath } from '../../lib/roles';

export function RoleRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="text-sm text-ledger-700">Loading…</p>;
  }

  if (!canAccessPath(user, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
