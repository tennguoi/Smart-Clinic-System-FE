import { API_BASE_URL } from './index';

// Get auth headers for JSON requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Get auth headers for binary requests (like PDF download)
const getAuthHeadersForBinary = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const medicalRecordApi = {
  // Get all medical records (for doctors)
  getAllMedicalRecords: async (page = 0, size = 10, sortBy = 'examinationDate', sortDir = 'desc') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  // Get medical records for current doctor
  getMyMedicalRecords: async (page = 0, size = 10, sortBy = 'examinationDate', sortDir = 'desc') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/my-records?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my medical records:', error);
      throw error;
    }
  },

  // Get medical records by patient
  getPatientMedicalRecords: async (patientId, page = 0, size = 10, sortBy = 'examinationDate', sortDir = 'desc') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/patient/${patientId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      throw error;
    }
  },

  // Get patient history (all records)
  getPatientHistory: async (patientId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/patient/${patientId}/history`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  },

  // Get medical record by ID
  getMedicalRecordById: async (recordId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/${recordId}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  },

  // Create new medical record
  createMedicalRecord: async (medicalRecordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-records`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicalRecordData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  // Update medical record
  updateMedicalRecord: async (recordId, medicalRecordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-records/${recordId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicalRecordData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },

  // Delete medical record
  deleteMedicalRecord: async (recordId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medical-records/${recordId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  },

  // Export medical record to PDF
  exportMedicalRecordToPDF: async (recordId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/${recordId}/export/pdf`,
        {
          method: 'GET',
          headers: getAuthHeadersForBinary(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical_record_${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting medical record to PDF:', error);
      throw error;
    }
  },

  // Export patient history to PDF
  exportPatientHistoryToPDF: async (patientId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/patient/${patientId}/export/pdf`,
        {
          method: 'GET',
          headers: getAuthHeadersForBinary(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient_history_${patientId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting patient history to PDF:', error);
      throw error;
    }
  }
};
