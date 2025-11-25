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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Billing API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const billingApi = {
  getAll: async (page = 0, size = 20, search = '') => {
    const params = { page, size };
    if (search) params.search = search;
    const res = await api.get('', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('', data);
    return res.data;
  },

  pay: async (billId, paidAmount, paymentMethod = 'Cash') => {
    const res = await api.put(`/${billId}/pay`, {
      paidAmount,
      paymentMethod,
    });
    return res.data;
  },

  delete: async (billId) => {
    const res = await api.delete(`/${billId}`);
    return res.data;
  },
  updateInvoice: async (billId, payload) => {
  const { data } = await axiosInstance.put(`/api/billing/${billId}`, payload);
  return data;
 },
};


export default billingApi;