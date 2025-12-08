// src/components/common/ProfileManager.jsx
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
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

  // === CHỈ TẢI PROFILE BAN ĐẦU ===
  useEffect(() => {
    let toastId; // Khai báo để có thể dismiss khi thành công

    const fetchUserProfile = async () => {
      toastId = toast.loading(t('profileManager.loading'));

      try {
        setIsLoading(true);
        const response = await adminAccountApi.getCurrentUserProfile();

        if (response && response.userId) {
          const updatedData = {
            fullName: response.fullName || '',
            email: response.email || '',
            phone: response.phone || '',
            dateOfBirth: response.dob || response.dateOfBirth || '',
            gender: response.gender || '',
            address: response.address || '',
            photoUrl: response.photoUrl || '',
          };

          setUserData(updatedData);
          persistUser(response);

          // Chỉ dismiss loading toast, KHÔNG hiện success
          toast.dismiss(toastId);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin cá nhân:', err);
        toast.error(
          t('profileManager.loadFailed') || 'Không thể tải thông tin cá nhân. Vui lòng thử lại sau.',
          { id: toastId }
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  const handleChange = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSwitchToEdit = () => setIsViewMode(false);

  // === CẬP NHẬT HỒ SƠ (vẫn hiện success) ===
  const handleUpdate = async () => {
    const toastId = toast.loading(t('profileManager.processing'));

    try {
      setIsLoading(true);
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
        toast.success(t('profileManager.updateSuccess'), { id: toastId });
        setIsViewMode(true);
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi hệ thống';
      toast.error(`${t('profileManager.updateFailed')}: ${errorMsg}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // === UPLOAD ẢNH (vẫn hiện success) ===
  const handlePhotoChange = async (file) => {
  if (!file) return;

  // Vẫn cần báo lỗi file quá lớn
  if (file.size > 5 * 1024 * 1024) {
    toast.error(t('profileManager.fileTooLarge') || 'Ảnh không được vượt quá 5MB');
    return;
  }

  try {
    setIsLoading(true);
    const response = await adminAccountApi.uploadProfilePhoto(file);

    if (response.success || response.data || response.photoUrl) {
      const photoUrl = response.data?.photoUrl || response.photoUrl || response.data;
      const updatedUserData = { ...userData, photoUrl };
      setUserData(updatedUserData);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      persistUser({ ...storedUser, photoUrl });

      window.dispatchEvent(new CustomEvent('userInfoUpdated'));
      // ❌ không dùng toast nữa
    }
  } catch (err) {
    console.error('Lỗi khi tải ảnh lên:', err);
    // ❌ không báo lỗi upload ảnh nữa
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
    <>
      <Toaster {...toastConfig} />

      <div className="space-y-6">
        <ProfileSection
          {...userData}
          dateOfBirth={userData.dateOfBirth}
          onChange={handleChange}
          onPhotoChange={handleFileInput}
          isLoading={isLoading}
          isViewMode={isViewMode}
          onSwitchToEdit={handleSwitchToEdit}
        />

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
    </>
  );
}