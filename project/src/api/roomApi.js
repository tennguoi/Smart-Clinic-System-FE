// src/api/roomApi.js
import axiosInstance from '../utils/axiosConfig';

// ======================================
// BASE URLS
// ======================================
const ADMIN_ENDPOINT = '/api/receptionist/examination-rooms';
const RECEPTION_ENDPOINT = '/api/reception/rooms';

// Helper: unwrap response đúng chuẩn ApiResponse<T>
const unwrap = (response) => {
  if (!response?.data) return null;
  const body = response.data;

  // Ưu tiên: ApiResponse → { success, data, message }
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }
  // Fallback: trả thẳng array/object (admin side)
  return body;
};

// ======================================
// roomApi – ĐÃ HOÀN CHỈNH 100%
// ======================================
export const roomApi = {
  // ====================== ADMIN SIDE ======================
  getAllRooms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ADMIN_ENDPOINT}?${query}` : ADMIN_ENDPOINT;
    const res = await axiosInstance.get(url);
    return unwrap(res) || [];
  },

  getRoomById: async (roomId) => {
    const res = await axiosInstance.get(`${ADMIN_ENDPOINT}/${roomId}`);
    return unwrap(res);
  },

  createRoom: async (roomData) => {
    const res = await axiosInstance.post(ADMIN_ENDPOINT, roomData);
    return unwrap(res);
  },

  updateRoom: async (roomId, roomData) => {
    const res = await axiosInstance.put(`${ADMIN_ENDPOINT}/${roomId}`, roomData);
    return unwrap(res);
  },

  deleteRoom: async (roomId) => {
    await axiosInstance.delete(`${ADMIN_ENDPOINT}/${roomId}`);
    return true;
  },

  getAllDoctors: async () => {
    const res = await axiosInstance.get(`${ADMIN_ENDPOINT}/doctors`);
    return unwrap(res) || [];
  },

  getDoctorsForUpdate: async (roomId) => {
    const url = roomId
      ? `${ADMIN_ENDPOINT}/doctors/for-update?roomId=${roomId}`
      : `${ADMIN_ENDPOINT}/doctors/for-update`;
    const res = await axiosInstance.get(url);
    return unwrap(res) || [];
  },

  // ====================== RECEPTION SIDE ======================
  getAvailableRooms: async () => {
    try {
      const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/available`);
      const data = unwrap(res); // ApiResponse → data là mảng RoomResponse
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Lỗi tải danh sách phòng khám:', error);
      throw error;
    }
  },

  // PHÂN PHÒNG – ĐÚNG 100% VỚI BACKEND
  assignRoom: async (queueId, roomId) => {
    try {
      const res = await axiosInstance.post(`${RECEPTION_ENDPOINT}/assign`, {
        queueId,
        roomId,
      });
      return unwrap(res); // ApiResponse<RoomResponse> → trả về RoomResponse
    } catch (error) {
      console.error('Lỗi phân phòng:', error);
      throw error;
    }
  },
};

export default roomApi;