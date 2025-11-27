// src/config/toastConfig.js
// Cấu hình chung cho React Hot Toast - dùng cho tất cả trang quản lý

export const toastConfig = {
  position: "top-right",
  containerStyle: {
    top: 80, // Dưới navbar
  },
  toastOptions: {
    duration: 4000, // Mặc định 4 giây
    
    success: {
      duration: 3000, // Success 3 giây
      icon: '✅',
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
        fontSize: '14px',
        minWidth: '250px',
        maxWidth: '400px',
      },
    },
    
    error: {
      duration: 5000, // Error 5 giây
      icon: '❌',
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
        fontSize: '14px',
        minWidth: '250px',
        maxWidth: '400px',
      },
    },
    
    loading: {
      icon: '⏳',
      style: {
        background: '#3B82F6',
        color: 'white',
        fontWeight: '500',
        padding: '10px 16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
        fontSize: '14px',
        minWidth: '250px',
        maxWidth: '400px',
      },
    },
  },
};

