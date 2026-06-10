import type { ReactElement } from 'react';
import type { NavIconId } from '../../config/navigation';

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function OrdersIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function CustomersIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M16 19a4 4 0 0 0-8 0M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19a3 3 0 0 0-2.8-2M4 19a3 3 0 0 1 2.8-2" strokeLinecap="round" />
    </svg>
  );
}

function PaymentsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function MoreIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="6" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RemindersIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" strokeLinejoin="round" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
    </svg>
  );
}

function CrockeryIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M8 3v4M16 3v4M6 7h12v14H6V7Z" strokeLinejoin="round" />
      <path d="M9 11h6M9 15h6" strokeLinecap="round" />
    </svg>
  );
}

function ReturnsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 14 4 9l5-5M4 9h10a5 5 0 0 1 5 5v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KitchenIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 3v8M10 3v8M14 3v8M6 11h8v10H6V11ZM18 3v18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeliveryIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 7h11v8H3V7ZM14 10h4l3 3v2h-7v-5ZM7 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function ReportsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 20V10M12 20V4M18 20v-6" strokeLinecap="round" />
    </svg>
  );
}

function CategoriesIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h7v7H4V7ZM13 7h7v7h-7V7ZM4 16h7v5H4v-5ZM13 16h7v5h-7v-5Z" strokeLinejoin="round" />
    </svg>
  );
}

function ItemsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </svg>
  );
}

const ICON_MAP: Record<NavIconId, (props: IconProps) => ReactElement> = {
  home: HomeIcon,
  orders: OrdersIcon,
  customers: CustomersIcon,
  payments: PaymentsIcon,
  more: MoreIcon,
  reminders: RemindersIcon,
  crockery: CrockeryIcon,
  returns: ReturnsIcon,
  kitchen: KitchenIcon,
  delivery: DeliveryIcon,
  reports: ReportsIcon,
  categories: CategoriesIcon,
  items: ItemsIcon,
  users: UsersIcon,
};

export function NavIcon({ id, className = 'h-5 w-5' }: { id: NavIconId; className?: string }) {
  const Icon = ICON_MAP[id];
  return <Icon className={className} />;
}
