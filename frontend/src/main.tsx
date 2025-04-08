import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import theme from './theme';
import './styles/global.scss';
import './styles/components.scss';
import './index.css';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <MuiThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </MuiThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
