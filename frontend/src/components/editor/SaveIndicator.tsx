import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Typography } from '@mui/material';

interface Props {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: Props) {
  if (isSaving) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <SyncIcon fontSize="small" color="disabled" sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
        <Typography variant="caption" color="text.secondary">
          Saving…
        </Typography>
      </Box>
    );
  }
  if (lastSaved) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleIcon fontSize="small" color="success" />
        <Typography variant="caption" color="text.secondary">
          Saved
        </Typography>
      </Box>
    );
  }
  return null;
}
