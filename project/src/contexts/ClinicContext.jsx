// src/contexts/ClinicContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clinicApi } from '../api/clinicApi';

const ClinicContext = createContext(null);

const CACHE_KEY = 'clinic_info_cache';
const CACHE_TIMESTAMP_KEY = 'clinic_info_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

// Helper: Convert relative logo URL to absolute URL
const toAbsoluteLogoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

export function ClinicProvider({ children }) {
  const [clinicInfo, setClinicInfo] = useState(() => {
    // Khởi tạo từ cache nếu có
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          const data = JSON.parse(cached);
          // Convert logoUrl to absolute URL
          if (data && data.logoUrl) {
            data.logoUrl = toAbsoluteLogoUrl(data.logoUrl);
          }
          return data;
        }
      }
    } catch (e) {
      console.error('Error reading cache:', e);
    }
    return null;
  });
  
  // Nếu có cache, loading = false ngay từ đầu
  const hasCache = (() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        return age < CACHE_DURATION;
      }
    } catch (e) {
      return false;
    }
    return false;
  })();
  
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(null);

  const fetchClinicInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicApi.getPublicClinicInfo();
      
      // Convert logoUrl to absolute URL for display
      if (data && data.logoUrl) {
        data.logoUrl = toAbsoluteLogoUrl(data.logoUrl);
      }
      
      setClinicInfo(data);
      // Lưu vào cache
      if (data) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
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
  const refreshClinicInfo = useCallback(async () => {
    // Xóa cache trước khi fetch lại
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    await fetchClinicInfo();
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

