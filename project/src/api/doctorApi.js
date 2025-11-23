// src/api/doctorApi.js
import axiosInstance from '../utils/axiosConfig';

export const getDoctors = async () => {
  try {
    const { data } = await axiosInstance.get('/api/public/doctors');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const getMyQueue = async () => {
  try {
    const { data } = await axiosInstance.get('/api/doctor/queue/waiting');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching doctor queue:', error);
    throw error;
  }
};

export const getCurrentPatient = async () => {
  try {
    const { data } = await axiosInstance.get('/api/doctor/current-patient');
    return data;
  } catch (error) {
    console.error('Error fetching current patient:', error);
    throw error;
  }
};

export const callPatient = async (queueId) => {
  try {
    const { data } = await axiosInstance.patch(`/api/doctor/queue/${queueId}/call`);
    return data;
  } catch (error) {
    console.error('Error calling patient:', error);
    throw error;
  }
};

export const completeExamination = async () => {
  try {
    const { data } = await axiosInstance.post('/api/doctor/complete-examination');
    return data;
  } catch (error) {
    console.error('Error completing examination:', error);
    throw error;
  }
};
export const getCompletedQueues = async () => {
  try {
    const { data } = await axiosInstance.get('/api/doctor/queue/completed');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching completed queues:', error);
    throw error;
  }
};
export const getPatientMedicalHistory = async (patientId) => {
  try {
    const { data } = await axiosInstance.get(`/api/doctor/medical-records/patient/${patientId}`);
    return data; // data sẽ là List<MedicalRecordResponse>
  } catch (error) {
    console.error('Error fetching patient medical history:', error);
    throw error;
  }
};
export const getMedicalRecordDetail = async (recordId) => {
  try {
    const { data } = await axiosInstance.get(`/api/doctor/medical-records/${recordId}`);
    return data; // data sẽ là MedicalRecordDetailResponse
  } catch (error) {
    console.error('Error fetching medical record detail:', error);
    throw error;
  }
};

export const getDoctorStats = async (doctorId, range = 'day', date = null, forceRefresh = false) => {
  try {
    // BE expect lowercase range (day/week/month), parseRange() sẽ convert sang uppercase
    const params = { range: range.toLowerCase() };
    if (date) {
      // BE expect ISO date format (YYYY-MM-DD)
      const isoDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      params.date = isoDate;
    }
    // Thêm timestamp để bypass cache nếu cần (BE có thể không dùng, nhưng giúp force request mới)
    if (forceRefresh) {
      params._t = Date.now();
    }
    const { data } = await axiosInstance.get(`/api/doctors/${doctorId}/stats`, { params });
    return data;
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    throw error;
  }
};

export const getDoctorStatsDetail = async (doctorId, range = 'month', date = null, page = 1, pageSize = 10) => {
  try {
    const params = { range, page, pageSize };
    if (date) {
      const isoDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      params.date = isoDate;
    }
    const { data } = await axiosInstance.get(`/api/doctors/${doctorId}/stats/detail`, { params });
    return data;
  } catch (error) {
    console.error('Error fetching doctor stats detail:', error);
    throw error;
  }
};
// --- THÊM ĐOẠN NÀY VÀO CUỐI FILE (TRƯỚC DÒNG EXPORT DEFAULT) ---

export const searchMedicalRecords = async (params) => {
  try {
    // params bao gồm: { keyword, startDate, endDate }
    const { data } = await axiosInstance.get('/api/doctor/medical-records/search', { params });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching medical records:', error);
    throw error;
  }
};

// Hàm này thay thế cho listMine cũ (nếu bạn muốn dùng chung trong file này)
export const getMyMedicalRecords = async () => {
  try {
    const { data } = await axiosInstance.get('/api/doctor/medical-records/mine');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching my medical records:', error);
    throw error;
  }
};

export const createMedicalRecord = async (recordData) => {
  try {
    const { data } = await axiosInstance.post('/api/doctor/medical-records', recordData);
    return data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

export default {
  getDoctors,
  getMyQueue,
  getCurrentPatient,
  callPatient,
  completeExamination,
  getPatientMedicalHistory,
  getMedicalRecordDetail,
  getCompletedQueues,
  getDoctorStats,
  getDoctorStatsDetail,
  searchMedicalRecords,
  getMyMedicalRecords,
  createMedicalRecord,
};
