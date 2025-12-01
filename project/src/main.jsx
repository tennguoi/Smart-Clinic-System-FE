import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClinicProvider } from './contexts/ClinicContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClinicProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ClinicProvider>
    </BrowserRouter>
  </StrictMode>
);