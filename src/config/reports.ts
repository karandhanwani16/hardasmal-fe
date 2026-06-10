import type { Column } from '../components/list/types';

export type ReportFilterType = 'date' | 'select' | 'text';

export interface ReportFilterField {
  key: string;
  label: string;
  type: ReportFilterType;
  options?: { value: string; label: string }[];
}

export interface ReportSummaryField {
  key: string;
  label: string;
  format?: 'money' | 'number' | 'text';
}

export interface ReportDefinition {
  slug: string;
  path: string;
  title: string;
  description: string;
  endpoint: string;
  searchPlaceholder?: string;
  requiresCustomer?: boolean;
  initialFilters: Record<string, string>;
  filterFields: ReportFilterField[];
  columns: Column<Record<string, unknown>>[] | ((filters: Record<string, string>) => Column<Record<string, unknown>>[]);
  summaryFields?: ReportSummaryField[];
}

type Row = Record<string, unknown>;

function textCol(key: string, header: string, opts?: { mono?: boolean }): Column<Row> {
  return {
    key,
    header,
    mono: opts?.mono,
    render: (r) => String(r[key] ?? '—'),
  };
}

function moneyCol(key: string, header: string, hideZero = false): Column<Row> {
  return {
    key,
    header,
    mono: true,
    render: (r) => formatCellMoney(r[key], hideZero),
  };
}

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    slug: 'collections',
    path: 'collections',
    title: 'Collections Report',
    description: 'Payments received with allocation details and recorder.',
    endpoint: '/reports/collections',
    searchPlaceholder: 'Customer, phone, reference…',
    initialFilters: { customer_id: '', payment_mode: '', date_from: '', date_to: '' },
    filterFields: [
      { key: 'date_from', label: 'From', type: 'date' },
      { key: 'date_to', label: 'To', type: 'date' },
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      {
        key: 'payment_mode',
        label: 'Payment mode',
        type: 'select',
        options: [
          { value: '', label: 'All modes' },
          { value: 'cash', label: 'Cash' },
          { value: 'bank_transfer', label: 'Bank transfer' },
          { value: 'upi', label: 'UPI' },
          { value: 'cheque', label: 'Cheque' },
        ],
      },
    ],
    columns: [
      textCol('payment_date', 'Date', { mono: true }),
      textCol('customer_name', 'Customer'),
      {
        key: 'payment_mode',
        header: 'Mode',
        render: (r) => String(r.payment_mode ?? '').replace(/_/g, ' '),
      },
      moneyCol('amount', 'Amount'),
      textCol('allocated_orders_label', 'Allocated orders'),
      textCol('recorded_by', 'Recorded by'),
    ],
    summaryFields: [
      { key: 'total_amount', label: 'Total collected', format: 'money' },
      { key: 'payment_count', label: 'Payments', format: 'number' },
    ],
  },
  {
    slug: 'outstanding-receivables',
    path: 'outstanding-receivables',
    title: 'Outstanding Receivables / Aging',
    description: 'Unpaid and partial orders with aging buckets.',
    endpoint: '/reports/outstanding-receivables',
    searchPlaceholder: 'Customer, order number…',
    initialFilters: { customer_id: '', aging_bucket: '', date_from: '', date_to: '' },
    filterFields: [
      { key: 'date_from', label: 'Event from', type: 'date' },
      { key: 'date_to', label: 'Event to', type: 'date' },
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      {
        key: 'aging_bucket',
        label: 'Aging bucket',
        type: 'select',
        options: [
          { value: '', label: 'All buckets' },
          { value: '0-30', label: '0–30 days' },
          { value: '31-60', label: '31–60 days' },
          { value: '61-90', label: '61–90 days' },
          { value: '90+', label: '90+ days' },
        ],
      },
    ],
    columns: [
      textCol('customer_name', 'Customer'),
      textCol('order_number', 'Order', { mono: true }),
      textCol('event_date', 'Event date', { mono: true }),
      moneyCol('final_amount', 'Total'),
      moneyCol('advance_paid', 'Paid'),
      moneyCol('remaining_amount', 'Due'),
      textCol('days_overdue', 'Days overdue', { mono: true }),
      textCol('aging_bucket', 'Bucket', { mono: true }),
    ],
    summaryFields: [
      { key: 'total_outstanding', label: 'Total outstanding', format: 'money' },
      { key: 'order_count', label: 'Orders', format: 'number' },
      { key: 'bucket_0_30', label: '0–30 days', format: 'money' },
      { key: 'bucket_31_60', label: '31–60 days', format: 'money' },
    ],
  },
  {
    slug: 'customer-ledger',
    path: 'customer-ledger',
    title: 'Customer Ledger',
    description: 'Account statement with running balance for a customer.',
    endpoint: '/reports/customer-ledger',
    requiresCustomer: true,
    searchPlaceholder: 'Reference, order…',
    initialFilters: { customer_id: '', date_from: '', date_to: '' },
    filterFields: [
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      { key: 'date_from', label: 'From', type: 'date' },
      { key: 'date_to', label: 'To', type: 'date' },
    ],
    columns: [
      textCol('date', 'Date', { mono: true }),
      {
        key: 'type',
        header: 'Type',
        render: (r) => String(r.type ?? '').replace(/_/g, ' '),
      },
      textCol('reference', 'Reference', { mono: true }),
      textCol('description', 'Description'),
      moneyCol('debit', 'Debit', true),
      moneyCol('credit', 'Credit', true),
      moneyCol('balance', 'Balance'),
    ],
    summaryFields: [
      { key: 'total_debit', label: 'Total debit', format: 'money' },
      { key: 'total_credit', label: 'Total credit', format: 'money' },
      { key: 'closing_balance', label: 'Closing balance', format: 'money' },
    ],
  },
  {
    slug: 'revenue-by-order',
    path: 'revenue-by-order',
    title: 'Revenue by Order',
    description: 'Order-level revenue, advance, and remaining amounts.',
    endpoint: '/reports/revenue-by-order',
    searchPlaceholder: 'Customer, order number…',
    initialFilters: { customer_id: '', payment_status: '', order_status: '', date_from: '', date_to: '' },
    filterFields: [
      { key: 'date_from', label: 'Event from', type: 'date' },
      { key: 'date_to', label: 'Event to', type: 'date' },
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      {
        key: 'payment_status',
        label: 'Payment status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'partial', label: 'Partial' },
          { value: 'paid', label: 'Paid' },
        ],
      },
      {
        key: 'order_status',
        label: 'Order status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'dispatched', label: 'Dispatched' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'completed', label: 'Completed' },
        ],
      },
    ],
    columns: [
      textCol('order_number', 'Order', { mono: true }),
      textCol('customer_name', 'Customer'),
      textCol('event_date', 'Event date', { mono: true }),
      moneyCol('final_amount', 'Final'),
      moneyCol('advance_paid', 'Advance'),
      moneyCol('remaining_amount', 'Remaining'),
      textCol('payment_status', 'Payment'),
      textCol('order_status', 'Order status'),
    ],
    summaryFields: [
      { key: 'total_revenue', label: 'Total revenue', format: 'money' },
      { key: 'total_collected', label: 'Collected', format: 'money' },
      { key: 'total_outstanding', label: 'Outstanding', format: 'money' },
    ],
  },
  {
    slug: 'credit-balances',
    path: 'credit-balances',
    title: 'Credit Balances',
    description: 'Customers holding surplus credit balance.',
    endpoint: '/reports/credit-balances',
    searchPlaceholder: 'Customer name, phone…',
    initialFilters: {},
    filterFields: [],
    columns: [
      textCol('customer_name', 'Customer'),
      textCol('phone', 'Phone', { mono: true }),
      textCol('email', 'Email'),
      moneyCol('credit_balance', 'Credit balance'),
    ],
    summaryFields: [
      { key: 'total_credit', label: 'Total credit', format: 'money' },
      { key: 'customer_count', label: 'Customers', format: 'number' },
    ],
  },
  {
    slug: 'order-pipeline',
    path: 'order-pipeline',
    title: 'Order Pipeline',
    description: 'Orders by status, delivery, and event schedule.',
    endpoint: '/reports/order-pipeline',
    searchPlaceholder: 'Customer, order number…',
    initialFilters: {
      customer_id: '',
      order_status: '',
      delivery_status: '',
      meal_type: '',
      date_from: '',
      date_to: '',
    },
    filterFields: [
      { key: 'date_from', label: 'Event from', type: 'date' },
      { key: 'date_to', label: 'Event to', type: 'date' },
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      {
        key: 'order_status',
        label: 'Order status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'dispatched', label: 'Dispatched' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'completed', label: 'Completed' },
        ],
      },
      {
        key: 'delivery_status',
        label: 'Delivery',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'out_for_delivery', label: 'Out for delivery' },
          { value: 'delivered', label: 'Delivered' },
        ],
      },
      {
        key: 'meal_type',
        label: 'Meal',
        type: 'select',
        options: [
          { value: '', label: 'All meals' },
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'lunch', label: 'Lunch' },
          { value: 'dinner', label: 'Dinner' },
        ],
      },
    ],
    columns: [
      textCol('order_number', 'Order', { mono: true }),
      textCol('customer_name', 'Customer'),
      textCol('event_date', 'Event date', { mono: true }),
      textCol('meal_type', 'Meal'),
      textCol('number_of_persons', 'Persons', { mono: true }),
      textCol('order_status', 'Status'),
      textCol('delivery_status', 'Delivery'),
      moneyCol('final_amount', 'Amount'),
    ],
    summaryFields: [
      { key: 'order_count', label: 'Orders', format: 'number' },
      { key: 'total_persons', label: 'Total persons', format: 'number' },
      { key: 'total_value', label: 'Total value', format: 'money' },
    ],
  },
  {
    slug: 'delivery-tracking',
    path: 'delivery-tracking',
    title: 'Delivery Tracking',
    description: 'Dispatched orders by delivery staff, status, and dispatch date.',
    endpoint: '/reports/delivery-tracking',
    searchPlaceholder: 'Order, customer, rider, mobile…',
    initialFilters: {
      rider_name: '',
      delivery_status: '',
      date_from: '',
      date_to: '',
    },
    filterFields: [
      { key: 'date_from', label: 'Dispatched from', type: 'date' },
      { key: 'date_to', label: 'Dispatched to', type: 'date' },
      { key: 'rider_name', label: 'Delivery staff', type: 'select', options: [] },
      {
        key: 'delivery_status',
        label: 'Delivery status',
        type: 'select',
        options: [
          { value: '', label: 'All statuses' },
          { value: 'out_for_delivery', label: 'Out for delivery' },
          { value: 'delivered', label: 'Delivered' },
        ],
      },
    ],
    columns: [
      {
        key: 'dispatched_at',
        header: 'Dispatched',
        mono: true,
        render: (r) => formatDispatchDate(r.dispatched_at),
      },
      textCol('rider_name', 'Delivery staff'),
      textCol('rider_mobile', 'Mobile', { mono: true }),
      textCol('vehicle_number', 'Vehicle', { mono: true }),
      textCol('order_number', 'Order', { mono: true }),
      textCol('customer_name', 'Customer'),
      textCol('event_date', 'Event', { mono: true }),
      {
        key: 'event_address',
        header: 'Address',
        render: (r) => String(r.event_address ?? '—'),
        className: 'max-w-[14rem] truncate',
      },
      textCol('number_of_persons', 'Persons', { mono: true }),
      {
        key: 'delivery_status',
        header: 'Status',
        render: (r) => String(r.delivery_status ?? '').replace(/_/g, ' '),
      },
    ],
    summaryFields: [
      { key: 'delivery_count', label: 'Dispatches', format: 'number' },
      { key: 'delivered_count', label: 'Delivered', format: 'number' },
      { key: 'out_for_delivery_count', label: 'Out for delivery', format: 'number' },
      { key: 'total_persons', label: 'Total persons', format: 'number' },
      { key: 'unique_riders', label: 'Delivery staff', format: 'number' },
    ],
  },
  {
    slug: 'crockery-returns',
    path: 'crockery-returns',
    title: 'Crockery Returns & Fines',
    description: 'Return status, fines applied, and deposits held.',
    endpoint: '/reports/crockery-returns',
    searchPlaceholder: 'Customer, order…',
    initialFilters: {
      customer_id: '',
      return_status: '',
      fine_applied: '',
      date_from: '',
      date_to: '',
    },
    filterFields: [
      { key: 'date_from', label: 'From', type: 'date' },
      { key: 'date_to', label: 'To', type: 'date' },
      { key: 'customer_id', label: 'Customer', type: 'select', options: [] },
      {
        key: 'return_status',
        label: 'Return status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'partially_returned', label: 'Partially returned' },
          { value: 'fully_returned', label: 'Fully returned' },
          { value: 'fine_applied', label: 'Fine applied' },
        ],
      },
      {
        key: 'fine_applied',
        label: 'Fine applied',
        type: 'select',
        options: [
          { value: '', label: 'Any' },
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' },
        ],
      },
    ],
    columns: [
      textCol('order_number', 'Order', { mono: true }),
      textCol('customer_name', 'Customer'),
      textCol('return_status', 'Return status'),
      {
        key: 'fine_applied',
        header: 'Fine?',
        render: (r) => (r.fine_applied ? 'Yes' : 'No'),
      },
      moneyCol('total_fine', 'Fine'),
      moneyCol('security_deposit', 'Deposit'),
      textCol('return_date', 'Return date', { mono: true }),
    ],
    summaryFields: [
      { key: 'record_count', label: 'Records', format: 'number' },
      { key: 'total_fines', label: 'Total fines', format: 'money' },
      { key: 'pending_count', label: 'Pending', format: 'number' },
    ],
  },
  {
    slug: 'kitchen-volume',
    path: 'kitchen-volume',
    title: 'Kitchen Volume',
    description: 'Item quantities aggregated by date range.',
    endpoint: '/reports/kitchen-volume',
    searchPlaceholder: 'Item or order…',
    initialFilters: { date_from: '', date_to: '', meal_type: '', grouped: 'combined' },
    filterFields: [
      { key: 'date_from', label: 'From', type: 'date' },
      { key: 'date_to', label: 'To', type: 'date' },
      {
        key: 'meal_type',
        label: 'Meal',
        type: 'select',
        options: [
          { value: '', label: 'All meals' },
          { value: 'breakfast', label: 'Breakfast' },
          { value: 'lunch', label: 'Lunch' },
          { value: 'dinner', label: 'Dinner' },
        ],
      },
      {
        key: 'grouped',
        label: 'View',
        type: 'select',
        options: [
          { value: 'combined', label: 'Combined totals' },
          { value: 'orders', label: 'By order' },
        ],
      },
    ],
    columns: (filters) =>
      filters.grouped === 'orders'
        ? [
            textCol('order_number', 'Order', { mono: true }),
            textCol('event_date', 'Date', { mono: true }),
            textCol('meal_type', 'Meal'),
            textCol('item_name', 'Item'),
            textCol('total_quantity', 'Qty', { mono: true }),
          ]
        : [textCol('item_name', 'Item'), textCol('total_quantity', 'Total qty', { mono: true })],
    summaryFields: [
      { key: 'total_quantity', label: 'Total quantity', format: 'number' },
      { key: 'line_count', label: 'Lines', format: 'number' },
    ],
  },
  {
    slug: 'period-summary',
    path: 'period-summary',
    title: 'Daily / Monthly Summary',
    description: 'Collections, new orders, and outstanding totals by period.',
    endpoint: '/reports/period-summary',
    initialFilters: { period: 'daily', date_from: '', date_to: '' },
    filterFields: [
      {
        key: 'period',
        label: 'Period',
        type: 'select',
        options: [
          { value: 'daily', label: 'Daily' },
          { value: 'monthly', label: 'Monthly' },
        ],
      },
      { key: 'date_from', label: 'From', type: 'date' },
      { key: 'date_to', label: 'To', type: 'date' },
    ],
    columns: [
      textCol('period_label', 'Period'),
      moneyCol('collections', 'Collections'),
      textCol('new_orders_count', 'New orders', { mono: true }),
      moneyCol('new_orders_value', 'Order value'),
      moneyCol('outstanding_snapshot', 'Outstanding'),
    ],
    summaryFields: [
      { key: 'total_collections', label: 'Total collections', format: 'money' },
      { key: 'total_new_orders', label: 'New orders', format: 'number' },
      { key: 'current_outstanding_total', label: 'Current outstanding', format: 'money' },
    ],
  },
];

export function getReportByPath(path: string): ReportDefinition | undefined {
  return REPORT_DEFINITIONS.find((r) => r.path === path);
}

function formatCellMoney(value: unknown, hideZero = false): string {
  const n = Number(value);
  if (hideZero && (!n || n === 0)) return '—';
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatDispatchDate(value: unknown): string {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export type ReportNavItem = { to: string; label: string };

export const REPORT_NAV_ITEMS: ReportNavItem[] = REPORT_DEFINITIONS.map((r) => ({
  to: `/reports/${r.path}`,
  label: r.title
    .replace(' Report', '')
    .replace(' / Aging', '')
    .replace('Daily / Monthly Summary', 'Period Summary'),
}));
