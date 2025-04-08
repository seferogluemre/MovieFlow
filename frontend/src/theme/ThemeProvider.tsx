import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo, useState, createContext, useContext, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemeContextType = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');

  // Apply dark mode class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
  }, [mode]);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // MUI theme
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'light' ? '#2563eb' : '#3b82f6',
          },
          secondary: {
            main: mode === 'light' ? '#f3f4f6' : '#374151',
          },
          background: {
            default: mode === 'light' ? '#ffffff' : '#111827',
            paper: mode === 'light' ? '#ffffff' : '#1f2937',
          },
        },
        typography: {
          fontFamily: 'inherit',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                boxShadow: 'none',
                ':hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = { mode, toggleMode };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
} 