import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { unwrapList, unwrapOne } from '../lib/api-helpers';

interface UseCrudOptions {
  endpoint: string;
  queryKey: string[];
  enabled?: boolean;
}

export function useCrud<T extends { id: number }>({
  endpoint,
  queryKey,
  enabled = true,
}: UseCrudOptions) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return unwrapList<T>(data);
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

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
    items: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: removeMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: removeMutation.isPending,
  };
}
