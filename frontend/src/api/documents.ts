import { apiClient } from './client';
import type { Document, DocumentListItem, DocumentsListResponse, TiptapContent } from '../types';

export const listDocuments = (): Promise<DocumentsListResponse> =>
  apiClient.get<DocumentsListResponse>('/api/documents').then((r) => r.data);

export const getDocument = (id: string): Promise<Document> =>
  apiClient.get<Document>(`/api/documents/${id}`).then((r) => r.data);

export const createDocument = (): Promise<Document> =>
  apiClient.post<Document>('/api/documents', {}).then((r) => r.data);

export const updateDocument = (
  id: string,
  data: { title?: string; content?: TiptapContent }
): Promise<Document> =>
  apiClient.patch<Document>(`/api/documents/${id}`, data).then((r) => r.data);

export const deleteDocument = (id: string): Promise<void> =>
  apiClient.delete(`/api/documents/${id}`).then(() => undefined);

export const uploadDocument = (file: File): Promise<Document> => {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post<Document>('/api/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export type { DocumentListItem };
