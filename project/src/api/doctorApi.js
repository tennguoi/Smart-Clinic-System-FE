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


export default {
  getDoctors,
  getMyQueue,
  getCurrentPatient,
  callPatient,
  completeExamination,
  getPatientMedicalHistory,
  getMedicalRecordDetail,
  getCompletedQueues,
};
