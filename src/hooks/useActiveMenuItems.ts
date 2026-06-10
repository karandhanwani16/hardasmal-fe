import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { unwrapList } from '../lib/api-helpers';
import type { MenuItem } from '../types';

const ACTIVE_ITEMS_QUERY_KEY = ['items', 'active'] as const;

export function useActiveMenuItems(enabled = true) {
  return useQuery({
    queryKey: ACTIVE_ITEMS_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/items', { params: { active: 1, per_page: 100 } });
      return unwrapList<MenuItem>(data).filter((item) => item.is_active);
    },
    staleTime: 60_000,
  });
}

export { ACTIVE_ITEMS_QUERY_KEY };
