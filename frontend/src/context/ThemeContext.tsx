import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Tema tercihi tipi
type ThemeMode = "light" | "dark";

// Context değer tipi
interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// Varsayılan değerler
const defaultContext: ThemeContextType = {
  mode: "dark",
  toggleTheme: () => {},
};

// Context oluşturma
const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Koyu tema
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0b84ff",
    },
    secondary: {
      main: "#6c5dd3",
    },
    error: {
      main: "#e91e63",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#9e9e9e",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

// Açık tema
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b84ff",
    },
    secondary: {
      main: "#6c5dd3",
    },
    error: {
      main: "#e91e63",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#121212",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProvider bileşeni
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // localStorage'den tema tercihini al, yoksa koyu tema kullan
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode as ThemeMode) || "dark";
  });

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "dark" ? "light" : "dark";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  // Seçilen temayı belirle
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Tema bağlamını kullanmak için özel hook
export const useTheme = () => useContext(ThemeContext);
