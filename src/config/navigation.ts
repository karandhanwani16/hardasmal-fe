import { REPORT_NAV_ITEMS } from './reports';
import {
  canManageCatalog,
  canManageCustomers,
  canManageUsers,
  canViewReports,
  isOperationalStaff,
  isSuperAdmin,
} from '../lib/roles';
import type { User } from '../types';

export type NavIconId =
  | 'home'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'more'
  | 'reminders'
  | 'crockery'
  | 'returns'
  | 'kitchen'
  | 'reports'
  | 'categories'
  | 'items'
  | 'delivery'
  | 'users';

export type NavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  icon: NavIconId;
  end?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

const HOME_NAV: NavItem = { to: '/', label: 'Home', shortLabel: 'Home', icon: 'home', end: true };

const OPERATIONS_NAV: NavItem[] = [
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/delivery-pending', label: 'Delivery', shortLabel: 'Delivery', icon: 'delivery' },
  { to: '/payments', label: 'Payments', icon: 'payments' },
  { to: '/crockery-returns', label: 'Crockery Returns', shortLabel: 'Returns', icon: 'returns' },
];

const MANAGEMENT_NAV: NavItem[] = [
  { to: '/users', label: 'Staff Users', shortLabel: 'Users', icon: 'users' },
  { to: '/customers', label: 'Customers', shortLabel: 'Clients', icon: 'customers' },
  { to: '/reminders', label: 'Reminders', icon: 'reminders' },
  { to: '/kitchen', label: 'Kitchen Summary', shortLabel: 'Kitchen', icon: 'kitchen' },
];

const CATALOG_NAV: NavItem[] = [
  { to: '/crockeries', label: 'Crockery', icon: 'crockery' },
  { to: '/categories', label: 'Categories', icon: 'categories' },
  { to: '/items', label: 'Item Management', shortLabel: 'Items', icon: 'items' },
];

const REPORTS_NAV: NavItem[] = REPORT_NAV_ITEMS.map((item) => ({
  ...item,
  icon: 'reports' as NavIconId,
}));

export type HomeNavSection = {
  title: string;
  items: NavItem[];
};

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/reminders': 'Reminders',
  '/orders': 'Orders',
  '/delivery-pending': 'Delivery',
  '/customers': 'Customers',
  '/users': 'Staff Users',
  '/items': 'Item Management',
  '/categories': 'Categories',
  '/crockeries': 'Crockery',
  '/crockery-returns': 'Crockery Returns',
  '/payments': 'Payments',
  '/kitchen': 'Kitchen Summary',
  '/reports': 'Reports',
};

function filterNavItems(items: NavItem[], user: User | null | undefined): NavItem[] {
  if (!user) return [];

  return items.filter((item) => {
    if (item.to === '/customers') return canManageCustomers(user);
    if (item.to === '/users') return canManageUsers(user);
    if (item.to === '/crockeries' || item.to === '/categories' || item.to === '/items') {
      return canManageCatalog(user);
    }
    if (item.to.startsWith('/reports')) return canViewReports(user);
    return isOperationalStaff(user);
  });
}

export function buildHomeSections(user: User | null | undefined): HomeNavSection[] {
  if (!isOperationalStaff(user) && !isSuperAdmin(user)) {
    return [{ title: 'Home', items: [HOME_NAV] }];
  }

  const operations = filterNavItems(OPERATIONS_NAV, user);
  const management = filterNavItems(MANAGEMENT_NAV, user);
  const catalog = filterNavItems(CATALOG_NAV, user);
  const reports = canViewReports(user) ? REPORTS_NAV : [];

  return [
    { title: 'Operations', items: operations },
    { title: 'Management', items: management },
    ...(catalog.length > 0 ? [{ title: 'Catalog', items: catalog }] : []),
    ...(reports.length > 0 ? [{ title: 'Reports', items: reports }] : []),
  ].filter((section) => section.items.length > 0);
}

export function buildNavigation(user: User | null | undefined) {
  const sections = buildHomeSections(user);
  const desktopMain = sections.flatMap((section) => section.items);

  return {
    home: HOME_NAV,
    operations: filterNavItems(OPERATIONS_NAV, user),
    management: filterNavItems(MANAGEMENT_NAV, user),
    admin: filterNavItems(CATALOG_NAV, user),
    navSections: sections.filter((s) => s.title !== 'Reports'),
    reports: canViewReports(user) ? REPORTS_NAV : [],
    desktopMain,
  };
}

export function getPageTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  if (pathname.startsWith('/reports/')) {
    const report = REPORT_NAV_ITEMS.find((item) => item.to === pathname);
    if (report) return report.label;
    return 'Report';
  }

  const match = Object.entries(ROUTE_TITLES).find(([path]) => path !== '/' && pathname.startsWith(path));
  return match?.[1] ?? 'Hardasmal';
}
