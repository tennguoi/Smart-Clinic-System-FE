const API_BASE_URL = 'http://localhost:8082';

export const serviceApi = {
  /**
   * Lấy danh sách tất cả dịch vụ (phân trang)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng items mỗi trang
   */
  getAllServices: async (page = 0, size = 6) => {
    try {
      const url = `${API_BASE_URL}/api/public/services?page=${page}&size=${size}`;
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Services data received:', data);

      return {
        services: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
        isFirst: data.first || false,
        isLast: data.last || false,
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * 🔍 Tìm kiếm dịch vụ theo category (phân trang)
   * @param {string} category - Danh mục (Consultation / Test / Procedure)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng items mỗi trang
   */
  getServicesByCategory: async (category, page = 0, size = 6) => {
    try {
      const url = `${API_BASE_URL}/api/public/services/search?category=${encodeURIComponent(category)}&page=${page}&size=${size}`;
      console.log('Searching by category:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Filtered services data:', data);

      return {
        services: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
        isFirst: data.first || false,
        isLast: data.last || false,
      };
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },
};

/**
 * Helper: format giá tiền
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Helper: hiển thị tên danh mục tiếng Việt
 */
export const getCategoryLabel = (category) => {
  const categories = {
    Consultation: 'Khám Bệnh',
    Test: 'Thăm Dò',
    Procedure: 'Thủ Thuật',
  };
  return categories[category] || category;
};
