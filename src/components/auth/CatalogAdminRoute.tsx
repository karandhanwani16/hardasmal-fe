import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canManageCatalog } from '../../lib/roles';

export function CatalogAdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="text-sm text-ledger-700">Loading…</p>;
  }

  if (!canManageCatalog(user)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
