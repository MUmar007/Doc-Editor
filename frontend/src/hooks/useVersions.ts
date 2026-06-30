import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listVersions, restoreVersion, saveVersion } from '../api/versions';
import { documentKey } from './useDocuments';

export const versionsKey = (docId: string) => ['versions', docId] as const;

export function useVersions(docId: string) {
  return useQuery({
    queryKey: versionsKey(docId),
    queryFn: () => listVersions(docId),
    staleTime: 10_000,
  });
}

export function useSaveVersion(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => saveVersion(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: versionsKey(docId) }),
  });
}

export function useRestoreVersion(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreVersion(docId, versionId),
    onSuccess: (doc) => {
      qc.setQueryData(documentKey(docId), doc);
      qc.invalidateQueries({ queryKey: versionsKey(docId) });
    },
  });
}
