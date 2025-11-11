import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Protected Route Component
 * Bảo vệ các route yêu cầu authentication và authorization
 * 
 * @param {ReactNode} children - Component con cần bảo vệ
 * @param {Array<string>} allowedRoles - Danh sách các role được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRoles = authService.getRoles();

  // Nếu chưa đăng nhập, chuyển về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles.length > 0) {
    // Kiểm tra user có ít nhất một trong các role được phép không
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      // Không có quyền, chuyển về trang mặc định của user
      const defaultRoute = authService.getDefaultRoute();
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // Có quyền truy cập, render component
  return children;
};

export default ProtectedRoute;
