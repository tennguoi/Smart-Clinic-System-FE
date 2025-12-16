// src/components/common/SecurityManager.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SecuritySection from './SecuritySection';
import axiosInstance from '../../utils/axiosConfig';
import { authService } from '../../services/authService';

export default function SecurityManager({ initialData = {} }) {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // QUAN TRỌNG: Khởi tạo state từ nhiều nguồn khi component mount
  useEffect(() => {
    const initialize2FAState = () => {
      // Ưu tiên 1: Lấy từ initialData (props)
      if (initialData.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(!!initialData.twoFactorEnabled);
        return;
      }
      
      // Ưu tiên 2: Lấy từ authService
      const userInfo = authService.getUserInfo();
      if (userInfo?.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(!!userInfo.twoFactorEnabled);
        return;
      }
      
      // Ưu tiên 3: Lấy từ localStorage
      const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
      if (userFromStorage.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(!!userFromStorage.twoFactorEnabled);
        return;
      }
      
      // Ưu tiên 4: Lấy từ localStorage user_info
      const userInfoFromStorage = JSON.parse(localStorage.getItem('user_info') || '{}');
      if (userInfoFromStorage.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(!!userInfoFromStorage.twoFactorEnabled);
        return;
      }
      
      // Mặc định là false
      setTwoFactorEnabled(false);
    };
    
    initialize2FAState();
    
    // Sau đó fetch từ server để đảm bảo chính xác
    fetch2FAStatus();
  }, [initialData]);

  // Fetch trạng thái 2FA từ server
  const fetch2FAStatus = useCallback(async () => {
    setIsFetching(true);
    try {
      // Thử endpoint 2fa-status trước
      try {
        const { data } = await axiosInstance.get('/api/auth/2fa-status');
        
        if (data && data.enabled !== undefined) {
          setTwoFactorEnabled(data.enabled);
          updateUserInStorage({ twoFactorEnabled: data.enabled });
          return;
        }
      } catch (statusErr) {
        // Không có endpoint 2fa-status, tiếp tục thử endpoint khác
      }
      
      // Fallback: Lấy từ thông tin user
      const { data: userData } = await axiosInstance.get('/api/auth/user');
      
      if (userData?.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(!!userData.twoFactorEnabled);
        updateUserInStorage({ twoFactorEnabled: !!userData.twoFactorEnabled });
      }
    } catch (err) {
      // Giữ nguyên state hiện tại nếu fetch thất bại
    } finally {
      setIsFetching(false);
    }
  }, []);

  const updateUserInStorage = useCallback((updatedData) => {
    try {
      // Cập nhật tất cả các nơi lưu trữ user
      const userKeys = ['user', 'user_info'];
      
      userKeys.forEach(key => {
        const currentData = JSON.parse(localStorage.getItem(key) || '{}');
        const newData = { ...currentData, ...updatedData };
        localStorage.setItem(key, JSON.stringify(newData));
      });
      
      // Cập nhật trong authService
      if (authService?.setUserInfo) {
        const currentUserInfo = authService.getUserInfo() || {};
        const newUserInfo = { ...currentUserInfo, ...updatedData };
        authService.setUserInfo(newUserInfo);
      }
    } catch (err) {
      console.error('Error updating storage:', err);
    }
  }, []);

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Đang bật -> tắt
      return handleDisable2FA();
    } else {
      // Đang tắt -> bật
      return handleEnable2FA();
    }
  };

  const handleEnable2FA = async () => {
    setMessage('');
    setLoading(true);

    try {
      const userInfo = authService.getUserInfo() || initialData;
      const email = userInfo.email;
      
      if (!email) {
        throw new Error('Không tìm thấy email');
      }
      
      const { data } = await axiosInstance.post('/api/auth/enable-2fa', { email });
      
      if (data.success) {
        const message = t('profilepage.security_otp_sent') || `Mã OTP đã được gửi đến ${email}`;
        setMessage(message);
        return true; // Trả về true để mở modal OTP
      } else {
        setMessage(data.message || 'Không thể bật 2FA');
        return false;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể thực hiện';
      setMessage(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setMessage('');
    setLoading(true);

    try {
      await axiosInstance.post('/api/auth/disable-2fa');
      
      // Cập nhật state và storage ngay lập tức
      setTwoFactorEnabled(false);
      updateUserInStorage({ twoFactorEnabled: false });
      
      const message = t('profilepage.security_2fa_disabled_success') || 'Đã tắt xác thực 2 yếu tố thành công!';
      setMessage(message);
      
      return false; // Không mở modal OTP
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể thực hiện';
      setMessage(errorMsg);
      
      // Nếu có lỗi, fetch lại trạng thái
      await fetch2FAStatus();
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (otpCode) => {
    setMessage('');
    
    try {
      const userInfo = authService.getUserInfo() || initialData;
      const email = userInfo.email;
      
      const { data } = await axiosInstance.post('/api/auth/verify-2fa-enable', {
        email,
        otpCode,
      });

      if (data.success) {
        // Cập nhật state và storage
        setTwoFactorEnabled(true);
        updateUserInStorage({ twoFactorEnabled: true });
        
        const message = t('profilepage.security_2fa_enabled_success') || 'Bật xác thực 2 yếu tố thành công!';
        setMessage(message);
        return true;
      } else {
        const message = t('profilepage.security_otp_invalid') || 'Mã OTP không đúng hoặc đã hết hạn';
        setMessage(message);
        return false;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Xác thực thất bại';
      setMessage(errorMsg);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium transition-all ${
          message.toLowerCase().includes('thành công') || 
          message.toLowerCase().includes('success') || 
          message.toLowerCase().includes('gửi') ||
          message.toLowerCase().includes('enabled') ||
          message.toLowerCase().includes('disabled')
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {isFetching ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải trạng thái bảo mật...</span>
        </div>
      ) : (
        <SecuritySection
          twoFactorEnabled={twoFactorEnabled}
          loading={loading}
          onToggle2FA={handleToggle2FA}
          onVerify2FA={handleVerify2FA}
          on2FAStatusChange={setTwoFactorEnabled}
        />
      )}
    </div>
  );
}