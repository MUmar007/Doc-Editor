import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createComment,
  deleteComment,
  listComments,
  updateComment as updateCommentApi,
} from '../api/comments';

export const commentsKey = (docId: string) => ['comments', docId] as const;

export function useComments(docId: string) {
  return useQuery({
    queryKey: commentsKey(docId),
    queryFn: () => listComments(docId),
    staleTime: 15_000,
  });
}

export function useCreateComment(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string }) => createComment(docId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(docId) }),
  });
}

export function useUpdateComment(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      updateCommentApi(docId, id, { resolved }),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(docId) }),
  });
}

export function useDeleteComment(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(docId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(docId) }),
  });
}
