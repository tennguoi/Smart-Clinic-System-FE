// src/api/examinationApi.js
import axiosInstance from '../utils/axiosConfig';

export const addService = async (payload) => {
  const { data } = await axiosInstance.post('/api/doctor/services', payload);
  return data;
};

export const addPrescription = async (payload) => {
  const { data } = await axiosInstance.post('/api/doctor/prescription', payload);
  return data;
};

export const getExaminationSummary = async () => {
  const { data } = await axiosInstance.get('/api/doctor/examination-summary');
  return data;
};

export const getPatientMedicalHistory = async (patientId) => {
  const { data } = await axiosInstance.get(`/api/doctor/medical-records/patient/${patientId}`);
  return data;
};
export const createInvoice = async () => {
  const { data } = await axiosInstance.post('/api/doctor/create-invoice');
  return data;
};