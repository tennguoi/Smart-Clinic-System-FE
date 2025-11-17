// src/api/medicalRecordApi.js
import axiosInstance from '../utils/axiosConfig';

export const medicalRecordApi = {
	create: async ({ patientId, patientName, diagnosis, treatmentNotes }) => {
		const payload = {
			patientId: patientId || null,
			patientName: patientName || null, // Gửi patientName lên backend
			diagnosis,
			treatmentNotes: treatmentNotes || '',
		};
		const { data } = await axiosInstance.post('/api/doctor/medical-records', payload);
		return data;
	},

	listMine: async () => {
		const { data } = await axiosInstance.get('/api/doctor/medical-records/mine');
		return Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
	},

	listByPatient: async (patientId) => {
		const { data } = await axiosInstance.get(`/api/doctor/medical-records/patient/${patientId}`);
		return Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
	},

	update: async (recordId, { diagnosis, treatmentNotes }) => {
		const payload = {
			diagnosis,
			treatmentNotes: treatmentNotes || '',
		};
		// Giả định backend có endpoint PUT /api/doctor/medical-records/{recordId}
		const { data } = await axiosInstance.put(`/api/doctor/medical-records/${recordId}`, payload);
		return data;
	},

	remove: async (recordId) => {
		// Giả định backend có endpoint DELETE /api/doctor/medical-records/{recordId}
		const { data } = await axiosInstance.delete(`/api/doctor/medical-records/${recordId}`);
		return data;
	},
};

export default medicalRecordApi;


