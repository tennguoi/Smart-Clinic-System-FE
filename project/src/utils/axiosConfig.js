import axios from 'axios';
import { authService } from '../services/authService';
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    // Chỉ log trong development mode
    if (process.env.NODE_ENV === 'development') {
      if (token) {
        console.log('Axios request - Token:', token.substring(0, 50) + '...');
      } else {
        console.warn('No token found in localStorage');
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Flag để tránh redirect nhiều lần (reset khi page reload)
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response) => {
    // Reset flag khi có response thành công (để có thể redirect lại nếu cần)
    isRedirecting = false;
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      const currentPath = window.location.pathname;
      
      // Chỉ redirect nếu:
      // 1. Chưa redirect rồi
      // 2. Không phải đang ở trang login hoặc verify-2fa
      // 3. Không phải đang ở protected route (để ProtectedRoute xử lý)
      // 4. Không phải đang ở public route (như /services, /about, etc.)
      const isProtectedRoute = currentPath.startsWith('/admin') || 
                               currentPath.startsWith('/doctor') || 
                               currentPath.startsWith('/reception');
      
      // Danh sách các public routes không nên redirect
      const publicRoutes = ['/', '/services', '/about', '/doctors', '/pricing', '/news', '/appointment', '/appointments/tracking', '/danh-gia', '/profile'];
      const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));
      
      if (!isRedirecting && 
          !currentPath.includes('/login') && 
          !currentPath.includes('/verify-2fa') &&
          !isProtectedRoute &&
          !isPublicRoute) {
        // Chỉ redirect nếu không phải protected route
        // Protected route sẽ được ProtectedRoute xử lý
        isRedirecting = true;
        
        // Lưu URL hiện tại để có thể redirect lại sau khi login
        const returnUrl = currentPath;
        authService.logout();
        
        // Lưu returnUrl vào sessionStorage để có thể redirect lại sau khi login
        if (returnUrl && returnUrl !== '/login') {
          sessionStorage.setItem('returnUrl', returnUrl);
        }
        
        // Sử dụng replace để không tạo history entry
        window.location.replace('/login');
      } else if (isProtectedRoute && !isRedirecting) {
        // Nếu đang ở protected route, chỉ logout và để ProtectedRoute xử lý redirect
        // Không redirect ngay ở đây để tránh nhảy trang
        // Chỉ logout một lần
        isRedirecting = true;
        authService.logout();
        // Reset flag sau một khoảng thời gian ngắn để cho phép ProtectedRoute xử lý
        setTimeout(() => {
          isRedirecting = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
