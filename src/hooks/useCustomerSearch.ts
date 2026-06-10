import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { unwrapList } from '../lib/api-helpers';
import type { Customer } from '../types';
import { useDebounce } from './useDebounce';

export function useCustomerSearch(query: string, enabled = true) {
  const debounced = useDebounce(query.trim(), 400);

  return useQuery({
    queryKey: ['customers', 'search', debounced],
    enabled: enabled && debounced.length >= 2,
    queryFn: async () => {
      const { data } = await api.get('/customers/search', { params: { q: debounced, limit: 8 } });
      return unwrapList<Customer>(data);
    },
  });
}
