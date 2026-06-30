import { Box, Toolbar } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDocument } from '../../hooks/useDocuments';
import { Sidebar } from './Sidebar';

interface Props {
  children: React.ReactNode;
}

export function AppShell({ children }: Props) {
  const navigate = useNavigate();
  const createDoc = useCreateDocument();

  const handleCreateDoc = async () => {
    const doc = await createDoc.mutateAsync();
    navigate(`/docs/${doc.id}`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar onCreateDoc={handleCreateDoc} />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
