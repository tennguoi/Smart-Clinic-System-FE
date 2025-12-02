// src/components/common/ProfileManager.jsx
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileSection from './ProfileSection';
import adminAccountApi from '../../api/adminAccountApi';

const persistUser = (data) => {
  localStorage.setItem('user', JSON.stringify(data));
  localStorage.setItem('user_info', JSON.stringify(data));
};

export default function ProfileManager({ initialData = {} }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(true);
  const [userData, setUserData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dob || initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    address: initialData.address || '',
    photoUrl: initialData.photoUrl || '',
  });

  const [message, setMessage] = useState({ text: '', type: '' }); // success | error

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setMessage({ text: t('profileManager.loading'), type: 'info' });

        const response = await adminAccountApi.getCurrentUserProfile();
        const profileData = response;

        if (profileData && profileData.userId) {
          const updatedData = {
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            dateOfBirth: profileData.dob || profileData.dateOfBirth || '',
            gender: profileData.gender || '',
            address: profileData.address || '',
            photoUrl: profileData.photoUrl || '',
          };

          setUserData(updatedData);
          persistUser(profileData);
          setMessage({ text: '', type: '' });
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin cá nhân:', err);
        setMessage({
          text: 'Không thể tải thông tin cá nhân. Vui lòng thử lại sau.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  const handleChange = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSwitchToEdit = () => {
    setIsViewMode(false);
    setMessage({ text: '', type: '' });
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: t('profileManager.processing'), type: 'info' });

      const response = await adminAccountApi.updateProfile({
        fullName: userData.fullName,
        phone: userData.phone,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
      });

      if (response && response.userId) {
        persistUser(response);
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));

        setMessage({ text: t('profileManager.updateSuccess'), type: 'success' });
        setIsViewMode(true);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi hệ thống';
      setMessage({ text: `${t('profileManager.updateFailed')}: ${errorMsg}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: t('profileManager.fileTooLarge'), type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: t('profileManager.uploadPhoto'), type: 'info' });

      const response = await adminAccountApi.uploadProfilePhoto(file);

      if (response.success || response.data) {
        const photoUrl = response.data?.photoUrl || response.data || response.photoUrl;
        const updatedUserData = { ...userData, photoUrl };

        setUserData(updatedUserData);
        persistUser({ ...JSON.parse(localStorage.getItem('user') || '{}'), photoUrl });
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));

        setMessage({ text: t('profileManager.uploadSuccess'), type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      const errorMsg = err.response?.data?.message || 'Lỗi hệ thống';
      setMessage({ text: `${t('profileManager.uploadFailed')}: ${errorMsg}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) handlePhotoChange(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Thông báo */}
      {message.text && (
        <div
          className={`px-4 py-3 rounded-lg border transition-all ${
            message.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : message.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form chỉnh sửa hồ sơ */}
      <ProfileSection
        {...userData}
        dateOfBirth={userData.dateOfBirth}
        onChange={handleChange}
        onPhotoChange={handleFileInput}
        isLoading={isLoading}
        isViewMode={isViewMode}
        onSwitchToEdit={handleSwitchToEdit}
      />

      {/* Nút hành động khi đang chỉnh sửa */}
      {!isViewMode && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={() => setIsViewMode(true)}
            disabled={isLoading}
            className="px-6 py-3 font-medium rounded-lg transition-colors shadow-sm bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-60"
          >
            {t('profileManager.cancel')}
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className={`px-6 py-3 font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading && <span className="loading loading-spinner loading-xs"></span>}
            {isLoading ? t('profileManager.processing') : t('profileManager.saveChanges')}
          </button>
        </div>
      )}
    </div>
  );
}