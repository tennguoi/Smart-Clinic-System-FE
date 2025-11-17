import axiosInstance from '../utils/axiosConfig';

// ======================================
// BASE URLS
// ======================================
const ADMIN_ENDPOINT = '/api/receptionist/examination-rooms';   // Quản lý phòng (tạo, sửa...)
const RECEPTION_ENDPOINT = '/api/reception/rooms';             // Lễ tân gọi danh sách phòng, phân phòng

// ======================================
// roomApi
// ======================================
export const roomApi = {

  // ---------------------------
  // ADMIN SIDE
  // ---------------------------

  // Lấy tất cả phòng khám (lọc theo status / keyword / activeOnly)
  getAllRooms: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${ADMIN_ENDPOINT}?${queryParams}` : ADMIN_ENDPOINT;

      const response = await axiosInstance.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Lấy phòng theo ID
  getRoomById: async (roomId) => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Tạo phòng khám
  createRoom: async (roomData) => {
    try {
      const response = await axiosInstance.post(ADMIN_ENDPOINT, roomData);
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Cập nhật phòng khám
  updateRoom: async (roomId, roomData) => {
    try {
      const response = await axiosInstance.put(`${ADMIN_ENDPOINT}/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  // Xóa phòng khám
  deleteRoom: async (roomId) => {
    try {
      await axiosInstance.delete(`${ADMIN_ENDPOINT}/${roomId}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Lấy tất cả bác sĩ để chọn khi gán vào phòng
  getAllDoctors: async () => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/doctors`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Lấy các phòng của một bác sĩ
  getRoomsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/by-doctor/${doctorId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching rooms by doctor:', error);
      throw error;
    }
  },

  // Thống kê bác sĩ phụ trách bao nhiêu phòng
  getRoomCountByDoctor: async () => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/statistics/room-count-by-doctor`);
      return response.data || {};
    } catch (error) {
      console.error('Error fetching room-count-by-doctor:', error);
      throw error;
    }
  },

  // ---------------------------
  // RECEPTION SIDE (Lễ tân)
  // ---------------------------

  // Lấy phòng khám đang "sẵn sàng"
  getAvailableRooms: async () => {
    try {
      const response = await axiosInstance.get(`${RECEPTION_ENDPOINT}/available`);
      // Đảm bảo trả về array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },

  // Lễ tân phân phòng khám cho bệnh nhân
  assignRoom: async (queueId, roomId) => {
    try {
      const response = await axiosInstance.post(
        `${RECEPTION_ENDPOINT}/assign`,
        null,
        { params: { queueId, roomId } }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning room:', error);
      throw error;
    }
  }
};

// ================= QUEUE API =================

export const queueApi = {
  // Lấy danh sách bệnh nhân đang chờ
  getWaitingQueue: async () => {
    const { data } = await axiosInstance.get('/api/reception/queue/waiting');
    return data;
  },

  // Tìm kiếm bệnh nhân
  searchQueue: async (params) => {
    const { data } = await axiosInstance.get('/api/reception/queue/search', { params });
    return data;
  },

  // Lấy chi tiết bệnh nhân
  getQueueDetail: async (queueId) => {
    const { data } = await axiosInstance.get(`/api/reception/queue/${queueId}`);
    return data;
  },

  // Thêm bệnh nhân mới
  addPatient: async (patientData) => {
    const { data } = await axiosInstance.post('/api/reception/queue/add', patientData);
    return data;
  },

  // Cập nhật thông tin bệnh nhân
  updatePatient: async (queueId, patientData) => {
    const { data } = await axiosInstance.put(`/api/reception/queue/${queueId}`, patientData);
    return data;
  },

  // Xóa bệnh nhân
  deletePatient: async (queueId) => {
    await axiosInstance.delete(`/api/reception/queue/${queueId}`);
  },

  // Cập nhật trạng thái nhanh
  updateStatus: async (queueId, status) => {
    const { data } = await axiosInstance.patch(`/api/reception/queue/${queueId}/status`, null, { 
      params: { status } 
    });
    return data;
  }
};

// ================= USER PROFILE API =================
export const userApi = {
  // Lấy thông tin profile
  getProfile: async () => {
    const { data } = await axiosInstance.get('/api/auth/user');
    return data;
  },

  // Đăng xuất
  logout: async () => {
    await axiosInstance.post('/api/auth/logout');
  }
  
};