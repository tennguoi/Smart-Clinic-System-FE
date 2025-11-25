// src/components/common/SecurityManager.jsx
import { useState, useEffect } from 'react';
import SecuritySection from './SecuritySection';
import axiosInstance from '../../utils/axiosConfig';
import { authService } from '../../services/authService';

export default function SecurityManager({ initialData = {} }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!initialData.twoFactorEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Update when initialData changes (e.g., page reload)
  useEffect(() => {
    setTwoFactorEnabled(!!initialData.twoFactorEnabled);
  }, [initialData.twoFactorEnabled]);

  const updateUserInStorage = (updatedData) => {
    const newUser = { ...initialData, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('user_info', JSON.stringify(newUser));
    if (authService && authService.setUserInfo) {
      authService.setUserInfo(newUser);
    }
  };

  const handleToggle2FA = async () => {
    setMessage('');
    setLoading(true);

    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        await axiosInstance.post('/api/auth/disable-2fa');
        setTwoFactorEnabled(false);
        updateUserInStorage({ twoFactorEnabled: false });
        setMessage('Đã tắt xác thực 2 yếu tố thành công!');
        return false;
      } else {
        // Enable 2FA - Send OTP
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', {
          email: initialData.email,
        });

        if (data.success) {
          setMessage('Mã OTP đã được gửi đến email: ' + initialData.email);
          return true; // Tell SecuritySection to open OTP modal
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể thực hiện';
      setMessage(`Lỗi: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleVerify2FA = async (otpCode) => {
    setMessage('');
    try {
      const { data } = await axiosInstance.post('/api/auth/verify-2fa-enable', {
        email: initialData.email,
        otpCode,
      });

      if (data.success) {
        setTwoFactorEnabled(true);
        updateUserInStorage({ twoFactorEnabled: true });
        setMessage('Bật xác thực 2 yếu tố thành công!');
        return true;
      } else {
        setMessage('Mã OTP không đúng hoặc đã hết hạn');
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Xác thực thất bại. Vui lòng thử lại.';
      setMessage(errorMessage);
      return false;
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    // You can add password change logic here if needed
    // Currently, let SecuritySection handle it
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {message && (
        <div 
          className={`p-4 rounded-lg border text-sm font-medium transition-all ${
            message.includes('thành công') 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Main Component */}
      <SecuritySection
        twoFactorEnabled={twoFactorEnabled}
        loading={loading}
        onToggle2FA={handleToggle2FA}
        onVerify2FA={handleVerify2FA}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}