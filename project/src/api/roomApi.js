// src/api/roomApi.js
import axiosInstance from '../utils/axiosConfig';

// ======================================
// CHỈ DÙNG 2 ĐƯỜNG DẪN CHÍNH
// ======================================
const ADMIN_ENDPOINT = '/api/receptionist/examination-rooms';   // Chỉ admin quản lý phòng
const RECEPTION_ENDPOINT = '/api/reception/rooms';             // Lễ tân + bác sĩ dùng hàng ngày

// Helper: xử lý ApiResponse<T> → trả về data
const unwrap = (res) => {
  if (!res?.data) return null;
  return res.data?.data ?? res.data;
};

// ======================================
// roomApi – ĐÃ ĐƯỢC DỌN SẠCH 100% - CHỈ TỰ ĐỘNG PHÂN PHÒNG
// ======================================
export const roomApi = {
  // ====================== ADMIN (Quản lý phòng khám) ======================
  /**
   * Lấy danh sách tất cả phòng khám (Admin)
   * GET /api/receptionist/examination-rooms
   */
  getAllRooms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ADMIN_ENDPOINT}?${query}` : ADMIN_ENDPOINT;
    const res = await axiosInstance.get(url);
    return unwrap(res) || [];
  },

  /**
   * Lấy chi tiết một phòng (Admin)
   * GET /api/receptionist/examination-rooms/{roomId}
   */
  getRoomById: async (roomId) => {
    const res = await axiosInstance.get(`${ADMIN_ENDPOINT}/${roomId}`);
    return unwrap(res);
  },

  /**
   * Tạo phòng mới (Admin)
   * POST /api/receptionist/examination-rooms
   */
  createRoom: async (data) => {
    const res = await axiosInstance.post(ADMIN_ENDPOINT, data);
    return unwrap(res);
  },

  /**
   * Cập nhật phòng (Admin)
   * PUT /api/receptionist/examination-rooms/{roomId}
   */
  updateRoom: async (roomId, data) => {
    const res = await axiosInstance.put(`${ADMIN_ENDPOINT}/${roomId}`, data);
    return unwrap(res);
  },

  /**
   * Xóa phòng (Admin)
   * DELETE /api/receptionist/examination-rooms/{roomId}
   */
  deleteRoom: async (roomId) => {
    await axiosInstance.delete(`${ADMIN_ENDPOINT}/${roomId}`);
    return true;
  },

  /**
   * Lấy danh sách tất cả bác sĩ (Admin)
   * GET /api/receptionist/examination-rooms/doctors
   */
  getAllDoctors: async () => {
    const res = await axiosInstance.get(`${ADMIN_ENDPOINT}/doctors`);
    return unwrap(res) || [];
  },

  /**
   * Lấy danh sách bác sĩ có thể gán (khi update phòng) (Admin)
   * GET /api/receptionist/examination-rooms/doctors/for-update
   */
  getDoctorsForUpdate: async (roomId) => {
    const url = roomId
      ? `${ADMIN_ENDPOINT}/doctors/for-update?roomId=${roomId}`
      : `${ADMIN_ENDPOINT}/doctors/for-update`;
    const res = await axiosInstance.get(url);
    return unwrap(res) || [];
  },

  // ====================== LỄ TÂN + BÁC SĨ (CHỈ XEM - KHÔNG PHÂN PHÒNG THỦ CÔNG) ======================

  /**
   * Lấy danh sách tất cả phòng đang hoạt động (Chỉ xem)
   * GET /api/reception/rooms
   */
  getActiveRooms: async () => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}`);
    return unwrap(res) || [];
  },

  /**
   * Lấy danh sách phòng trống (Chỉ xem)
   * GET /api/reception/rooms/available
   */
  getAvailableRooms: async () => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/available`);
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  /**
   * Lấy chi tiết 1 phòng (Chỉ xem)
   * GET /api/reception/rooms/{roomId}
   */
  getRoomDetail: async (roomId) => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/${roomId}`);
    return unwrap(res);
  },

  /**
   * Lấy bệnh nhân hiện tại trong phòng (Chỉ xem)
   * GET /api/reception/rooms/{roomId}/current-patient
   */
  getCurrentPatientInRoom: async (roomId) => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/${roomId}/current-patient`);
    return unwrap(res);
  },

  /**
   * Lấy lịch sử khám trong phòng (Chỉ xem)
   * GET /api/reception/rooms/{roomId}/history
   */
  getRoomHistory: async (roomId) => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/${roomId}/history`);
    return unwrap(res) || [];
  },

  /**
   * Thống kê tổng quát (Chỉ xem)
   * GET /api/reception/rooms/statistics
   */
  getStatistics: async () => {
    const res = await axiosInstance.get(`${RECEPTION_ENDPOINT}/statistics`);
    return unwrap(res);
  },

  // ====================== BÁC SĨ ACTIONS ======================

  /**
   * Gọi bệnh nhân tiếp theo (Bác sĩ)
   * POST /api/reception/rooms/{roomId}/call-next
   */
  callNextPatient: async (roomId) => {
    const res = await axiosInstance.post(`${RECEPTION_ENDPOINT}/${roomId}/call-next`);
    return unwrap(res);
  },

  /**
   * Hoàn tất khám (Bác sĩ)
   * POST /api/reception/rooms/{roomId}/complete
   */
  completeExamination: async (roomId) => {
    const res = await axiosInstance.post(`${RECEPTION_ENDPOINT}/${roomId}/complete`);
    return unwrap(res);
  },

  /**
   * Hủy bệnh nhân đang khám - đưa về hàng đợi (Bác sĩ)
   * POST /api/reception/rooms/{roomId}/cancel
   */
  cancelAssignment: async (roomId) => {
    const res = await axiosInstance.post(`${RECEPTION_ENDPOINT}/${roomId}/cancel`);
    return unwrap(res);
  },

  // ⚠️ LƯU Ý: KHÔNG CÒN HÀM assignRoom() - HỆ THỐNG TỰ ĐỘNG PHÂN PHÒNG
  // Backend tự động phân phòng khi thêm bệnh nhân mới qua queueApi.addPatient()
};

export default roomApi;