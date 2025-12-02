import axiosInstance from '../utils/axiosConfig';

const AdminServiceApi = {
  /**
   * Lấy tất cả dịch vụ (admin - 8 bản ghi/trang) HOẶC Tìm kiếm Dịch vụ
   * @param {number} page
   * @param {number} size
   * @param {object} filters - Bao gồm name, category, isActive, minPrice, maxPrice
   */
  getAllServices: async (page = 0, size = 8, filters = {}) => {
    // Kiểm tra xem có bất kỳ bộ lọc nào được cung cấp (ngoài page/size mặc định)
    const hasFilters = Object.values(filters).some(value => value !== null && value !== undefined && value !== '');

    if (hasFilters) {
        // Nếu có bộ lọc, sử dụng endpoint searchServices
        const params = {
            name: filters.name || undefined,
            category: filters.category || undefined,
            // Chuyển boolean/string 'true'/'false' thành giá trị phù hợp cho backend
            isActive: filters.isActive !== null && filters.isActive !== undefined ? filters.isActive : undefined,
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
            page,
            size
        };

        const response = await axiosInstance.get('/api/admin/services/search', {
            params: params
        });
        return response.data;
    } else {
        // Nếu không có bộ lọc, sử dụng endpoint mặc định
        const response = await axiosInstance.get('/api/admin/services', {
            params: { page, size }
        });
        return response.data;
    }
  },

  /**
   * Lấy chi tiết dịch vụ theo ID
   */
  getServiceById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/services/${id}`);
    return response.data;
  },

  /**
   * Tạo dịch vụ mới
   */
  createService: async (serviceData) => {
    const response = await axiosInstance.post('/api/admin/services', serviceData);
    return response.data;
  },

  /**
   * Cập nhật dịch vụ
   */
  updateService: async (id, serviceData) => {
    const response = await axiosInstance.put(`/api/admin/services/${id}`, serviceData);
    return response.data;
  },

  /**
   * Toggle trạng thái dịch vụ (bật/tắt nhanh)
   */
  toggleServiceStatus: async (id) => {
    const response = await axiosInstance.patch(`/api/admin/services/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Xóa dịch vụ
   */
  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/services/${id}`);
    return response.data;
  },

  /**
   * Upload ảnh dịch vụ
   */
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/api/admin/services/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Cập nhật ảnh cho dịch vụ đã tồn tại
   */
  updateServicePhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.patch(`/api/admin/services/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Xóa ảnh của dịch vụ
   */
  deleteServicePhoto: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/services/${id}/photo`);
    return response.data;
  },

  getAllReviews: async () => {
    const response = await axiosInstance.get('/api/admin/reviews');
    return response.data;
  },

  getReviewSummary: async () => {
    const response = await axiosInstance.get('/api/admin/reviews/summary');
    return response.data;
  },
  getReviewById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/reviews/${id}`);
    return response.data;
  },

  getReviewsByRating: async (rating) => {
    const response = await axiosInstance.get(`/api/admin/reviews/rating/${rating}`);
    return response.data;
  },
  createReview: async (reviewData) => {
    const response = await axiosInstance.post('/api/admin/reviews', reviewData);
    return response.data;
  },
  updateReview: async (id, reviewData) => {
    const response = await axiosInstance.put(`/api/admin/reviews/${id}`, reviewData);
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/reviews/${id}`);
    return response.data;
  },
};

export default AdminServiceApi;