// src/contexts/ClinicContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clinicApi } from '../api/clinicApi';

const ClinicContext = createContext(null);

export function ClinicProvider({ children }) {
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClinicInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicApi.getPublicClinicInfo();
      setClinicInfo(data);
    } catch (err) {
      setError(err);
      console.error('Error loading clinic info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinicInfo();
  }, [fetchClinicInfo]);

  // Hàm để refresh clinic info (sau khi admin cập nhật)
  const refreshClinicInfo = useCallback(() => {
    fetchClinicInfo();
  }, [fetchClinicInfo]);

  const value = {
    clinicInfo,
    loading,
    error,
    refreshClinicInfo,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
}

