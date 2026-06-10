import type { MenuItem, User } from '../types';

export function normalizeRole(role: unknown): string {
  if (typeof role === 'string') return role;
  if (role && typeof role === 'object' && 'value' in role) {
    return String((role as { value: string }).value);
  }
  return String(role ?? '');
}

export function normalizeUser(raw: unknown): User {
  const user = unwrapOne<User>(raw);
  return { ...user, role: normalizeRole(user.role) };
}

export function menuItemCategoryId(item: MenuItem): number | undefined {
  if (item.category_id) return item.category_id;
  if (item.category && typeof item.category === 'object' && 'id' in item.category) {
    return item.category.id;
  }
  return undefined;
}

export function menuItemCategoryLabel(item: MenuItem): string {
  if (item.category && typeof item.category === 'object') {
    return item.category.name ?? item.category.slug?.replace(/_/g, ' ') ?? '—';
  }
  if (typeof item.category === 'string') {
    return item.category.replace(/_/g, ' ');
  }
  return '—';
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

export function unwrapOne<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      return inner as T;
    }
  }
  return payload as T;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
