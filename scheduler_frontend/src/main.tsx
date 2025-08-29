import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';
import { theme } from './theme/theme';
import { authService } from './services/auth.service';
import { useAuthStore } from './store/auth.store';

// Ensure API client has the saved JWT before the app renders
authService.bootstrap();

// (Optional) hydrate Zustand auth store for components that read from it
try {
  useAuthStore.getState().bootstrap?.();
} catch {
  // no-op if store not loaded yet
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);