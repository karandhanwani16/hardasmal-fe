import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useDebounce } from './useDebounce';

type DispatchField = 'rider_names' | 'rider_mobiles' | 'vehicle_numbers';

interface DispatchSuggestions {
  rider_names: string[];
  rider_mobiles: string[];
  vehicle_numbers: string[];
}

export function useDispatchSuggestions(field: DispatchField, query: string, enabled = true) {
  const debounced = useDebounce(query.trim(), 300);

  return useQuery({
    queryKey: ['orders', 'dispatch-suggestions', field, debounced],
    enabled,
    queryFn: async () => {
      const params: { field: DispatchField; q?: string } = { field };
      if (debounced.length >= 1) {
        params.q = debounced;
      }
      const { data } = await api.get<DispatchSuggestions>('/orders/dispatch-suggestions', {
        params,
      });
      return data[field] ?? [];
    },
  });
}
