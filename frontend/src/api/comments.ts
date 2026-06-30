import { apiClient } from './client';
import type { Comment } from '../types';

export const listComments = (docId: string): Promise<Comment[]> =>
  apiClient.get<Comment[]>(`/api/documents/${docId}/comments`).then((r) => r.data);

export const createComment = (docId: string, data: { body: string }): Promise<Comment> =>
  apiClient.post<Comment>(`/api/documents/${docId}/comments`, data).then((r) => r.data);

export const updateComment = (
  docId: string,
  commentId: string,
  data: { resolved: boolean }
): Promise<Comment> =>
  apiClient
    .patch<Comment>(`/api/documents/${docId}/comments/${commentId}`, data)
    .then((r) => r.data);

export const deleteComment = (docId: string, commentId: string): Promise<void> =>
  apiClient.delete(`/api/documents/${docId}/comments/${commentId}`).then(() => undefined);
