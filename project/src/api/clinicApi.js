// src/api/clinicApi.js
import axiosInstance from '../utils/axiosConfig';
import { ENDPOINTS, VALIDATION, helpers } from '../types/clinic.types';

const API_BASE_URL = axiosInstance.defaults.baseURL || 'http://localhost:8082';
const ADMIN_ENDPOINT = ENDPOINTS.ADMIN;
const ADMIN_UPLOAD_ENDPOINT = ENDPOINTS.UPLOAD_LOGO;
const PUBLIC_ENDPOINT = ENDPOINTS.PUBLIC;

export const clinicApi = {
  /**
   * Lấy thông tin phòng khám (Admin - cần auth)
   * Theo API doc: GET /api/admin/clinic
   * Response: ClinicResponse (direct object)
   * @returns {Promise<ClinicResponse|null>}
   */
  getClinicInfo: async () => {
    try {
      const res = await axiosInstance.get(ADMIN_ENDPOINT);
      // API trả về direct ClinicResponse, không wrap
      return res.data;
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
   * Theo API doc: GET /api/public/clinic
   * Response: ClinicResponse (direct object, không wrap trong ApiResponse)
   * @returns {Promise<ClinicResponse|null>}
   */
  getPublicClinicInfo: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${PUBLIC_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Disable cache theo best practices
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Chưa có dữ liệu
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // API trả về direct ClinicResponse object, không wrap
      return data;
    } catch (error) {
      console.error('Error fetching public clinic info:', error);
      // Trả về null thay vì throw để không làm crash app
      return null;
    }
  },

  /**
   * Cập nhật thông tin phòng khám
   * Theo API doc: PUT /api/admin/clinic
   * Request: ClinicRequest (partial update supported)
   * Response: ClinicResponse (direct object)
   * @param {ClinicRequest} clinicData
   * @returns {Promise<ClinicResponse>}
   */
  updateClinicInfo: async (clinicData) => {
    try {
      const res = await axiosInstance.put(ADMIN_ENDPOINT, clinicData);
      // API trả về direct ClinicResponse
      return res.data;
    } catch (error) {
      console.error('Error updating clinic info:', error);
      throw error;
    }
  },

  /**
   * Upload logo mới cho phòng khám
   * Theo API doc: POST /api/admin/clinic/upload-logo
   * Request: FormData with 'logo' field
   * Response: { success, message, logoUrl, clinicInfo }
   * Constraints: Max 10MB, image/*, auto resize if > 2MB or > 800x800px
   * @param {File} file
   * @returns {Promise<{success: boolean, message: string, logoUrl: string, clinicInfo: ClinicResponse}>}
   */
  uploadLogo: async (file) => {
    // Validate file using helper
    const validation = helpers.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axiosInstance.post(ADMIN_UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // API trả về: { success, message, logoUrl, clinicInfo }
      const data = response.data;
      return {
        success: data.success,
        message: data.message,
        logoUrl: data.logoUrl,
        clinicInfo: data.clinicInfo,
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

