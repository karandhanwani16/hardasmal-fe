import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { buildListParams, unwrapPaginated, type ListMeta, type ListQueryParams } from '../lib/pagination';

export interface UsePaginatedQueryOptions {
  endpoint: string;
  queryKey: string[];
  listParams: ListQueryParams;
  enabled?: boolean;
}

export function usePaginatedQuery<T>({
  endpoint,
  queryKey,
  listParams,
  enabled = true,
}: UsePaginatedQueryOptions) {
  const { page, perPage, search, filters } = listParams;

  const query = useQuery({
    queryKey: [...queryKey, page, perPage, search, filters],
    enabled,
    queryFn: async () => {
      const params = buildListParams(listParams);
      const { data } = await api.get(endpoint, { params });
      return unwrapPaginated<T>(data, perPage);
    },
  });

  const result = query.data;
  const items = result?.data ?? [];
  const meta: ListMeta | undefined = result?.meta;

  return {
    items,
    meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
