import { Box, Paper, Typography } from '@mui/material';
import { AppShell } from '../components/layout/AppShell';
import { DocumentList } from '../components/documents/DocumentList';
import { useAuthStore } from '../store/authStore';

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppShell>
      <Box sx={{ p: 3, flex: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {user ? `Welcome, ${user.display_name}` : 'Documents'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create, edit, and share your documents
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <DocumentList />
        </Paper>
      </Box>
    </AppShell>
  );
}
