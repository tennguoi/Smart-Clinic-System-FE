// src/api/adminStatisticsApi.js
import axiosInstance from '../utils/axiosConfig';

const adminStatisticsApi = {
  /**
   * Xuất thống kê ra Excel
   * @param {Object} params - Tham số xuất Excel
   * @param {string} params.period - Loại: "day", "week", "month" (mặc định: "month")
   * @param {string} params.date - Ngày tham chiếu (ISO format: YYYY-MM-DD)
   * @param {string} params.startDate - Ngày bắt đầu (ISO format: YYYY-MM-DD)
   * @param {string} params.endDate - Ngày kết thúc (ISO format: YYYY-MM-DD)
   * @returns {Promise<Blob>} - Blob chứa file Excel
   */
  exportStatisticsToExcel: async (params = {}) => {
    const { period = 'month', date, startDate, endDate } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);
    
    if (date) {
      queryParams.append('date', date);
    }
    if (startDate) {
      queryParams.append('startDate', startDate);
    }
    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    const response = await axiosInstance.get('/api/admin/statistics/export', {
      params: Object.fromEntries(queryParams),
      responseType: 'blob', // Quan trọng: phải set responseType là 'blob' để nhận file binary
    });

    return response.data; // Trả về Blob
  },
};

export default adminStatisticsApi;

