import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = 'http://localhost:8082';

// Endpoint base cho examination rooms
const ENDPOINT_BASE = '/api/receptionist/examination-rooms';

/**
 * API functions for managing examination rooms
 */
export const roomApi = {
  /**
   * Lấy danh sách tất cả phòng khám
   * @param {Object} params - Query parameters: status, keyword, activeOnly
   * @returns {Promise<Array>} Danh sách phòng khám
   */
  getAllRooms: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.activeOnly) queryParams.append('activeOnly', params.activeOnly.toString());
      
      const url = queryParams.toString() 
        ? `${ENDPOINT_BASE}?${queryParams.toString()}`
        : ENDPOINT_BASE;
      
      const response = await axiosInstance.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin một phòng khám theo ID
   * @param {string|UUID} roomId - ID của phòng (UUID)
   * @returns {Promise<Object>} Thông tin phòng khám
   */
  getRoomById: async (roomId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINT_BASE}/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  /**
   * Tạo phòng khám mới
   * @param {Object} roomData - Dữ liệu phòng khám (ExaminationRoomRequest)
   * @returns {Promise<Object>} Phòng khám vừa tạo
   */
  createRoom: async (roomData) => {
    try {
      const response = await axiosInstance.post(ENDPOINT_BASE, roomData);
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin phòng khám
   * @param {string|UUID} roomId - ID của phòng (UUID)
   * @param {Object} roomData - Dữ liệu cập nhật (ExaminationRoomRequest)
   * @returns {Promise<Object>} Phòng khám đã cập nhật
   */
  updateRoom: async (roomId, roomData) => {
    try {
      const response = await axiosInstance.put(`${ENDPOINT_BASE}/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  /**
   * Xóa phòng khám
   * @param {string|UUID} roomId - ID của phòng (UUID)
   * @returns {Promise<void>}
   */
  deleteRoom: async (roomId) => {
    try {
      await axiosInstance.delete(`${ENDPOINT_BASE}/${roomId}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả bác sĩ để chọn khi tạo/cập nhật phòng
   * @returns {Promise<Array>} Danh sách bác sĩ (DoctorSimpleResponse)
   */
  getAllDoctors: async () => {
    try {
      const response = await axiosInstance.get(`${ENDPOINT_BASE}/doctors`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng theo bác sĩ
   * @param {string|UUID} doctorId - ID của bác sĩ (UUID)
   * @returns {Promise<Array>} Danh sách phòng khám
   */
  getRoomsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINT_BASE}/by-doctor/${doctorId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching rooms by doctor:', error);
      throw error;
    }
  },

  /**
   * Thống kê: Mỗi bác sĩ đang phụ trách bao nhiêu phòng
   * @returns {Promise<Object>} Map với key là tên bác sĩ, value là số phòng
   */
  getRoomCountByDoctor: async () => {
    try {
      const response = await axiosInstance.get(`${ENDPOINT_BASE}/statistics/room-count-by-doctor`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching room count by doctor:', error);
      throw error;
    }
  },
};

export default roomApi;
