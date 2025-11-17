import axiosInstance from '../utils/axiosConfig';

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
    await axiosInstance.patch(`/api/reception/queue/${queueId}/status`, null, { 
      params: { status } 
    });
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