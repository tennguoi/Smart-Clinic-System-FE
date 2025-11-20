// src/components/common/ProfileManager.jsx
import { useState, useCallback } from 'react';
import ProfileSection from './ProfileSection';
import axiosInstance from '../../utils/axiosConfig';

const persistUser = (data) => {
  localStorage.setItem('user', JSON.stringify(data));
  localStorage.setItem('user_info', JSON.stringify(data));
};

export default function ProfileManager({ initialData = {} }) {
  const [userData, setUserData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    dateOfBirth: initialData.dob || initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    address: initialData.address || '',
    photoUrl: initialData.photoUrl || '',
  });

  const [message, setMessage] = useState('');

  const handleChange = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdate = async () => {
    try {
      await axiosInstance.post('/api/auth/update-profile', {
        fullName: userData.fullName,
        phone: userData.phone,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
      });
      persistUser({ ...initialData, ...userData });
      setMessage('Cập nhật thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Cập nhật thất bại: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
    }
  };

  const handlePhotoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('photo', file);
      try {
        const { data } = await axiosInstance.post('/api/auth/upload-photo', formData);
        if (data.success) {
          const updated = { ...userData, photoUrl: data.data };
          setUserData(updated);
          persistUser({ ...initialData, photoUrl: data.data });
          setMessage('Cập nhật ảnh thành công!');
        }
      } catch (err) {
        setMessage('Tải ảnh thất bại');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-lg border ${message.includes('thành công') ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
          {message}
        </div>
      )}
      <ProfileSection
        {...userData}
        dateOfBirth={userData.dateOfBirth}
        onChange={handleChange}
        onPhotoChange={handlePhotoChange}
      />
      <div className="flex justify-end">
        <button
          onClick={handleUpdate}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Cập Nhật Thông Tin
        </button>
      </div>
    </div>
  );
}