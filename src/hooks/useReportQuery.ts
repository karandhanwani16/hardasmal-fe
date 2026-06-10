import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { buildListParams, unwrapPaginated, type ListMeta, type ListQueryParams } from '../lib/pagination';

export interface ReportQueryResult<T> {
  items: T[];
  meta: ListMeta | undefined;
  summary: Record<string, unknown> | null | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  refetch: () => void;
}

export interface UseReportQueryOptions {
  endpoint: string;
  queryKey: string[];
  listParams: ListQueryParams;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  enabled?: boolean;
}

export function useReportQuery<T extends Record<string, unknown>>({
  endpoint,
  queryKey,
  listParams,
  sortBy,
  sortDir,
  enabled = true,
}: UseReportQueryOptions): ReportQueryResult<T> {
  const { page, perPage, search, filters } = listParams;

  const query = useQuery({
    queryKey: [...queryKey, page, perPage, search, filters, sortBy, sortDir],
    enabled,
    queryFn: async () => {
      const params: Record<string, string | number> = {
        ...buildListParams(listParams),
      };
      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_dir = sortDir;
      }

      const { data } = await api.get(endpoint, { params });
      const paginated = unwrapPaginated<T>(data, perPage);
      const summary =
        data && typeof data === 'object' && 'summary' in data
          ? (data as { summary: Record<string, unknown> | null }).summary
          : null;

      return { ...paginated, summary };
    },
  });

  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
