export interface User {
  id: number;
  name: string;
  username: string;
  email?: string | null;
  role: string;
  must_set_pin?: boolean;
  is_active?: boolean;
}

export interface ManagedUser extends User {
  username: string;
  must_set_pin: boolean;
  is_active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  credit_balance: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  /** Legacy slug string or nested category from API */
  category?: string | Category;
  category_id?: number;
  image_url?: string | null;
  is_active: boolean;
}

export interface Crockery {
  id: number;
  name: string;
  /** Legacy API fields; not shown in master UI */
  available_quantity?: number;
  security_deposit?: string;
  fine_amount?: string;
  is_active?: boolean;
}

export interface OrderItemLine {
  item_id: number;
  quantity: number;
  unit_price?: number;
}

export interface OrderCrockeryLine {
  crockery_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer?: Customer;
  booking_date: string;
  event_date: string;
  event_time: string;
  meal_type: string;
  number_of_persons: number;
  per_plate_cost?: string;
  transportation_charges?: string;
  washing_charges?: string;
  event_address: string;
  special_instructions?: string;
  crockery_required: boolean;
  crockery_charges?: string;
  security_deposit?: string;
  security_charges?: string;
  crockery_remarks?: string;
  total_bill_amount: string;
  advance_paid: string;
  advance_payment_mode?: string | null;
  remaining_amount?: string;
  fine_amount?: string;
  final_amount: string;
  payment_status: string;
  order_status: string;
  delivery_status: string;
  dispatch_timing?: string;
  scheduled_dispatch_at?: string | null;
  rider_name?: string | null;
  rider_mobile?: string | null;
  vehicle_number?: string | null;
  dispatched_at?: string | null;
  items?: {
    item_id: number;
    quantity: number;
    unit_price?: string;
    item_name?: string;
    is_included?: boolean;
  }[];
  crockery_items?: {
    crockery_id: number;
    quantity: number;
    crockery_name?: string;
    is_included?: boolean;
  }[];
}

export interface PaymentAllocation {
  id?: number;
  order_id: number;
  order_number?: string;
  allocated_amount: string;
  discount_amount?: string;
  bill_balance_before?: string;
  bill_balance_after?: string;
}

export interface Payment {
  id: number;
  customer?: Customer;
  amount: string;
  payment_mode: string;
  payment_date: string;
  reference_number?: string;
  remarks?: string;
  surplus_credit: string;
  allocations?: PaymentAllocation[];
}

/** Unpaid or partially paid order shown on the payment form. */
export interface OutstandingOrder {
  id: number;
  order_number: string;
  event_date: string;
  booking_date: string;
  total_bill_amount: string;
  fine_amount?: string;
  final_amount: string;
  advance_paid: string;
  discount_amount?: string;
  remaining_amount: string;
  outstanding_amount: number;
  payment_status: string;
  is_partially_paid?: boolean;
}

export interface CrockeryReturnItem {
  id: number;
  crockery_id: number;
  crockery_name?: string;
  qty_sent: number;
  qty_returned: number;
  qty_lost: number;
  qty_damaged: number;
  fine_per_item: string;
  fine_amount: string;
}

export interface CrockeryReturn {
  id: number;
  order_id: number;
  customer?: Customer;
  order?: Pick<Order, 'order_number' | 'security_deposit' | 'advance_paid'>;
  return_status: string;
  fine_applied: boolean;
  total_fine: string;
  return_date?: string | null;
  notes?: string | null;
  items?: CrockeryReturnItem[];
}

export interface KitchenCombinedRow {
  item_name: string;
  total_quantity: number;
}

export interface KitchenOrderGroup {
  order_id: number;
  order_number: string;
  customer_name?: string;
  meal_type?: string;
  items: { item_name: string; quantity: number }[];
}

export interface Paginated<T> {
  data: T[];
  meta?: { current_page: number; last_page: number; total: number };
}

export interface CrockeryReturnReminder {
  id: number;
  order_id: number;
  order_number?: string;
  customer?: Customer;
  return_status: string;
  days_pending: number;
  reference_date?: string;
  items_summary?: string;
  total_items_sent?: number;
}

export interface DashboardChartSeries {
  labels: string[];
  values: number[];
}

export interface DashboardStatusSlice {
  key: string;
  label: string;
  value: number;
}

export interface DashboardPaymentSlice {
  key: string;
  label: string;
  count: number;
  amount: number;
}

export interface DashboardTopCustomer {
  customer_id: number;
  name: string;
  order_count: number;
  revenue: number;
}

export interface DashboardMetrics {
  todays_orders: number;
  pending_deliveries: number;
  pending_payments: { count: number; total_value: number };
  monthly_revenue: number;
  money_collected_month: number;
  money_outstanding_total: number;
  kitchen_summary: { item_name: string; total_quantity: number }[];
  crockery_pending_returns: number;
  customer_credit_balances: number;
  collections_trend_7d: DashboardChartSeries;
  collections_trend_30d: DashboardChartSeries;
  orders_trend_7d: DashboardChartSeries;
  orders_by_status: DashboardStatusSlice[];
  payments_by_status: DashboardPaymentSlice[];
  top_customers: DashboardTopCustomer[];
}

export interface LoginResponse {
  user: User;
  access_token?: string;
  refresh_token?: string;
  token?: string;
}

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
export const PAYMENT_MODES = ['cash', 'bank_transfer', 'upi', 'cheque'] as const;
export const ITEM_CATEGORIES = [
  'sabji',
  'dal',
  'bread',
  'rice',
  'sweet',
  'starter',
  'beverage',
] as const;
