import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3696F5', // BMW-like blue
      light: '#64B5F6',
      dark: '#1E88E5',
    },
    secondary: {
      main: '#F2F2F2', // Light silver/gray for accents
      light: '#FFFFFF',
      dark: '#BDBDBD',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E',   // Slightly lighter dark for cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: 0,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: 0,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          boxShadow: 'none',
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
          },
          background: 'linear-gradient(145deg, #1E1E1E 0%, #2D2D2D 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
        },
        elevation2: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

export default theme;