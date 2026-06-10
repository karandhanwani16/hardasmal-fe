import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { unwrapList } from '../lib/api-helpers';
import type { Customer } from '../types';
import { useDebounce } from './useDebounce';

export function useCustomerLookup(phone: string) {
  const debouncedPhone = useDebounce(phone.replace(/\D/g, ''), 400);
  const enabled = debouncedPhone.length >= 6;

  const query = useQuery({
    queryKey: ['customer-lookup', debouncedPhone],
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/customers', {
        params: { search: debouncedPhone, per_page: 5 },
      });
      const list = unwrapList<Customer>(data);
      return list.find((c) => c.phone.replace(/\D/g, '') === debouncedPhone) ?? list[0] ?? null;
    },
  });

  return {
    customer: query.data ?? null,
    isLookingUp: enabled && query.isFetching,
    phoneReady: enabled,
  };
}
