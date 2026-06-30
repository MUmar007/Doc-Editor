import { Box, CircularProgress } from '@mui/material';

interface Props {
  size?: number;
}

export function LoadingSpinner({ size = 40 }: Props) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
      <CircularProgress size={size} />
    </Box>
  );
}
