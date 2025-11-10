const API_BASE_URL = 'http://localhost:8082';

export const serviceApi = {
  /**
   * Lấy danh sách dịch vụ với phân trang
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng items mỗi trang
   */
  getAllServices: async (page = 0, size = 6) => {
    try {
      const url = `${API_BASE_URL}/api/public/services?page=${page}&size=${size}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Services data received:', data);
      console.log('Content array:', data.content);
      
      // Trả về object chứa services và thông tin phân trang
      return {
        services: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
        isFirst: data.first || false,
        isLast: data.last || false
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },
};

/**
 * Helper function để format giá tiền
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Helper function để lấy label category
 */
export const getCategoryLabel = (category) => {
  const categories = {
    Consultation: 'Khám Bệnh',
    Test: 'Thăm Dò',
    Procedure: 'Thủ Thuật',
  };
  return categories[category] || category;
};