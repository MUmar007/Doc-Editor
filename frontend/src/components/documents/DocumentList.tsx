import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PeopleIcon from '@mui/icons-material/People';
import { Alert, Box, List, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { DocumentListItemCard } from './DocumentListItem';

export function DocumentList() {
  const [tab, setTab] = useState(0);
  const { data, isLoading, error } = useDocuments();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Alert severity="error">Failed to load documents</Alert>;

  const owned = data?.owned ?? [];
  const shared = data?.shared ?? [];
  const current = tab === 0 ? owned : shared;

  return (
    <Box sx={{ flex: 1 }}>
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab
          icon={<FolderOpenIcon fontSize="small" />}
          iconPosition="start"
          label={`My Documents (${owned.length})`}
          sx={{ textTransform: 'none', minHeight: 48 }}
        />
        <Tab
          icon={<PeopleIcon fontSize="small" />}
          iconPosition="start"
          label={`Shared with Me (${shared.length})`}
          sx={{ textTransform: 'none', minHeight: 48 }}
        />
      </Tabs>

      {current.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="body2">
            {tab === 0
              ? 'No documents yet. Create one to get started.'
              : 'No documents shared with you yet.'}
          </Typography>
        </Box>
      ) : (
        <List sx={{ pt: 1 }}>
          {current.map((doc) => (
            <DocumentListItemCard key={doc.id} doc={doc} />
          ))}
        </List>
      )}
    </Box>
  );
}
