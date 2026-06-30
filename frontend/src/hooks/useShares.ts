import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createShare, deleteShare, getShares } from '../api/shares';

export const sharesKey = (docId: string) => ['shares', docId] as const;

export function useShares(docId: string) {
  return useQuery({
    queryKey: sharesKey(docId),
    queryFn: () => getShares(docId),
    staleTime: 10_000,
  });
}

export function useCreateShare(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { shared_with: string; permission: 'view' | 'edit' }) =>
      createShare(docId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sharesKey(docId) }),
  });
}

export function useDeleteShare(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteShare(docId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: sharesKey(docId) }),
  });
}
