// Export all API modules for easy importing
export * from './queueApi';
export * from './examinationRoomApi';
export * from './paymentApi';
export * from './serviceAssignmentApi';
export * from './patientApi';
export * from './doctorApi';
export * from './serviceApi';
// Base URL for all API calls
export const API_BASE_URL = 'http://localhost:8082';

export * from './prescriptionApi';

// Re-export as named exports for convenience
export { queueApi } from './queueApi';
export { examinationRoomApi } from './examinationRoomApi';
export { paymentApi } from './paymentApi';
export { serviceAssignmentApi } from './serviceAssignmentApi';
export { patientApi } from './patientApi';
export { prescriptionApi } from './prescriptionApi';

