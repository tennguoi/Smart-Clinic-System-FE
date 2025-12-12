// src/components/common/SecurityManager.jsx (đã thêm i18n)
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SecuritySection from './SecuritySection';
import axiosInstance from '../../utils/axiosConfig';
import { authService } from '../../services/authService';

export default function SecurityManager({ initialData = {} }) {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!initialData.twoFactorEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setTwoFactorEnabled(!!initialData.twoFactorEnabled);
  }, [initialData.twoFactorEnabled]);

  const updateUserInStorage = (updatedData) => {
    const newUser = { ...initialData, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('user_info', JSON.stringify(newUser));
    if (authService?.setUserInfo) authService.setUserInfo(newUser);
  };

  const handleToggle2FA = async () => {
    setMessage('');
    setLoading(true);

    try {
      if (twoFactorEnabled) {
        await axiosInstance.post('/api/auth/disable-2fa');
        setTwoFactorEnabled(false);
        updateUserInStorage({ twoFactorEnabled: false });
        setMessage(t('profilepage.security_2fa_disabled_success') || 'Đã tắt xác thực 2 yếu tố thành công!');
        return false;
      } else {
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', { email: initialData.email });
        if (data.success) {
          setMessage(t('profilepage.security_otp_sent') || `Mã OTP đã được gửi đến email: ${initialData.email}`);
          return true;
        }
      }
    } catch (err) {
      setMessage(t('profilepage.security_error') || `Lỗi: ${err.response?.data?.message || 'Không thể thực hiện'}`);
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
        setMessage(t('profilepage.security_2fa_enabled_success') || 'Bật xác thực 2 yếu tố thành công!');
        return true;
      } else {
        setMessage(t('profilepage.security_otp_invalid') || 'Mã OTP không đúng hoặc đã hết hạn');
        return false;
      }
    } catch (err) {
      setMessage(err.response?.data?.message || t('profilepage.security_verify_failed') || 'Xác thực thất bại. Vui lòng thử lại.');
      return false;
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {};

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border text-sm font-medium transition-all ${
          message.includes('thành công') || message.includes('success')
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {message}
        </div>
      )}

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