import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1565C0',
      light: '#1976D2',
      dark: '#0D47A1',
    },
    secondary: {
      main: '#455A64',
    },
    background: {
      default: '#0F1923',
      paper: '#162032',
    },
    text: {
      primary: '#E3EAF2',
      secondary: '#90A4AE',
    },
    divider: '#263546',
    error: { main: '#EF5350' },
    success: { main: '#66BB6A' },
    warning: { main: '#FFA726' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Override browser autofill background — Chrome injects blue/yellow
        // which can't be removed via background-color, only via inset box-shadow.
        'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active':
          {
            WebkitBoxShadow: '0 0 0 1000px #162032 inset !important',
            WebkitTextFillColor: '#E3EAF2 !important',
            caretColor: '#E3EAF2',
            transition: 'background-color 5000s ease-in-out 0s',
          },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#0D1B2A', borderBottom: '1px solid #263546' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#111D2C', borderRight: '1px solid #263546' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});
