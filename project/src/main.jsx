// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClinicProvider } from './contexts/ClinicContext';
import "./api/i18n.js"; // Import cấu hình i18n
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClinicProvider>
        <App />
      </ClinicProvider>
    </BrowserRouter>
  </StrictMode>
);