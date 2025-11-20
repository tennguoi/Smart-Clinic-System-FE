// src/components/common/SecurityManager.jsx
import { useState, useEffect } from 'react';
import SecuritySection from './SecuritySection';
import axiosInstance from '../../utils/axiosConfig';
import { authService } from '../../services/authService';

export default function SecurityManager({ initialData = {} }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!initialData.twoFactorEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cập nhật lại khi initialData thay đổi (ví dụ: reload trang)
  useEffect(() => {
    setTwoFactorEnabled(!!initialData.twoFactorEnabled);
  }, [initialData.twoFactorEnabled]);

  const updateUserInStorage = (updatedData) => {
    const newUser = { ...initialData, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('user_info', JSON.stringify(newUser));
    authService.setUserInfo(newUser); // nếu bạn có hàm này
  };

  const handleToggle2FA = async () => {
    setMessage('');
    setLoading(true);

    try {
      if (twoFactorEnabled) {
        // Tắt 2FA
        await axiosInstance.post('/api/auth/disable-2fa');
        setTwoFactorEnabled(false);
        updateUserInStorage({ twoFactorEnabled: false });
        setMessage('Đã tắt xác thực 2 yếu tố thành công!');
      } else {
        // Bật 2FA → gửi OTP
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', {
          email: initialData.email,
        });

        if (data.success) {
          setMessage('Mã OTP đã được gửi đến email: ' + initialData.email);
          return true; // báo cho SecuritySection mở modal OTP
        }
      }
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data?.message || 'Không thể thực hiện'));
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
      setMessage('Xác thực thất bại. Vui lòng thử lại.');
      return false;
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    // Bạn có thể thêm logic đổi mật khẩu ở đây nếu muốn
    // Hiện tại để SecuritySection tự xử lý
  };

  return (
    <div className="space-y-6">
      {/* Thông báo */}
      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium transition-all ${
          message.includes('thành công') 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Component chính */}
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