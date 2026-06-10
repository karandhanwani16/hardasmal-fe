import type { Crockery, MenuItem } from '../types';
import { menuItemCategoryId, menuItemCategoryLabel } from './api-helpers';

export type MenuLineRow = {
  key: string;
  item_id: number;
  quantity: number;
  included: boolean;
};

export type CrockeryLineRow = {
  key: string;
  crockery_id: number;
  quantity: number;
  included: boolean;
};

export function parsePersonsCount(persons: string): number {
  const n = Number(persons);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 0;
}

export function buildMenuLines(
  catalog: MenuItem[],
  personsCount: number,
  existing?: MenuLineRow[],
  orderItems?: { item_id: number; quantity: number }[],
): MenuLineRow[] {
  const existingByItem = new Map(existing?.map((l) => [l.item_id, l]) ?? []);
  const orderByItem = new Map(orderItems?.map((i) => [i.item_id, i.quantity]) ?? []);
  const editing = orderItems !== undefined;

  return catalog.map((item) => {
    const prev = existingByItem.get(item.id);
    const fromOrder = orderByItem.get(item.id);

    if (editing) {
      return {
        key: prev?.key ?? String(item.id),
        item_id: item.id,
        quantity: fromOrder ?? personsCount,
        included: fromOrder !== undefined,
      };
    }

    return {
      key: prev?.key ?? String(item.id),
      item_id: item.id,
      quantity: prev?.quantity ?? personsCount,
      included: prev?.included ?? false,
    };
  });
}

export function syncMenuLineQuantities(lines: MenuLineRow[], personsCount: number): MenuLineRow[] {
  return lines.map((line) => ({
    ...line,
    quantity: line.included ? personsCount : line.quantity,
  }));
}

export function menuLinesToPayload(
  lines: MenuLineRow[],
): { item_id: number; quantity: number; unit_price: number; is_included: boolean }[] {
  return lines
    .filter((l) => l.included && l.quantity > 0)
    .map((l) => ({
      item_id: l.item_id,
      quantity: l.quantity,
      unit_price: 0,
      is_included: true,
    }));
}

export function countIncludedMenuLines(lines: MenuLineRow[]): number {
  return lines.filter((l) => l.included && l.quantity > 0).length;
}

export type MenuLineCategoryGroup = {
  key: string;
  label: string;
  sortOrder: number;
  lines: MenuLineRow[];
};

export function groupMenuLinesByCategory(lines: MenuLineRow[], catalog: MenuItem[]): MenuLineCategoryGroup[] {
  const itemById = new Map(catalog.map((item) => [item.id, item]));
  const groups = new Map<string, MenuLineCategoryGroup>();

  for (const line of lines) {
    const item = itemById.get(line.item_id);
    const categoryId = item ? menuItemCategoryId(item) : undefined;
    const label = item ? menuItemCategoryLabel(item) : 'Other';
    const sortOrder =
      item?.category && typeof item.category === 'object' ? (item.category.sort_order ?? 9999) : 9999;
    const key = categoryId != null ? `cat-${categoryId}` : `cat-label-${label}`;

    const existing = groups.get(key);
    if (existing) {
      existing.lines.push(line);
      continue;
    }

    groups.set(key, { key, label, sortOrder, lines: [line] });
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.label.localeCompare(b.label);
  });
}

export function buildCrockeryLines(
  catalog: Crockery[],
  personsCount: number,
  existing?: CrockeryLineRow[],
  orderItems?: { crockery_id: number; quantity: number }[],
): CrockeryLineRow[] {
  const existingById = new Map(existing?.map((l) => [l.crockery_id, l]) ?? []);
  const orderById = new Map(orderItems?.map((c) => [c.crockery_id, c.quantity]) ?? []);
  const editing = orderItems !== undefined;

  return catalog.map((crockery) => {
    const prev = existingById.get(crockery.id);
    const fromOrder = orderById.get(crockery.id);

    if (editing) {
      return {
        key: prev?.key ?? String(crockery.id),
        crockery_id: crockery.id,
        quantity: fromOrder ?? personsCount,
        included: fromOrder !== undefined,
      };
    }

    return {
      key: prev?.key ?? String(crockery.id),
      crockery_id: crockery.id,
      quantity: prev?.quantity ?? personsCount,
      included: prev?.included ?? false,
    };
  });
}

export function syncCrockeryLineQuantities(
  lines: CrockeryLineRow[],
  personsCount: number,
): CrockeryLineRow[] {
  return lines.map((line) => ({
    ...line,
    quantity: line.included ? personsCount : line.quantity,
  }));
}

export function crockeryLinesToPayload(
  lines: CrockeryLineRow[],
): { crockery_id: number; quantity: number; is_included: boolean }[] {
  return lines
    .filter((l) => l.included && l.quantity > 0)
    .map((l) => ({
      crockery_id: l.crockery_id,
      quantity: l.quantity,
      is_included: true,
    }));
}

export function countIncludedCrockeryLines(lines: CrockeryLineRow[]): number {
  return lines.filter((l) => l.included && l.quantity > 0).length;
}
