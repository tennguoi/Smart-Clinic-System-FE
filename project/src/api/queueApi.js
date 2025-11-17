const API_BASE_URL = 'http://localhost:8082';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const queueApi = {
  // Check-in bệnh nhân vào hàng đợi
  checkIn: async (queueData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/check-in`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(queueData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw error;
    }
  },

  // Phân phòng cho bệnh nhân
  assignRoom: async (queueId, roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/assign-room`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ queueId, roomId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning room:', error);
      throw error;
    }
  },

  // Hoàn thành khám bệnh
  completeExamination: async (queueId, medicalRecordId) => {
    try {
      const params = new URLSearchParams();
      if (medicalRecordId) {
        params.append('medicalRecordId', medicalRecordId);
      }

      const response = await fetch(`${API_BASE_URL}/api/queues/${queueId}/complete?${params}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing examination:', error);
      throw error;
    }
  },

  // Lấy danh sách bệnh nhân đang chờ
  getWaitingQueues: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/waiting`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching waiting queues:', error);
      throw error;
    }
  },

  // Lấy danh sách bệnh nhân đang khám
  getInProgressQueues: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/in-progress`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching in-progress queues:', error);
      throw error;
    }
  },

  // Lấy thông tin queue theo ID
  getQueueById: async (queueId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/queues/${queueId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching queue by ID:', error);
      throw error;
    }
  }
};

// Helper functions
export const formatQueueStatus = (status) => {
  const statusMap = {
    'Waiting': 'Đang chờ',
    'InProgress': 'Đang khám',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

export const formatPriority = (priority) => {
  const priorityMap = {
    'Emergency': 'Cấp cứu',
    'Urgent': 'Khẩn cấp',
    'Normal': 'Bình thường'
  };
  return priorityMap[priority] || priority;
};

