import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Protected Route Component
 * Bảo vệ các route yêu cầu authentication và authorization
 * 
 * @param {ReactNode} children - Component con cần bảo vệ
 * @param {Array<string>} allowedRoles - Danh sách các role được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  // Sử dụng useMemo để tránh re-check mỗi lần render
  const authCheck = useMemo(() => {
    const isAuthenticated = authService.isAuthenticated();
    const userRoles = authService.getRoles();
    
    return {
      isAuthenticated,
      userRoles,
      hasPermission: allowedRoles.length === 0 || 
        allowedRoles.some(role => userRoles.includes(role))
    };
  }, [allowedRoles]);

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!authCheck.isAuthenticated) {
    // Lưu returnUrl để redirect lại sau khi login
    if (location.pathname !== '/login') {
      sessionStorage.setItem('returnUrl', location.pathname);
    }
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles.length > 0 && !authCheck.hasPermission) {
    // Không có quyền, chuyển về trang mặc định của user
    const defaultRoute = authService.getDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  // Có quyền truy cập, render component
  return children;
};

export default ProtectedRoute;
