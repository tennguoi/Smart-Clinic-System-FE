// src/api/invoiceApi.js
import axios from 'axios';

// Tạo instance axios riêng cho hóa đơn
const api = axios.create({
  baseURL: 'http://localhost:8082/api/invoices', // ← sửa port nếu backend bạn chạy khác 8080
  timeout: 10000,
});

// Tự động thêm token từ localStorage (hỗ trợ cả 2 key phổ biến)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')     // ← THÊM DÒNG NÀY (QUAN TRỌNG NHẤT)
              || localStorage.getItem('access_token') 
              || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Các hàm API bạn sẽ dùng
export const invoiceApi = {
  // Lấy danh sách hóa đơn (có phân trang + tìm kiếm)
  getAll: (page = 0, size = 20, search = '') =>
    api.get('', { params: { page, size, search } }),

  // Lấy chi tiết 1 hóa đơn
  getById: (id) => api.get(`/${id}`),

  // Tạo hóa đơn mới
  create: (data) => api.post('', data),

  // Thu tiền (cập nhật paidAmount)
  pay: (id, paidAmount) => api.put(`/${id}/pay`, { paidAmount }),

  // (Tương lai) Hủy hóa đơn
  // cancel: (id, reason) => api.put(`/${id}/cancel`, { reason }),
};

export default invoiceApi;