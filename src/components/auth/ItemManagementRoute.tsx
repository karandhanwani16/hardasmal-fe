import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canViewItems } from '../../lib/roles';

export function ItemManagementRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-ledger-700">Loading…</p>;
  }

  if (!canViewItems(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
