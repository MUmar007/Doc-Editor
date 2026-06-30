import { Alert, Box, Button, Typography } from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="body2">{this.state.error?.message ?? 'Something went wrong'}</Typography>
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}
