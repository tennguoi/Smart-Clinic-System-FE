// src/api/patientApi.js
const API_BASE_URL = 'http://localhost:8082';

export const patientApi = {
  /**
   * Lấy danh sách tất cả bệnh nhân (phân trang)
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng items mỗi trang
   * @param {string} search - Từ khóa tìm kiếm (tên hoặc số điện thoại)
   */
  getAll: async (page = 0, size = 20, search = '') => {
    try {
      const url = `${API_BASE_URL}/api/public/patients?page=${page}&size=${size}&search=${encodeURIComponent(search)}`;
      console.log('Fetching patients from:', url);

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
      console.log('Patients data received:', data);

      return {
        patients: data.content || [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        currentPage: data.number || 0,
        pageSize: data.size || size,
        isFirst: data.first || false,
        isLast: data.last || false,
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },
};