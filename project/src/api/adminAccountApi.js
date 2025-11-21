import axiosInstance from '../utils/axiosConfig';

/**
 * API cho quản lý tài khoản admin
 */
const adminAccountApi = {
  /**
   * Tạo user mới với file ảnh
   * @param {Object} userData - Thông tin user
   * @param {File} photoFile - File ảnh (optional)
   */
  createUser: async (userData, photoFile = null) => {
    const formData = new FormData();
    
    // Thêm data dưới dạng JSON blob
    formData.append('data', new Blob([JSON.stringify(userData)], { 
      type: 'application/json' 
    }));
    
    // Thêm file ảnh nếu có
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    const response = await axiosInstance.post('/api/admin/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Lấy danh sách tất cả users
   */
  getAllUsers: async () => {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data;
  },

  /**
   * Lấy thông tin user theo ID
   * @param {string} userId - UUID của user
   */
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Cập nhật thông tin user với file ảnh
   * @param {string} userId - UUID của user
   * @param {Object} userData - Thông tin cập nhật
   * @param {File} photoFile - File ảnh mới (optional)
   */
  updateUser: async (userId, userData, photoFile = null) => {
    const formData = new FormData();
    
    // Thêm data dưới dạng JSON blob
    formData.append('data', new Blob([JSON.stringify(userData)], { 
      type: 'application/json' 
    }));
    
    // Thêm file ảnh nếu có
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    
    const response = await axiosInstance.put(`/api/admin/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Cập nhật roles của user
   * @param {string} userId - UUID của user
   * @param {Array<string>} roles - Danh sách roles
   */
  updateUserRoles: async (userId, roles) => {
    const response = await axiosInstance.put(`/api/admin/users/${userId}/roles`, {
      roles,
    });
    return response.data;
  },

  /**
   * Xóa user
   * @param {string} userId - UUID của user
   */
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

export default adminAccountApi;