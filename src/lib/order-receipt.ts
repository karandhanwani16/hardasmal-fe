import { menuItemCategoryLabel } from './api-helpers';
import { parseAmount } from './currency';
import type { CrockeryLineRow, MenuLineRow } from './order-lines';
import type { Crockery, Customer, MenuItem, Order } from '../types';

export type DietaryPreference = 'regular' | 'without_onion_garlic' | '';

export const DIETARY_TAG = '[No onion/garlic]';

export const RECEIPT_BRAND = {
  blessing: '---Om Sai Ram---',
  name: 'HARDASMAL',
  tagline: 'RESTAURANT & CATERING SERVICES',
  address: 'Shop No. 250, Opp. Police Station, Ulhasnagar - 421 001.',
  phones: {
    whatsapp: '7378549549',
    landline: '8600998000 / 9324240404',
  },
  title: 'CUSTOMER DELIVERY CONFIRMATION NOTE',
  footer: 'For HARDASMAL RESTAURANT & CATERING SERVICES',
  crockeryNoteHeading: 'NOTE : CHECK ALL CROCKERY ITEMS ON DELIVERY',
  crockeryNoteBody:
    'Any Damage during the function will be charged to the guest as per actuals.',
} as const;

export interface ReceiptMenuRow {
  key: string;
  label: string;
  quantity: string;
}

export interface ReceiptCrockeryRow {
  key: string;
  label: string;
  quantity: string;
}

export interface OrderReceiptData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  persons: number;
  mealType: string;
  dietaryRegular: boolean;
  dietaryWithoutOnionGarlic: boolean;
  menuRows: ReceiptMenuRow[];
  crockeryRows: ReceiptCrockeryRow[];
  extraCrockeryNote: string;
  perPlateCost: number;
  plateSubtotal: number;
  transportationCharges: number;
  washingCharges: number;
  crockeryFine: number;
  totalBill: number;
  advance: number;
  advancePaymentMode: string;
  balance: number;
  totalItems: number;
  deliveryBoyName: string;
}

function formatReceiptDate(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${String(y).slice(-2)}`;
}

function formatReceiptAmount(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('en-IN')}/-`;
}

export function parseDietaryFromInstructions(
  instructions?: string | null,
): DietaryPreference {
  const text = (instructions ?? '').toLowerCase();
  if (text.includes('no onion') || text.includes('without onion') || text.includes(DIETARY_TAG.toLowerCase())) {
    return 'without_onion_garlic';
  }
  if (text.includes('[dietary: regular]')) return 'regular';
  return '';
}

export function applyDietaryToInstructions(
  instructions: string,
  dietary: DietaryPreference,
): string | null {
  let text = instructions.replace(DIETARY_TAG, '').replace('[Dietary: regular]', '').trim();
  if (dietary === 'without_onion_garlic') {
    text = text ? `${DIETARY_TAG} ${text}` : DIETARY_TAG;
  }
  return text.trim() || null;
}

export function displayInstructions(instructions?: string | null): string {
  return (instructions ?? '')
    .replace(DIETARY_TAG, '')
    .replace('[Dietary: regular]', '')
    .trim();
}

interface BuildMenuInput {
  lines: MenuLineRow[];
  catalog: MenuItem[];
}

function buildMenuRows({ lines, catalog }: BuildMenuInput): ReceiptMenuRow[] {
  const catalogById = new Map(catalog.map((i) => [i.id, i]));

  return lines
    .filter((line) => line.included && line.quantity > 0)
    .map((line) => {
      const item = catalogById.get(line.item_id);
      return {
        key: line.key,
        label: item?.name ?? `Item #${line.item_id}`,
        quantity: String(line.quantity),
        sortCategory: item ? menuItemCategoryLabel(item) : 'Other',
      };
    })
    .sort((a, b) => {
      const byCategory = a.sortCategory.localeCompare(b.sortCategory);
      if (byCategory !== 0) return byCategory;
      return a.label.localeCompare(b.label);
    })
    .map(({ key, label, quantity }) => ({ key, label, quantity }));
}

interface BuildCrockeryInput {
  lines: CrockeryLineRow[];
  catalog: Crockery[];
  remarks?: string;
}

function buildCrockeryRows({ lines, catalog, remarks }: BuildCrockeryInput): {
  rows: ReceiptCrockeryRow[];
  extraNote: string;
} {
  const catalogById = new Map(catalog.map((c) => [c.id, c]));

  const rows = lines
    .filter((line) => line.included && line.quantity > 0)
    .map((line) => {
      const crockery = catalogById.get(line.crockery_id);
      return {
        key: line.key,
        label: crockery?.name ?? `Crockery #${line.crockery_id}`,
        quantity: String(line.quantity),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return { rows, extraNote: remarks?.trim() ?? '' };
}

export function formatAdvancePaymentMode(mode?: string | null): string {
  if (mode === 'cash') return 'Cash';
  if (mode === 'upi') return 'UPI';
  return '';
}

export function buildReceiptDataFromDraft(input: {
  orderNumber?: string;
  eventDate: string;
  customer: Pick<Customer, 'name' | 'phone' | 'address'>;
  eventAddress: string;
  mealType: string;
  persons: number;
  dietary: DietaryPreference;
  orderTotal: string;
  perPlateCost?: string;
  transportationCharges?: string;
  washingCharges?: string;
  advancePaid: string;
  advancePaymentMode?: string | null;
  menuLines: MenuLineRow[];
  menuCatalog: MenuItem[];
  crockeryRequired: boolean;
  crockeryLines: CrockeryLineRow[];
  crockeryCatalog: Crockery[];
  crockeryRemarks?: string;
  deliveryBoyName?: string;
  crockeryFine?: string;
  balanceDue?: string;
}): OrderReceiptData {
  const perPlateCost = parseAmount(input.perPlateCost ?? '0');
  const transportationCharges = parseAmount(input.transportationCharges ?? '0');
  const washingCharges = parseAmount(input.washingCharges ?? '0');
  const totalBill = parseAmount(input.orderTotal);
  const crockeryFine = parseAmount(input.crockeryFine ?? '0');
  const advance = parseAmount(input.advancePaid);
  const plateSubtotal = input.persons * perPlateCost;
  const menuRows = buildMenuRows({ lines: input.menuLines, catalog: input.menuCatalog });
  const { rows: crockeryRows, extraNote } = input.crockeryRequired
    ? buildCrockeryRows({
        lines: input.crockeryLines,
        catalog: input.crockeryCatalog,
        remarks: input.crockeryRemarks,
      })
    : { rows: [], extraNote: '' };

  const dietaryWithout = input.dietary === 'without_onion_garlic';
  const dietaryRegular = input.dietary === 'regular';
  const totalItems = menuRows.length + crockeryRows.length;

  return {
    orderNumber: input.orderNumber ?? '—',
    date: formatReceiptDate(input.eventDate),
    customerName: input.customer.name?.trim() ?? '',
    customerAddress: (input.eventAddress || input.customer.address || '').trim(),
    customerPhone: input.customer.phone?.trim() ?? '',
    persons: input.persons,
    mealType: input.mealType,
    dietaryRegular,
    dietaryWithoutOnionGarlic: dietaryWithout,
    menuRows,
    crockeryRows,
    extraCrockeryNote: extraNote,
    perPlateCost,
    plateSubtotal,
    transportationCharges,
    washingCharges,
    crockeryFine,
    totalBill,
    advance,
    advancePaymentMode: formatAdvancePaymentMode(input.advancePaymentMode),
    balance:
      input.balanceDue !== undefined
        ? parseAmount(input.balanceDue)
        : Math.max(0, totalBill - advance + crockeryFine),
    totalItems,
    deliveryBoyName: input.deliveryBoyName?.trim() ?? '',
  };
}

export function buildReceiptDataFromOrder(
  order: Order,
  menuCatalog: MenuItem[],
  crockeryCatalog: Crockery[],
): OrderReceiptData {
  const dietary = parseDietaryFromInstructions(order.special_instructions);
  const menuLines: MenuLineRow[] =
    order.items?.map((item, idx) => ({
      key: String(item.item_id ?? idx),
      item_id: item.item_id,
      quantity: item.quantity,
      included: item.is_included !== false,
    })) ?? [];

  const catalogFromOrder: MenuItem[] =
    menuCatalog.length > 0
      ? menuCatalog
      : (order.items ?? []).map((item) => ({
          id: item.item_id,
          name: item.item_name ?? `Item #${item.item_id}`,
          is_active: true,
        }));

  const crockeryLines: CrockeryLineRow[] =
    order.crockery_items?.map((c, idx) => ({
      key: String(c.crockery_id ?? idx),
      crockery_id: c.crockery_id,
      quantity: c.quantity,
      included: c.is_included !== false,
    })) ?? [];

  const crockeryCatalogFromOrder: Crockery[] =
    crockeryCatalog.length > 0
      ? crockeryCatalog
      : (order.crockery_items ?? []).map((c) => ({
          id: c.crockery_id,
          name: c.crockery_name ?? `Crockery #${c.crockery_id}`,
        }));

  return buildReceiptDataFromDraft({
    orderNumber: order.order_number,
    eventDate: order.event_date,
    customer: {
      name: order.customer?.name ?? '',
      phone: order.customer?.phone ?? '',
      address: order.customer?.address ?? '',
    },
    eventAddress: order.event_address,
    mealType: order.meal_type,
    persons: order.number_of_persons,
    dietary,
    orderTotal: order.total_bill_amount,
    perPlateCost: order.per_plate_cost,
    transportationCharges: order.transportation_charges,
    washingCharges: order.washing_charges,
    advancePaid: order.advance_paid,
    advancePaymentMode: order.advance_payment_mode,
    menuLines,
    menuCatalog: catalogFromOrder,
    crockeryRequired: order.crockery_required,
    crockeryLines,
    crockeryCatalog: crockeryCatalogFromOrder,
    crockeryRemarks: order.crockery_remarks,
    deliveryBoyName: order.rider_name ?? '',
    crockeryFine: order.fine_amount,
    balanceDue: order.final_amount
      ? String(Math.max(0, parseAmount(order.final_amount) - parseAmount(order.advance_paid)))
      : undefined,
  });
}

export { formatReceiptAmount, formatReceiptDate };
