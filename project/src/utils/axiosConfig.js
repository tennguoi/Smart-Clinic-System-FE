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
    console.log('Axios request - Token:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization.substring(0, 50) + '...');
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      const isRoomEndpoint = url.includes('/rooms');
      
      // Nếu là lỗi 404 (Not Found) - endpoint chưa được triển khai, không đăng xuất
      if (status === 404) {
        return Promise.reject(error);
      }
      
      // Nếu là lỗi 403 (Forbidden) - không có quyền, không đăng xuất
      if (status === 403) {
        return Promise.reject(error);
      }
      
      // Nếu là lỗi 401 (Unauthorized)
      if (status === 401) {
        // Nếu là endpoint rooms, không đăng xuất (có thể endpoint chưa được triển khai hoặc chưa có quyền)
        // Chỉ reject error để component xử lý
        if (isRoomEndpoint) {
          return Promise.reject(error);
        }
        
        // Đăng xuất chỉ khi thực sự là lỗi authentication (token hết hạn hoặc không hợp lệ)
        // Và không phải là endpoint rooms
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
