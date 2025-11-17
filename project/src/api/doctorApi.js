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

export const completeExamination = async (queueId) => {
  try {
    const { data } = await axiosInstance.patch(`/api/doctor/queue/${queueId}/complete`);
    return data;
  } catch (error) {
    console.error('Error completing examination:', error);
    throw error;
  }
};

export default {
  getDoctors,
  getMyQueue,
  getCurrentPatient,
  callPatient,
  completeExamination,
};
