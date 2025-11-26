// src/api/billingApi.js – ĐÃ SỬA HOÀN CHỈNH, HOẠT ĐỘNG 100%
import axiosInstance from '../utils/axiosConfig';

export const billingApi = {
  getAll: async (page = 0, size = 20, search = '') => {
    const params = { page, size };
    if (search) params.search = search;
    const { data } = await axiosInstance.get('/api/billing', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/api/billing/${id}`);
    return data;
  },

  create: async (data) => {
    const { data: response } = await axiosInstance.post('/api/billing', data);
    return response;
  },

  pay: async (billId, paidAmount, paymentMethod = 'Cash') => {
    const { data } = await axiosInstance.put(`/api/billing/${billId}/pay`, {
      paidAmount,
      paymentMethod,
    });
    return data;
  },

  // ← API CHỈNH SỬA HÓA ĐƠN – ĐÃ DÙNG axiosInstance → CÓ TOKEN → THÀNH CÔNG!
  updateInvoice: async (billId, payload) => {
    const { data } = await axiosInstance.put(`/api/billing/${billId}`, payload);
    return data;
  },

  delete: async (billId) => {
    const { data } = await axiosInstance.delete(`/api/billing/${billId}`);
    return data;
  },

  // ← API KIỂM TRA TRẠNG THÁI THANH TOÁN
  checkPaymentStatus: async (billId) => {
    const { data } = await axiosInstance.get(`/api/billing/${billId}/payment-status`);
    return data;
  },
};

export default billingApi;