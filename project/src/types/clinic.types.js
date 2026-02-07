/**
 * Type definitions for Clinic API
 * Based on Backend Entity and DTOs
 */

/**
 * @typedef {Object} ClinicResponse
 * @property {string} clinicId - UUID string
 * @property {string} name - Tên phòng khám (required)
 * @property {string|null} address - Địa chỉ
 * @property {string|null} phone - Số điện thoại
 * @property {string|null} email - Email
 * @property {string|null} website - Website URL
 * @property {string|null} logoUrl - Logo URL (format: /uploads/logo/clinic_logo_{uuid}.{ext})
 * @property {string} createdAt - ISO 8601 datetime string
 * @property {string} updatedAt - ISO 8601 datetime string
 */

/**
 * @typedef {Object} ClinicRequest
 * @property {string} [name] - Tên phòng khám (required khi tạo mới)
 * @property {string} [address] - Địa chỉ
 * @property {string} [phone] - Số điện thoại
 * @property {string} [email] - Email (phải hợp lệ)
 * @property {string} [website] - Website URL
 * @property {string} [logoUrl] - Logo URL (internal use)
 */

/**
 * @typedef {Object} UploadLogoResponse
 * @property {boolean} success - Upload success status
 * @property {string} message - Response message
 * @property {string} logoUrl - URL của logo đã upload
 * @property {ClinicResponse} clinicInfo - Thông tin phòng khám sau khi update
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} message - Error message
 */

// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/,
  LOGO_URL_REGEX: /^\/uploads\/logo\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_WIDTH: 800,
  MAX_IMAGE_HEIGHT: 800,
  TARGET_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

// API endpoints
export const ENDPOINTS = {
  PUBLIC: '/api/public/clinic',
  ADMIN: '/api/admin/clinic',
  UPLOAD_LOGO: '/api/admin/clinic/upload-logo',
  DEBUG_UPDATE: '/api/admin/clinic/debug-update',
};

// Helper functions
export const helpers = {
  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    return VALIDATION.EMAIL_REGEX.test(email.trim());
  },

  /**
   * Validate logo URL format
   * @param {string} url
   * @returns {boolean}
   */
  isValidLogoUrl: (url) => {
    if (!url || typeof url !== 'string') return false;
    return VALIDATION.LOGO_URL_REGEX.test(url.trim());
  },

  /**
   * Validate image file
   * @param {File} file
   * @returns {{valid: boolean, error?: string}}
   */
  validateImageFile: (file) => {
    if (!file) {
      return { valid: false, error: 'File không được để trống' };
    }

    if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'File phải là hình ảnh (JPG, PNG, GIF, WebP)' };
    }

    if (file.size > VALIDATION.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return { valid: false, error: `File quá lớn (${sizeMB}MB). Vui lòng chọn file nhỏ hơn 10MB` };
    }

    return { valid: true };
  },

  /**
   * Convert relative logo URL to absolute URL
   * @param {string|null} logoUrl
   * @param {string} baseUrl
   * @returns {string}
   */
  toAbsoluteLogoUrl: (logoUrl, baseUrl = 'http://localhost:8082') => {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http')) return logoUrl;
    if (logoUrl.startsWith('/')) return `${baseUrl}${logoUrl}`;
    return logoUrl;
  },

  /**
   * Add cache busting parameter to URL
   * @param {string} url
   * @param {string|number} [timestamp]
   * @returns {string}
   */
  addCacheBuster: (url, timestamp) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    const ts = timestamp || Date.now();
    return `${url}${separator}v=${ts}`;
  },

  /**
   * Format file size to human readable string
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};

export default {
  VALIDATION,
  ENDPOINTS,
  helpers,
};

