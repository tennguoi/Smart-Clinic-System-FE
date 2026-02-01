// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    // Lấy route mặc định dựa trên role
    const defaultRoute = authService.getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  // Chưa đăng nhập → cho phép truy cập trang công khai
  return children;
};

export default PublicRoute;