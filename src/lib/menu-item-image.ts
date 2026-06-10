import { menuItemCategoryLabel } from './api-helpers';
import type { MenuItem } from '../types';

/** Local food image for menu picker — item id 5 maps to /images/5.jpg */
export function getMenuItemImageUrl(item: MenuItem): string {
  return `/images/${item.id}.jpg`;
}

export function getMenuItemImageAlt(item: MenuItem): string {
  const category = menuItemCategoryLabel(item);
  return `${item.name} — ${category}`;
}
