// src/api/clinicApi.js
import axiosInstance from '../utils/axiosConfig';

const API_BASE_URL = axiosInstance.defaults.baseURL || 'http://localhost:8082';
const ADMIN_ENDPOINT = '/api/admin/clinic';
const ADMIN_UPLOAD_ENDPOINT = `${ADMIN_ENDPOINT}/upload-logo`;
const PUBLIC_ENDPOINT = '/api/public/clinic'; // Endpoint public không cần auth

// Helper: unwrap response đúng chuẩn ApiResponse<T>
const unwrap = (response) => {
  if (!response?.data) return null;
  const body = response.data;

  // Ưu tiên: ApiResponse → { success, data, message }
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }

  return body;
};

export const clinicApi = {
  /**
   * Lấy thông tin phòng khám (Admin - cần auth)
   * @returns {Promise<ClinicResponse|null>}
   */
  getClinicInfo: async () => {
    try {
      const res = await axiosInstance.get(ADMIN_ENDPOINT);
      return unwrap(res);
    } catch (error) {
      // Nếu 404, trả về null (chưa có dữ liệu)
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching clinic info:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin phòng khám (Public - không cần auth)
   * @returns {Promise<ClinicResponse|null>}
   */
  getPublicClinicInfo: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${PUBLIC_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Chưa có dữ liệu
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Unwrap nếu có cấu trúc ApiResponse
      if (data && typeof data === 'object' && 'data' in data) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching public clinic info:', error);
      // Trả về null thay vì throw để không làm crash app
      return null;
    }
  },

  /**
   * Cập nhật thông tin phòng khám
   * @param {ClinicRequest} clinicData
   * @returns {Promise<ClinicResponse>}
   */
  updateClinicInfo: async (clinicData) => {
    try {
      const res = await axiosInstance.put(ADMIN_ENDPOINT, clinicData);
      return unwrap(res);
    } catch (error) {
      console.error('Error updating clinic info:', error);
      throw error;
    }
  },

  /**
   * Upload logo mới cho phòng khám
   * @param {File} file
   * @returns {Promise<{logoUrl?: string|null, clinicInfo?: object|null}>}
   */
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axiosInstance.post(ADMIN_UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const body = response?.data || {};
      return {
        logoUrl: body.logoUrl || body.url || body.data?.logoUrl || null,
        clinicInfo: body.clinicInfo || body.data?.clinicInfo || null,
      };
    } catch (error) {
      console.error('Error uploading clinic logo:', error);

      if (error.response?.status === 413) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        throw new Error(
          `File quá lớn (${fileSizeKB}KB). Vui lòng chọn ảnh nhỏ hơn để upload.`
        );
      }

      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'File không hợp lệ');
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Không thể upload logo. Vui lòng thử lại.'
      );
    }
  },
};

