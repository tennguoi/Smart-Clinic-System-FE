const API_BASE_URL = 'http://localhost:8082';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const prescriptionApi = {
  // Tạo toa thuốc mới
  createPrescription: async (prescriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  // Lấy toa thuốc theo ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/${prescriptionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription by ID:', error);
      throw error;
    }
  },

  // Lấy toa thuốc theo mã
  getPrescriptionByCode: async (prescriptionCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/code/${prescriptionCode}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription by code:', error);
      throw error;
    }
  },

  // Lấy danh sách toa thuốc theo bệnh nhân
  getPrescriptionsByPatient: async (patientId, page, size) => {
    try {
      let url = `${API_BASE_URL}/api/prescriptions/patient/${patientId}`;
      if (page !== undefined && size !== undefined) {
        url += `?page=${page}&size=${size}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescriptions by patient:', error);
      throw error;
    }
  },

  // Lấy danh sách toa thuốc của bác sĩ
  getMyPrescriptions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prescriptions/my-prescriptions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my prescriptions:', error);
      throw error;
    }
  }
};

