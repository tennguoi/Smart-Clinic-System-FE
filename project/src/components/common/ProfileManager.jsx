// src/components/common/ProfileManager.jsx
import { useState, useCallback, useEffect } from 'react';
import ProfileSection from './ProfileSection';
import adminAccountApi from '../../api/adminAccountApi';

const persistUser = (data) => {
  localStorage.setItem('user', JSON.stringify(data));
  localStorage.setItem('user_info', JSON.stringify(data));
};

export default function ProfileManager({ initialData = {} }) {
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

  const [message, setMessage] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Fetch complete user profile from backend
        const response = await adminAccountApi.getCurrentUserProfile();
        
        // The API returns the user object directly
        const profileData = response;
        if (profileData && profileData.userId) {
          setUserData({
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            dateOfBirth: profileData.dob || profileData.dateOfBirth || '',
            gender: profileData.gender || '',
            address: profileData.address || '',
            photoUrl: profileData.photoUrl || '',
          });
          // Update localStorage with fetched data
          persistUser(profileData);
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin cá nhân:', err);
        setMessage('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSwitchToEdit = () => {
    setIsViewMode(false);
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await adminAccountApi.updateProfile({
        fullName: userData.fullName,
        phone: userData.phone,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
      });
      
      // API returns the updated user object directly
      if (response && response.userId) {
        persistUser(response);
        
        // Trigger event để Header cập nhật
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));
        
        setMessage('Cập nhật thông tin thành công!');
        setIsViewMode(true); // Chuyển về view mode sau khi cập nhật thành công
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      setMessage('Cập nhật thất bại: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = async (file) => {
    if (!file) return;
    
    try {
      setIsLoading(true);
      setMessage('Đang tải ảnh lên...');
      
      // Call the API to upload the photo
      const response = await adminAccountApi.uploadProfilePhoto(file);
      
      if (response.success) {
        // Update the photo URL in the user data
        const updatedUserData = {
          ...userData,
          photoUrl: response.data.photoUrl || response.data
        };
        
        setUserData(updatedUserData);
        
        // Update localStorage with the new photo URL
        const updatedUser = { 
          ...initialData, 
          photoUrl: updatedUserData.photoUrl 
        };
        persistUser(updatedUser);
        
        // Trigger event để Header cập nhật
        window.dispatchEvent(new CustomEvent('userInfoUpdated'));
        
        setMessage('Cập nhật ảnh đại diện thành công!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      setMessage('Tải ảnh thất bại: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
    } finally {
      setIsLoading(false);
    }
  };

  // File input handler
  const handleFileInput = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setMessage('Kích thước ảnh không được vượt quá 5MB');
          return;
        }
        handlePhotoChange(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-3 rounded-lg border ${
          message.includes('thành công') 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {message}
        </div>
      )}
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
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsViewMode(true)}
            disabled={isLoading}
            className="px-6 py-3 font-medium rounded-lg transition-colors shadow-sm bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className={`px-6 py-3 font-medium rounded-lg transition-colors shadow-sm ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : 'Cập Nhật Thông Tin'}
          </button>
        </div>
      )}
    </div>
  );
}