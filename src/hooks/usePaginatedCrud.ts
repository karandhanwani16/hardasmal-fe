import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { unwrapOne } from '../lib/api-helpers';
import type { ListQueryParams } from '../lib/pagination';
import { usePaginatedQuery } from './usePaginatedQuery';

interface UsePaginatedCrudOptions {
  endpoint: string;
  queryKey: string[];
  listParams: ListQueryParams;
  enabled?: boolean;
}

export function usePaginatedCrud<T extends { id: number }>({
  endpoint,
  queryKey,
  listParams,
  enabled = true,
}: UsePaginatedCrudOptions) {
  const queryClient = useQueryClient();
  const list = usePaginatedQuery<T>({ endpoint, queryKey, listParams, enabled });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey[0]] });

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post(endpoint, payload);
      return unwrapOne<T>(data);
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: Record<string, unknown> & { id: number }) => {
      const { data } = await api.put(`${endpoint}/${id}`, payload);
      return unwrapOne<T>(data);
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: invalidate,
  });

  return {
    ...list,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: removeMutation.isPending,
  };
}
