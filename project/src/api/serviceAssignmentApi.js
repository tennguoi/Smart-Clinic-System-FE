const API_BASE_URL = 'http://localhost:8082';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const serviceAssignmentApi = {
  // Tạo chỉ định dịch vụ mới
  createServiceAssignment: async (assignmentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating service assignment:', error);
      throw error;
    }
  },

  // Lấy danh sách chỉ định dịch vụ theo medical record
  getServiceAssignmentsByMedicalRecord: async (medicalRecordId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-assignments/medical-record/${medicalRecordId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service assignments by medical record:', error);
      throw error;
    }
  },

  // Lấy danh sách chỉ định dịch vụ theo bệnh nhân
  getServiceAssignmentsByPatient: async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-assignments/patient/${patientId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service assignments by patient:', error);
      throw error;
    }
  }
};

// Helper functions
export const formatServiceAssignmentStatus = (status) => {
  const statusMap = {
    'Pending': 'Chờ thực hiện',
    'InProgress': 'Đang thực hiện',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

