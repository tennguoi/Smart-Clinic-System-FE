// src/api/adminAccountApi.js
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

  /**
   * Lấy danh sách tất cả users với phân trang
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  getAllUsers: async (page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users', {
      params: { page, size }
    });
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

  // ==================== CÁC HÀM TÌM KIẾM CÓ PHÂN TRANG ====================

  /**
   * Tìm kiếm user theo tên hoặc số điện thoại với phân trang
   * @param {string} keyword - Từ khóa tìm kiếm (tên hoặc SĐT)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  searchByNameOrPhone: async (keyword, page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users/search/name-phone', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  /**
   * Tìm kiếm user theo vai trò với phân trang
   * @param {string} roleName - Tên vai trò (vd: "bác sĩ", "tiếp tân")
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  searchByRole: async (roleName, page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users/search/role', {
      params: { roleName, page, size }
    });
    return response.data;
  },

  /**
   * Tìm kiếm user theo trạng thái hoạt động với phân trang
   * @param {boolean} isVerified - true: đã kích hoạt, false: chưa kích hoạt
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  searchByVerifiedStatus: async (isVerified, page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users/search/verified', {
      params: { isVerified, page, size }
    });
    return response.data;
  },

  /**
   * Tìm kiếm user theo giới tính với phân trang
   * @param {string} gender - "male" hoặc "female"
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  searchByGender: async (gender, page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users/search/gender', {
      params: { gender, page, size }
    });
    return response.data;
  },

  /**
   * Tìm kiếm user với nhiều tiêu chí kết hợp và phân trang
   * @param {Object} filters - Object chứa các tiêu chí tìm kiếm
   * @param {string} filters.keyword - Tên hoặc SĐT
   * @param {string} filters.roleName - Vai trò
   * @param {boolean} filters.isVerified - Trạng thái kích hoạt
   * @param {string} filters.gender - Giới tính
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số bản ghi mỗi trang (mặc định 8)
   */
  searchUsers: async (filters = {}, page = 0, size = 8) => {
    const response = await axiosInstance.get('/api/admin/users/search', {
      params: {
        keyword: filters.keyword || undefined,
        roleName: filters.roleName || undefined,
        isVerified: filters.isVerified !== undefined ? filters.isVerified : undefined,
        gender: filters.gender || undefined,
        page,
        size
      }
    });
    return response.data;
  },
};

export default adminAccountApi;