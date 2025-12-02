import { useState, useEffect } from 'react';
import { Save, Building2, Loader2, Upload, X, Edit } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import { clinicApi } from '../../api/clinicApi';
import { useClinic } from '../../contexts/ClinicContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const toAbsoluteLogoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

const toRelativeLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/logo/')) return url;
  if (url.includes('/uploads/logo/')) {
    const match = url.match(/\/uploads\/logo\/.+$/);
    return match ? match[0] : null;
  }
  return null;
};

export default function ClinicManagement() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [clinicInfo, setClinicInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    morningStartTime: '',
    morningEndTime: '',
    afternoonStartTime: '',
    afternoonEndTime: '',
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
          morningStartTime: data.morningStartTime || '',
          morningEndTime: data.morningEndTime || '',
          afternoonStartTime: data.afternoonStartTime || '',
          afternoonEndTime: data.afternoonEndTime || '',
        };
        
        console.log('📝 Setting form data:', newFormData);
        setFormData(newFormData);
        
        if (normalizedLogoUrl) {
          setLogoPreview(normalizedLogoUrl);
        }
        setIsEditing(false);
      } else {
        console.log('⚠️ No clinic data found');
        setClinicInfo(null);
        setIsEditing(true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      console.error('❌ Error fetching clinic info:', err);
      toast.error(err.response?.data?.message || err.message || t('clinic.errors.loadFailed'));
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

    if (!file.type.startsWith('image/')) {
      toast.error(t('clinic.errors.invalidImage'));
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(t('clinic.errors.imageTooLarge', { size: fileSizeMB }));
      return;
    }

    setLogoFile(file);
    
    const fileSizeKB = (file.size / 1024).toFixed(2);
    console.log(`📁 File logo đã chọn: ${file.name}, kích thước: ${fileSizeKB}KB`);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    if (formData.logoUrl) {
      setLogoPreview(formData.logoUrl);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        toast.error(t('clinic.errors.nameRequired'));
        setSaving(false);
        return;
      }

      const EMAIL_REGEX = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
      if (formData.email && !EMAIL_REGEX.test(formData.email)) {
        toast.error(t('clinic.errors.invalidEmail'));
        setSaving(false);
        return;
      }

      let normalizedWebsite = formData.website;
      if (normalizedWebsite && normalizedWebsite.trim()) {
        normalizedWebsite = normalizedWebsite.trim();
        if (!normalizedWebsite.match(/^https?:\/\//i)) {
          normalizedWebsite = 'http://' + normalizedWebsite;
        }
      }

      if (formData.morningStartTime && formData.morningEndTime) {
        if (formData.morningStartTime >= formData.morningEndTime) {
          toast.error(t('clinic.errors.morningTimeInvalid'));
          setSaving(false);
          return;
        }
      }

      if (formData.afternoonStartTime && formData.afternoonEndTime) {
        if (formData.afternoonStartTime >= formData.afternoonEndTime) {
          toast.error(t('clinic.errors.afternoonTimeInvalid'));
          setSaving(false);
          return;
        }
      }

      if (formData.morningEndTime && formData.afternoonStartTime) {
        if (formData.morningEndTime >= formData.afternoonStartTime) {
          toast.error(t('clinic.errors.timeRangeInvalid'));
          setSaving(false);
          return;
        }
      }

      let finalLogoUrl = formData.logoUrl;
      let updatedClinicData = null;
      
      if (logoFile) {
        setUploadingLogo(true);
        try {
          const uploadResult = await clinicApi.uploadLogo(logoFile);
          finalLogoUrl = uploadResult.logoUrl;
          
          if (uploadResult.clinicInfo) {
            updatedClinicData = uploadResult.clinicInfo;
          }
        } catch (uploadError) {
          toast.error(uploadError.message || t('clinic.errors.uploadFailed'));
          setSaving(false);
          return;
        } finally {
          setUploadingLogo(false);
        }
      }

      if (!updatedClinicData) {
        const relativeLogoUrl = toRelativeLogoUrl(finalLogoUrl);
        
        const dataToSubmit = {
          ...formData,
          logoUrl: relativeLogoUrl,
          website: normalizedWebsite || formData.website,
          morningStartTime: formData.morningStartTime || null,
          morningEndTime: formData.morningEndTime || null,
          afternoonStartTime: formData.afternoonStartTime || null,
          afternoonEndTime: formData.afternoonEndTime || null,
        };
        
        console.log('📤 Submitting data to backend:', dataToSubmit);
        updatedClinicData = await clinicApi.updateClinicInfo(dataToSubmit);
      }
      
      console.log('💾 Update successful, data from backend:', updatedClinicData);
      
      setClinicInfo(updatedClinicData);
      
      const normalizedLogoUrl = toAbsoluteLogoUrl(updatedClinicData?.logoUrl || '');
      const newFormData = {
        name: updatedClinicData.name || '',
        address: updatedClinicData.address || '',
        phone: updatedClinicData.phone || '',
        email: updatedClinicData.email || '',
        website: updatedClinicData.website || '',
        logoUrl: normalizedLogoUrl,
        morningStartTime: updatedClinicData.morningStartTime || '',
        morningEndTime: updatedClinicData.morningEndTime || '',
        afternoonStartTime: updatedClinicData.afternoonStartTime || '',
        afternoonEndTime: updatedClinicData.afternoonEndTime || '',
      };
      
      console.log('📝 Updating form with new data:', newFormData);
      setFormData(newFormData);
      setLogoFile(null);
      setLogoPreview(normalizedLogoUrl || null);
      setIsEditing(false);
      
      setSaving(false);
      setUploadingLogo(false);
      
      console.log('🔄 Refreshing global clinic context...');
      if (typeof refreshClinicInfo === 'function') {
        await refreshClinicInfo();
      }
      
      console.log('✅ All updates completed!');
      toast.success(t('clinic.toast.updateSuccess'));
    } catch (err) {
      console.error('❌ Error during update:', err);
      toast.error(err.response?.data?.message || err.message || t('clinic.errors.updateFailed'));
      setSaving(false);
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('clinic.loading')}</p>
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('clinic.updating')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />
      
      <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 mb-6 transition-colors duration-300`}>
        <Building2 className="w-9 h-9 text-blue-600" />
        <span>{t('clinic.title')}</span>
      </h1>

      <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-300`}>
        {!clinicInfo && (
          <div className={`${theme === 'dark' ? 'bg-yellow-900/30 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800'} border px-4 py-3 rounded-lg mb-6`}>
            <p className="font-medium">{t('clinic.noData')}</p>
            <p className="text-sm mt-1">{t('clinic.noDataHint')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.logo')}
            </label>
            
            <div className="flex items-center gap-3 mb-3">
              <label className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'} border rounded-lg transition-colors ${
                isEditing ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50' : 'cursor-not-allowed opacity-50'
              }`}>
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {logoFile ? t('clinic.form.changeLogo') : t('clinic.form.selectLogo')}
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
                  className={`px-3 py-2 text-red-600 ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-lg transition-colors`}
                  title={t('clinic.form.removeLogo')}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {logoPreview && (
              <div className="mt-3">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{t('clinic.form.logoPreview')}</p>
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className={`max-w-xs h-32 object-contain border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} rounded-lg p-2`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {logoFile && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {t('clinic.form.newBadge')}
                    </div>
                  )}
                </div>
                {logoFile && (
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    {t('clinic.form.fileInfo', { name: logoFile.name, size: (logoFile.size / 1024).toFixed(2) })}
                  </p>
                )}
              </div>
            )}

            {!logoPreview && formData.logoUrl && (
              <div className="mt-3">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{t('clinic.form.currentLogo')}</p>
                <img
                  src={formData.logoUrl}
                  alt="Current logo"
                  className={`max-w-xs h-32 object-contain border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} rounded-lg p-2`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {!logoPreview && !formData.logoUrl && (
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                {t('clinic.form.noLogo')}
              </p>
            )}
          </div>

          {/* Tên phòng khám */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                theme === 'dark' 
                  ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                  : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
              }`}
              placeholder={t('clinic.form.namePlaceholder')}
              required
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.address')}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                theme === 'dark' 
                  ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                  : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
              }`}
              placeholder={t('clinic.form.addressPlaceholder')}
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                theme === 'dark' 
                  ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                  : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
              }`}
              placeholder={t('clinic.form.phonePlaceholder')}
            />
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.email')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                theme === 'dark' 
                  ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                  : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
              }`}
              placeholder={t('clinic.form.emailPlaceholder')}
            />
          </div>

          {/* Website */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.website')}
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                theme === 'dark' 
                  ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                  : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
              }`}
              placeholder={t('clinic.form.websitePlaceholder')}
            />
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {t('clinic.form.websiteHint')}
            </p>
          </div>

          {/* Giờ làm việc buổi sáng */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.morningHours')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors duration-300`}>{t('clinic.form.startTime')}</label>
                <input
                  type="time"
                  name="morningStartTime"
                  value={formData.morningStartTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                    theme === 'dark' 
                      ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                      : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors duration-300`}>{t('clinic.form.endTime')}</label>
                <input
                  type="time"
                  name="morningEndTime"
                  value={formData.morningEndTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                    theme === 'dark' 
                      ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                      : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Giờ làm việc buổi chiều */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
              {t('clinic.form.afternoonHours')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors duration-300`}>{t('clinic.form.startTime')}</label>
                <input
                  type="time"
                  name="afternoonStartTime"
                  value={formData.afternoonStartTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                    theme === 'dark' 
                      ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                      : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors duration-300`}>{t('clinic.form.endTime')}</label>
                <input
                  type="time"
                  name="afternoonEndTime"
                  value={formData.afternoonEndTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 ${
                    theme === 'dark' 
                      ? `bg-gray-700 border-gray-600 text-white ${!isEditing ? 'cursor-not-allowed' : ''}` 
                      : `border-gray-300 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`
                  }`}
                />
              </div>
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {t('clinic.form.hoursHint')}
            </p>
          </div>

          {/* Thông tin bổ sung */}
          {clinicInfo && (
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
              <div className={`grid grid-cols-2 gap-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                <div>
                  <span className="font-medium">{t('clinic.form.createdAt')}:</span>{' '}
                  {clinicInfo.createdAt
                    ? new Date(clinicInfo.createdAt).toLocaleString(t('common.locale') === 'vi' ? 'vi-VN' : 'en-GB')
                    : 'N/A'}
                </div>
                <div>
                  <span className="font-medium">{t('clinic.form.updatedAt')}:</span>{' '}
                  {clinicInfo.updatedAt
                    ? new Date(clinicInfo.updatedAt).toLocaleString(t('common.locale') === 'vi' ? 'vi-VN' : 'en-GB')
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
                {t('clinic.common.edit')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setLogoFile(null);
                    if (clinicInfo) {
                      const normalizedLogoUrl = toAbsoluteLogoUrl(clinicInfo.logoUrl || '');
                      setFormData({
                        name: clinicInfo.name || '',
                        address: clinicInfo.address || '',
                        phone: clinicInfo.phone || '',
                        email: clinicInfo.email || '',
                        website: clinicInfo.website || '',
                        logoUrl: normalizedLogoUrl,
                        morningStartTime: clinicInfo.morningStartTime || '',
                        morningEndTime: clinicInfo.morningEndTime || '',
                        afternoonStartTime: clinicInfo.afternoonStartTime || '',
                        afternoonEndTime: clinicInfo.afternoonEndTime || '',
                      });
                      setLogoPreview(normalizedLogoUrl || null);
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                >
                  {t('clinic.common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving || uploadingLogo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('clinic.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {t('clinic.saveButton')}
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