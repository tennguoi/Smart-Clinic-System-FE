// src/api/billingApi.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082';
const API_URL = `${API_BASE}/api/billing`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn token từ localStorage (hỗ trợ nhiều key)
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi chung (tùy chọn – giúp debug dễ hơn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message;
    console.error('Billing API Error:', msg);
    return Promise.reject(error);
  }
);

export const billingApi = {
  // Lấy danh sách hóa đơn (dùng cho lễ tân + bác sĩ)
  getAll: async (page = 0, size = 20, search = '', status = '') => {
    const params = { page, size, search };
    if (status) params.status = status;
    const res = await api.get('', { params });
    return res.data;
  },

  // Lấy chi tiết 1 hóa đơn
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  // TẠO HÓA ĐƠN TỰ ĐỘNG khi bác sĩ hoàn thành khám (QUAN TRỌNG NHẤT)
  create: async (data) => {
    const res = await api.post('', data);
    return res.data;
  },

  // Thu tiền hóa đơn (lễ tân dùng)
  pay: async (billId, paidAmount, paymentMethod = 'Cash') => {
    const res = await api.put(`/${billId}/pay`, {
      paidAmount,
      paymentMethod,
    });
    return res.data;
  },

  // Xóa hóa đơn (nếu cần – admin dùng)
  delete: async (billId) => {
    const res = await api.delete(`/${billId}`);
    return res.data;
  },
};

export default billingApi;