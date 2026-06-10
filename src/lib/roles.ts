import type { User } from '../types';

export type AppRole = 'super_admin' | 'admin' | 'manager' | 'food_manager';

export function normalizeRole(role: string | undefined): AppRole | null {
  if (!role) return null;
  if (role === 'food_manager') return 'manager';
  return role as AppRole;
}

export function isSuperAdmin(user: User | null | undefined): boolean {
  return normalizeRole(user?.role) === 'super_admin';
}

export function isAdmin(user: User | null | undefined): boolean {
  const role = normalizeRole(user?.role);
  return role === 'admin' || role === 'super_admin';
}

export function isManager(user: User | null | undefined): boolean {
  return normalizeRole(user?.role) === 'manager';
}

/** Manager, admin, or super admin — operational staff */
export function isOperationalStaff(user: User | null | undefined): boolean {
  const role = normalizeRole(user?.role);
  return role === 'manager' || role === 'admin' || role === 'super_admin';
}

export function canManageCatalog(user: User | null | undefined): boolean {
  return isAdmin(user);
}

export function canViewItems(user: User | null | undefined): boolean {
  return isAdmin(user);
}

export function canManageItems(user: User | null | undefined): boolean {
  return isAdmin(user);
}

export function canViewReports(user: User | null | undefined): boolean {
  return isAdmin(user);
}

export function canManageUsers(user: User | null | undefined): boolean {
  return isAdmin(user);
}

export function canManageCustomers(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

export function canAccessPath(user: User | null | undefined, path: string): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  const role = normalizeRole(user.role);
  if (!role) return false;

  if (path === '/' || path.startsWith('/login')) return true;

  const managerPaths = [
    '/orders',
    '/delivery-pending',
    '/payments',
    '/crockery-returns',
    '/reminders',
    '/kitchen',
  ];

  const adminPaths = [
    ...managerPaths,
    '/users',
    '/crockeries',
    '/categories',
    '/items',
    '/reports',
  ];

  if (role === 'manager') {
    return managerPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }

  if (role === 'admin') {
    return adminPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }

  return false;
}
