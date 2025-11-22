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

	update: async (recordId, { patientId, patientName, diagnosis, treatmentNotes, prescription }) => {
		const payload = {
			patientId: patientId || null,
			patientName: patientName || null,
			diagnosis: diagnosis || null,
			treatmentNotes: treatmentNotes || null,
			prescription: prescription ? {
				drugs: prescription.drugs || '',
				instructions: prescription.instructions || ''
			} : null
		};
		// Backend endpoint: PUT /api/doctor/medical-records/{recordId}
		const { data } = await axiosInstance.put(`/api/doctor/medical-records/${recordId}`, payload);
		return data;
	},

	remove: async (recordId) => {
		// Giả định backend có endpoint DELETE /api/doctor/medical-records/{recordId}
		const { data } = await axiosInstance.delete(`/api/doctor/medical-records/${recordId}`);
		return data;
	},
	addPrescription: async ({ recordId, drugs, instructions }) => {
        const payload = { recordId, drugs, instructions };
        
        // Gọi API endpoint MỚI của bạn
        const { data } = await axiosInstance.post(
            '/api/doctor/medical-records/prescription', 
            payload
        );
        return data; // Trả về 201 Created
    },


	getRecordDetail: async (recordId) => {
		const { data } = await axiosInstance.get(`/api/doctor/medical-records/${recordId}`);
		return data;
	},

	// Lưu ý: Backend trả về prescription (singular) trong getRecordDetail
	// Nếu cần endpoint riêng để lấy danh sách đơn thuốc, thêm sau
	getPrescriptions: async (recordId) => {
		try {
			const { data } = await axiosInstance.get(`/api/doctor/medical-records/${recordId}/prescriptions`);
			return Array.isArray(data) ? data : [];
		} catch (error) {
			// Nếu endpoint chưa có, trả về empty array
			return [];
		}
	},
	exportAsPdf: async (recordId) => {
		try {
			const { data } = await axiosInstance.get(
				`/api/doctor/medical-records/${recordId}/export-pdf`,
				{ responseType: 'blob' }
			);
			return data;
		} catch (error) {
			throw new Error('Xuất PDF thất bại: ' + (error.response?.data?.message || error.message));
		}
	},

	exportPrescriptionAsPdf: async (recordId) => {
		try {
			const { data } = await axiosInstance.get(
				`/api/doctor/medical-records/${recordId}/export-prescription`,
				{ responseType: 'blob' }
			);
			return data;
		} catch (error) {
			throw new Error('Xuất đơn thuốc thất bại: ' + (error.response?.data?.message || error.message));
		}
	}
	
};

export default medicalRecordApi;


																								
