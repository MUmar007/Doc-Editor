import { apiClient } from './client';
import type { Document, DocumentVersion } from '../types';

export const listVersions = (docId: string): Promise<DocumentVersion[]> =>
  apiClient.get<DocumentVersion[]>(`/api/documents/${docId}/versions`).then((r) => r.data);

export const saveVersion = (docId: string): Promise<DocumentVersion> =>
  apiClient.post<DocumentVersion>(`/api/documents/${docId}/versions`).then((r) => r.data);

export const restoreVersion = (docId: string, versionId: string): Promise<Document> =>
  apiClient
    .post<Document>(`/api/documents/${docId}/versions/${versionId}/restore`)
    .then((r) => r.data);
