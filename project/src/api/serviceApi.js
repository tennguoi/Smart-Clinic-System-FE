const API_BASE_URL = 'http://localhost:8082';

export const serviceApi = {
  /**
   * Lấy danh sách tất cả dịch vụ (phân trang) - bao gồm photoUrl
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

      // Map data và xử lý photoUrl
      const servicesWithImages = (data.content || []).map(service => ({
        ...service,
        // Xử lý imageUrl thông minh
        imageUrl: service.photoUrl 
          ? (service.photoUrl.startsWith('http://') || service.photoUrl.startsWith('https://'))
            ? service.photoUrl  // External URL → dùng trực tiếp
            : `${API_BASE_URL}${service.photoUrl}`  // Local path → ghép base URL
          : null
      }));

      return {
        services: servicesWithImages,
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
   * 🔍 Tìm kiếm dịch vụ theo category (phân trang) - bao gồm photoUrl
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

      // Map data và xử lý photoUrl
      const servicesWithImages = (data.content || []).map(service => ({
        ...service,
        // Xử lý imageUrl thông minh
        imageUrl: service.photoUrl 
          ? (service.photoUrl.startsWith('http://') || service.photoUrl.startsWith('https://'))
            ? service.photoUrl  // External URL → dùng trực tiếp
            : `${API_BASE_URL}${service.photoUrl}`  // Local path → ghép base URL
          : null
      }));

      return {
        services: servicesWithImages,
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

  /**
   * 🖼️ Lấy chi tiết dịch vụ theo ID (bao gồm photoUrl)
   * @param {string} id - ID của dịch vụ
   */
  getServiceById: async (id) => {
    try {
      const url = `${API_BASE_URL}/api/public/services/${id}`;
      console.log('Fetching service by ID:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const service = await response.json();
      
      // Xử lý imageUrl thông minh
      return {
        ...service,
        imageUrl: service.photoUrl 
          ? (service.photoUrl.startsWith('http://') || service.photoUrl.startsWith('https://'))
            ? service.photoUrl  // External URL → dùng trực tiếp
            : `${API_BASE_URL}${service.photoUrl}`  // Local path → ghép base URL
          : null
      };
    } catch (error) {
      console.error('Error fetching service by ID:', error);
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

/**
 * 🖼️ Helper: Lấy URL ảnh hoặc ảnh placeholder
 */
export const getServiceImage = (service) => {
  // Nếu có imageUrl (đã được xử lý từ API), return nó
  if (service.imageUrl) {
    return service.imageUrl;
  }
  
  // Nếu có photoUrl gốc
  if (service.photoUrl) {
    // Kiểm tra nếu photoUrl đã là full URL (http://... hoặc https://...)
    if (service.photoUrl.startsWith('http://') || service.photoUrl.startsWith('https://')) {
      return service.photoUrl;
    }
    // Nếu là relative path, tạo full URL
    return `${API_BASE_URL}${service.photoUrl}`;
  }
  
  // Fallback: ảnh placeholder theo category
  const placeholders = {
    Consultation: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    Test: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
    Procedure: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400',
  };
  
  return placeholders[service.category] || placeholders.Consultation;
};