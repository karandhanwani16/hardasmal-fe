import type { NavIconId } from './navigation';

export type HomeTileTheme = {
  hint: string;
  stripe: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  border: string;
  borderActive: string;
  iconBg: string;
  iconFg: string;
};

const TILE_THEMES: Record<NavIconId, HomeTileTheme> = {
  home: {
    hint: 'Back to menu',
    stripe: 'bg-ledger-700',
    surface: 'bg-ledger-100/80',
    surfaceHover: 'hover:bg-ledger-100',
    surfaceActive: 'bg-ledger-100',
    border: 'border-ledger-200',
    borderActive: 'border-ledger-700/40',
    iconBg: 'bg-ledger-700',
    iconFg: 'text-white',
  },
  orders: {
    hint: 'Take & change orders',
    stripe: 'bg-terracotta-600',
    surface: 'bg-terracotta-500/10',
    surfaceHover: 'hover:bg-terracotta-500/15',
    surfaceActive: 'bg-terracotta-500/18',
    border: 'border-terracotta-600/25',
    borderActive: 'border-terracotta-600/50',
    iconBg: 'bg-terracotta-600',
    iconFg: 'text-white',
  },
  delivery: {
    hint: 'Send food out',
    stripe: 'bg-dispatch',
    surface: 'bg-dispatch/10',
    surfaceHover: 'hover:bg-dispatch/15',
    surfaceActive: 'bg-dispatch/18',
    border: 'border-dispatch/25',
    borderActive: 'border-dispatch/50',
    iconBg: 'bg-dispatch',
    iconFg: 'text-white',
  },
  payments: {
    hint: 'Record money received',
    stripe: 'bg-paid',
    surface: 'bg-paid/10',
    surfaceHover: 'hover:bg-paid/15',
    surfaceActive: 'bg-paid/18',
    border: 'border-paid/25',
    borderActive: 'border-paid/50',
    iconBg: 'bg-paid',
    iconFg: 'text-white',
  },
  returns: {
    hint: 'Plates coming back',
    stripe: 'bg-due',
    surface: 'bg-due/10',
    surfaceHover: 'hover:bg-due/15',
    surfaceActive: 'bg-due/18',
    border: 'border-due/25',
    borderActive: 'border-due/50',
    iconBg: 'bg-due',
    iconFg: 'text-white',
  },
  reminders: {
    hint: 'Things to check',
    stripe: 'bg-alert',
    surface: 'bg-alert/10',
    surfaceHover: 'hover:bg-alert/15',
    surfaceActive: 'bg-alert/18',
    border: 'border-alert/25',
    borderActive: 'border-alert/50',
    iconBg: 'bg-alert',
    iconFg: 'text-white',
  },
  kitchen: {
    hint: 'What to cook today',
    stripe: 'bg-kitchen',
    surface: 'bg-kitchen/10',
    surfaceHover: 'hover:bg-kitchen/15',
    surfaceActive: 'bg-kitchen/18',
    border: 'border-kitchen/25',
    borderActive: 'border-kitchen/50',
    iconBg: 'bg-kitchen',
    iconFg: 'text-white',
  },
  customers: {
    hint: 'All client details',
    stripe: 'bg-terracotta-500',
    surface: 'bg-terracotta-500/8',
    surfaceHover: 'hover:bg-terracotta-500/12',
    surfaceActive: 'bg-terracotta-500/15',
    border: 'border-terracotta-500/25',
    borderActive: 'border-terracotta-500/45',
    iconBg: 'bg-terracotta-500',
    iconFg: 'text-white',
  },
  crockery: {
    hint: 'Plates, glasses, spoons',
    stripe: 'bg-due',
    surface: 'bg-due/8',
    surfaceHover: 'hover:bg-due/12',
    surfaceActive: 'bg-due/15',
    border: 'border-due/20',
    borderActive: 'border-due/40',
    iconBg: 'bg-due',
    iconFg: 'text-white',
  },
  categories: {
    hint: 'Menu groups',
    stripe: 'bg-dispatch',
    surface: 'bg-dispatch/8',
    surfaceHover: 'hover:bg-dispatch/12',
    surfaceActive: 'bg-dispatch/15',
    border: 'border-dispatch/20',
    borderActive: 'border-dispatch/40',
    iconBg: 'bg-dispatch/90',
    iconFg: 'text-white',
  },
  items: {
    hint: 'Dishes & prices',
    stripe: 'bg-kitchen',
    surface: 'bg-kitchen/8',
    surfaceHover: 'hover:bg-kitchen/12',
    surfaceActive: 'bg-kitchen/15',
    border: 'border-kitchen/20',
    borderActive: 'border-kitchen/40',
    iconBg: 'bg-kitchen',
    iconFg: 'text-white',
  },
  reports: {
    hint: 'Totals & accounts',
    stripe: 'bg-ledger-700',
    surface: 'bg-ledger-100/90',
    surfaceHover: 'hover:bg-ledger-100',
    surfaceActive: 'bg-ledger-100',
    border: 'border-ledger-200',
    borderActive: 'border-ledger-700/40',
    iconBg: 'bg-ledger-700',
    iconFg: 'text-white',
  },
  more: {
    hint: 'More options',
    stripe: 'bg-ledger-700',
    surface: 'bg-ledger-100/80',
    surfaceHover: 'hover:bg-ledger-100',
    surfaceActive: 'bg-ledger-100',
    border: 'border-ledger-200',
    borderActive: 'border-ledger-700/40',
    iconBg: 'bg-ledger-700',
    iconFg: 'text-white',
  },
  users: {
    hint: 'Add staff logins',
    stripe: 'bg-terracotta-600',
    surface: 'bg-terracotta-500/8',
    surfaceHover: 'hover:bg-terracotta-500/12',
    surfaceActive: 'bg-terracotta-500/15',
    border: 'border-terracotta-600/25',
    borderActive: 'border-terracotta-600/45',
    iconBg: 'bg-terracotta-600',
    iconFg: 'text-white',
  },
};

const REPORT_HINTS: Record<string, string> = {
  '/reports/collections': 'Money received',
  '/reports/outstanding-receivables': 'Who owes us',
  '/reports/customer-ledger': 'One client account',
  '/reports/revenue-by-order': 'Order earnings',
  '/reports/credit-balances': 'Extra client money',
  '/reports/order-pipeline': 'All order stages',
  '/reports/delivery-tracking': 'Rider deliveries',
  '/reports/crockery-returns': 'Plates & fines',
  '/reports/kitchen-volume': 'How much to cook',
  '/reports/period-summary': 'Day / month totals',
};

/** Report tiles reuse one palette but get unique hints by route. */
const REPORT_TILE_OVERRIDES: Partial<HomeTileTheme> = {
  stripe: 'bg-paid',
  surface: 'bg-paid/8',
  surfaceHover: 'hover:bg-paid/12',
  surfaceActive: 'bg-paid/14',
  border: 'border-paid/20',
  borderActive: 'border-paid/40',
  iconBg: 'bg-paid',
  iconFg: 'text-white',
};

export function getHomeTileTheme(icon: NavIconId, path?: string): HomeTileTheme {
  const base = TILE_THEMES[icon];
  const hintOverride = path ? REPORT_HINTS[path] : undefined;

  if (icon === 'reports' && path) {
    return {
      ...base,
      ...REPORT_TILE_OVERRIDES,
      hint: hintOverride ?? base.hint,
    };
  }

  if (hintOverride) {
    return { ...base, hint: hintOverride };
  }

  return base;
}

export const HOME_SECTION_LABELS: Record<string, string> = {
  Operations: 'Every day',
  Management: 'Follow up',
  Catalog: 'Menu setup',
  Reports: 'Accounts & totals',
};
