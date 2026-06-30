import { apiClient } from './client';
import type { Share } from '../types';

export const getShares = (docId: string): Promise<Share[]> =>
  apiClient.get<Share[]>(`/api/documents/${docId}/shares`).then((r) => r.data);

export const createShare = (
  docId: string,
  data: { shared_with: string; permission: 'view' | 'edit' }
): Promise<Share> =>
  apiClient.post<Share>(`/api/documents/${docId}/shares`, data).then((r) => r.data);

export const deleteShare = (docId: string, userId: string): Promise<void> =>
  apiClient.delete(`/api/documents/${docId}/shares/${userId}`).then(() => undefined);
