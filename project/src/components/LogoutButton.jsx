import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import axiosInstance from '../utils/axiosConfig';

const LogoutButton = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition ${className}`}
    >
      Đăng xuất
    </button>
  );
};

export default LogoutButton;
