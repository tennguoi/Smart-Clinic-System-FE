import axiosInstance from '../utils/axiosConfig';

// ======================================
// BASE URLS
// ======================================
const ADMIN_ENDPOINT = '/api/receptionist/examination-rooms';
const RECEPTION_ENDPOINT = '/api/reception/rooms';

// helper: unwrap response -> prefers response.data.data, fallback response.data
const unwrap = (response) => {
  if (!response) return null;
  // axios response: response.data usually holds server payload
  const body = response.data;
  if (body && typeof body === 'object') {
    // nếu backend trả { success, message, data: [...] }
    if (body.hasOwnProperty('data')) return body.data;
    // nếu backend trả trực tiếp array/object
    return body;
  }
  return body;
};

// ======================================
// roomApi
// ======================================
export const roomApi = {
  // ADMIN SIDE
  getAllRooms: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${ADMIN_ENDPOINT}?${queryParams}` : ADMIN_ENDPOINT;
      const response = await axiosInstance.get(url);
      return unwrap(response) || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  getRoomById: async (roomId) => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/${roomId}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await axiosInstance.post(ADMIN_ENDPOINT, roomData);
      return unwrap(response);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  updateRoom: async (roomId, roomData) => {
    try {
      const response = await axiosInstance.put(`${ADMIN_ENDPOINT}/${roomId}`, roomData);
      return unwrap(response);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const response = await axiosInstance.delete(`${ADMIN_ENDPOINT}/${roomId}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  getAllDoctors: async () => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/doctors`);
      return unwrap(response) || [];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  getDoctorsForUpdate: async (roomId) => {
    try {
      const url = roomId 
        ? `${ADMIN_ENDPOINT}/doctors/for-update?roomId=${roomId}`
        : `${ADMIN_ENDPOINT}/doctors/for-update`;
      const response = await axiosInstance.get(url);
      return unwrap(response) || [];
    } catch (error) {
      console.error('Error fetching doctors for update:', error);
      throw error;
    }
  },

  getRoomsByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/by-doctor/${doctorId}`);
      return unwrap(response) || [];
    } catch (error) {
      console.error('Error fetching rooms by doctor:', error);
      throw error;
    }
  },

  getRoomCountByDoctor: async () => {
    try {
      const response = await axiosInstance.get(`${ADMIN_ENDPOINT}/statistics/room-count-by-doctor`);
      return unwrap(response) || {};
    } catch (error) {
      console.error('Error fetching room-count-by-doctor:', error);
      throw error;
    }
  },

  // RECEPTION SIDE
  getAvailableRooms: async () => {
    try {
      const response = await axiosInstance.get(`${RECEPTION_ENDPOINT}/available`);
      const data = unwrap(response);
      // đảm bảo trả về array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },
assignRoom: async (queueId, roomId) => {
  try {
    const response = await axiosInstance.post(
      `${RECEPTION_ENDPOINT}/assign`,
      {
        queueId,
        roomId
      }
    );
    return unwrap(response);
  } catch (error) {
    console.error('Error assigning room:', error);
    throw error;
  }
}
};

export default roomApi;
