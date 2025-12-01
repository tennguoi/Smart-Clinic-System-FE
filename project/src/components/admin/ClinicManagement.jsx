import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Building2, Loader2, Upload, X, Edit } from 'lucide-react';
import { clinicApi } from '../../api/clinicApi';
import { useClinic } from '../../contexts/ClinicContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const toAbsoluteLogoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

// Helper: Convert absolute URL back to relative URL for backend
const toRelativeLogoUrl = (url) => {
  if (!url) return null;
  // If already relative, return as is
  if (url.startsWith('/uploads/logo/')) return url;
  // If absolute, extract relative part
  if (url.includes('/uploads/logo/')) {
    const match = url.match(/\/uploads\/logo\/.+$/);
    return match ? match[0] : null;
  }
  return null;
};

export default function ClinicManagement() {
  const { t } = useTranslation();
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { refreshClinicInfo } = useClinic();

  useEffect(() => {
    fetchClinicInfo();
  }, []);

  const fetchClinicInfo = async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
    }
    setError('');
    try {
      console.log('🔄 Fetching clinic info...');
      const data = await clinicApi.getClinicInfo();
      console.log('✅ Fetched clinic data:', data);
      
      if (data) {
        setClinicInfo(data);
        const normalizedLogoUrl = toAbsoluteLogoUrl(data.logoUrl || '');
        
        const newFormData = {
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          logoUrl: normalizedLogoUrl,
        };
        
        console.log('📝 Setting form data:', newFormData);
        setFormData(newFormData);
        
        if (normalizedLogoUrl) {
          setLogoPreview(normalizedLogoUrl);
        }
        setIsEditing(false); // Reset to view mode when loading data
      } else {
        // Chưa có dữ liệu, form sẽ trống - allow editing immediately
        console.log('⚠️ No clinic data found');
        setClinicInfo(null);
        setIsEditing(true);
      }
    } catch (err) {
      // Không redirect nếu lỗi 401 - để ProtectedRoute xử lý
      if (err.response?.status === 401) {
        // Token hết hạn, ProtectedRoute sẽ tự động redirect
        // Không cần set error ở đây
        return;
      }
      console.error('❌ Error fetching clinic info:', err);
      setError(err.response?.data?.message || err.message || t('admin.errors.loadFailed'));
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('admin.errors.invalidImage'));
      return;
    }

    // Validate file size (max 10MB - Backend sẽ tự động resize nếu cần)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(t('admin.errors.fileTooLarge').replace('10MB', `${fileSizeMB}MB`));
      return;
    }

    setError('');
    setLogoFile(file);
    
    // Log file info
    const fileSizeKB = (file.size / 1024).toFixed(2);
    console.log(`📁 File logo đã chọn: ${file.name}, kích thước: ${fileSizeKB}KB`);
    console.log(`ℹ️ Backend sẽ tự động resize nếu file > 2MB hoặc > 800x800px`);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    // Chỉ xóa file mới chọn, giữ nguyên logo hiện tại nếu có
    setLogoFile(null);
    // Nếu có logo hiện tại, giữ lại preview
    if (formData.logoUrl) {
      setLogoPreview(formData.logoUrl);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError(t('admin.errors.nameRequired'));
        setSaving(false);
        return;
      }

      // Validate email format if provided (match backend regex)
      const EMAIL_REGEX = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
      if (formData.email && !EMAIL_REGEX.test(formData.email)) {
        setError(t('admin.errors.invalidEmail'));
        setSaving(false);
        return;
      }

      // Normalize website URL - add http:// if missing
      let normalizedWebsite = formData.website;
      if (normalizedWebsite && normalizedWebsite.trim()) {
        normalizedWebsite = normalizedWebsite.trim();
        // If it doesn't start with http:// or https://, add http://
        if (!normalizedWebsite.match(/^https?:\/\//i)) {
          normalizedWebsite = 'http://' + normalizedWebsite;
        }
      }

      // Upload logo if new file is selected
      let finalLogoUrl = formData.logoUrl;
      let updatedClinicData = null;
      
      if (logoFile) {
        setUploadingLogo(true);
        try {
          const uploadResult = await clinicApi.uploadLogo(logoFile);
          finalLogoUrl = uploadResult.logoUrl;
          
          // Backend returns updated clinicInfo after upload
          if (uploadResult.clinicInfo) {
            updatedClinicData = uploadResult.clinicInfo;
          }
        } catch (uploadError) {
          setError(uploadError.message || t('admin.errors.uploadFailed'));
          setSaving(false);
          return;
        } finally {
          setUploadingLogo(false);
        }
      }

      // If logo was uploaded, backend already updated the clinic info
      // Otherwise, update other fields
      if (!updatedClinicData) {
        // Convert logoUrl to relative format for backend
        const relativeLogoUrl = toRelativeLogoUrl(finalLogoUrl);
        
        const dataToSubmit = {
          ...formData,
          logoUrl: relativeLogoUrl,
          website: normalizedWebsite || formData.website,
        };
        
        console.log('📤 Submitting data to backend:', dataToSubmit);
        updatedClinicData = await clinicApi.updateClinicInfo(dataToSubmit);
      }
      
      console.log('💾 Update successful, data from backend:', updatedClinicData);
      
      // Cập nhật state ngay lập tức với dữ liệu từ backend
      setClinicInfo(updatedClinicData);
      
      const normalizedLogoUrl = toAbsoluteLogoUrl(updatedClinicData?.logoUrl || '');
      const newFormData = {
        name: updatedClinicData.name || '',
        address: updatedClinicData.address || '',
        phone: updatedClinicData.phone || '',
        email: updatedClinicData.email || '',
        website: updatedClinicData.website || '',
        logoUrl: normalizedLogoUrl,
      };
      
      console.log('📝 Updating form with new data:', newFormData);
      setFormData(newFormData);
      setLogoFile(null);
      setLogoPreview(normalizedLogoUrl || null);
      setIsEditing(false);
      
      // Set saving = false TRƯỚC KHI refresh context
      setSaving(false);
      setUploadingLogo(false);
      
      console.log('🔄 Refreshing global clinic context...');
      // Force refresh để update tất cả components (navbar, footer, etc.)
      if (typeof refreshClinicInfo === 'function') {
        await refreshClinicInfo();
      }
      
      console.log('✅ All updates completed!');
      setSuccess(t('admin.success.updated'));
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('❌ Error during update:', err);
      setError(err.response?.data?.message || err.message || t('admin.errors.updateFailed'));
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Hiển thị loading khi đang lưu để tránh hiển thị dữ liệu cũ
  if (saving) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">{t('admin.common.processing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">{t('admin.clinic.pageTitle')}</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        {!clinicInfo && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">{t('admin.clinic.noData.title')}</p>
            <p className="text-sm mt-1">{t('admin.clinic.noData.desc')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên phòng khám */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder={t('admin.clinic.placeholder.name')}
              required
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.address')}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder={t('admin.clinic.placeholder.address')}
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="0123456789"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="clinic@example.com"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.website')}
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="www.example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('admin.clinic.websiteHint')}
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.clinic.form.logo')}
            </label>
            
            {/* File Input */}
            <div className="flex items-center gap-3 mb-3">
              <label className={`flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg transition-colors ${
                isEditing ? 'cursor-pointer hover:bg-blue-100' : 'cursor-not-allowed opacity-50'
              }`}>
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {logoFile ? t('admin.clinic.changeLogo') : t('admin.clinic.chooseLogo')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  disabled={!isEditing}
                  className="hidden"
                />
              </label>
              
              {logoPreview && isEditing && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('admin.common.delete')}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Preview */}
            {logoPreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">{t('admin.common.preview')}:</p>
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-xs h-32 object-contain border border-gray-200 rounded-lg p-2 bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {logoFile && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                </div>
                {logoFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    File: {logoFile.name} ({(logoFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            )}

            {/* Current logo info */}
            {!logoPreview && formData.logoUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Current logo:</p>
                <img
                  src={formData.logoUrl}
                  alt="Current logo"
                  className="max-w-xs h-32 object-contain border border-gray-200 rounded-lg p-2 bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {!logoPreview && !formData.logoUrl && (
              <p className="text-sm text-gray-500 mt-2">
                {t('admin.clinic.noLogo')}
              </p>
            )}
          </div>

          {/* Thông tin bổ sung (nếu có) */}
          {clinicInfo && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{t('admin.clinic.createdAt')}:</span>{' '}
                  {clinicInfo.createdAt
                    ? new Date(clinicInfo.createdAt).toLocaleString('vi-VN')
                    : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">{t('admin.clinic.updatedAt')}:</span>{' '}
                  {clinicInfo.updatedAt
                    ? new Date(clinicInfo.updatedAt).toLocaleString('vi-VN')
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5" />
                {t('admin.common.edit')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setLogoFile(null);
                    // Reset form data to original clinic info
                    if (clinicInfo) {
                      const normalizedLogoUrl = toAbsoluteLogoUrl(clinicInfo.logoUrl || '');
                      setFormData({
                        name: clinicInfo.name || '',
                        address: clinicInfo.address || '',
                        phone: clinicInfo.phone || '',
                        email: clinicInfo.email || '',
                        website: clinicInfo.website || '',
                        logoUrl: normalizedLogoUrl,
                      });
                      setLogoPreview(normalizedLogoUrl || null);
                    }
                    setError('');
                  }}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  {t('admin.common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving || uploadingLogo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('admin.common.processing')}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('admin.common.save')}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}