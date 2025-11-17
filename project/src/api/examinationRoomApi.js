const API_BASE_URL = 'http://localhost:8082';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const examinationRoomApi = {
  // Lấy tất cả phòng khám
  getAllRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/examination-rooms`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      throw error;
    }
  },

  // Lấy danh sách phòng trống
  getAvailableRooms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/examination-rooms/available`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },

  // Lấy thông tin phòng theo ID
  getRoomById: async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/examination-rooms/${roomId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching room by ID:', error);
      throw error;
    }
  }
};

// Helper functions
export const formatRoomStatus = (status) => {
  const statusMap = {
    'Available': 'Trống',
    'Occupied': 'Đang sử dụng',
    'Maintenance': 'Bảo trì'
  };
  return statusMap[status] || status;
};

