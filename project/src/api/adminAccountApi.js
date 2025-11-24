// src/api/adminAccountApi.js (hoặc đường dẫn của bạn)
import axiosInstance from '../utils/axiosConfig';

const adminAccountApi = {
  createUser: async (userData, photoFile = null) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(userData)], { type: 'application/json' }));
    if (photoFile) formData.append('photo', photoFile);

    const response = await axiosInstance.post('/api/admin/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  // CHỈ CẦN HÀM NÀY LÀ SỬA ĐƯỢC HẾT: THÔNG TIN + ROLE + ẢNH + KÍCH HOẠT
  updateUser: async (userId, userData, photoFile = null) => {
    const formData = new FormData();
    
    // userData giờ có thể chứa: roles, isVerified, password, v.v.
    formData.append('data', new Blob([JSON.stringify(userData)], { type: 'application/json' }));
    
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    const response = await axiosInstance.put(`/api/admin/users/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return response.data;
  },

  // Bạn có thể giữ lại để dùng nhanh khi chỉ muốn bật/tắt tài khoản
  toggleVerifyStatus: async (userId, isVerified) => {
    await axiosInstance.patch(`/api/admin/users/${userId}/verify-status`, { isVerified });
  },

  deleteUser: async (userId) => {
    await axiosInstance.delete(`/api/admin/users/${userId}`);
  },
};

export default adminAccountApi;