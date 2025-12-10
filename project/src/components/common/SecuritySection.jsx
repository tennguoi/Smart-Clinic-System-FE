import { Lock, Shield, Key, X, Loader2, Camera } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';

export default function SecuritySection({
  twoFactorEnabled,
  onToggle2FA,
  onVerify2FA,
  loading,
}) {
  const { t } = useTranslation();

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setError(t('profilepage.security_password_mismatch'));
      toast.error(t('profilepage.security_password_mismatch'));
      return;
    }

    if (changePasswordData.newPassword.length < 8) {
      setError(t('profilepage.security_password_too_short'));
      toast.error(t('profilepage.security_password_too_short'));
      return;
    }

    const loadingToast = toast.loading(t('profilepage.security_changing_password'));

    try {
      const { data } = await axiosInstance.post('/api/auth/change-password', {
        oldPassword: changePasswordData.oldPassword,
        newPassword: changePasswordData.newPassword,
      });

      if (data?.success) {
        toast.success(t('profilepage.security_password_changed_success'), { id: loadingToast });
        setSuccess(t('profilepage.security_password_changed_success'));
        setChangePasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        const msg = data?.message || t('profilepage.security_password_change_failed');
        toast.error(msg, { id: loadingToast });
        setError(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('profilepage.security_password_change_error');
      toast.error(msg, { id: loadingToast });
      setError(msg);
    }
  };

  const handleToggle2FAClick = async () => {
    if (!twoFactorEnabled) {
      setIs2FALoading(true);
      toast.loading(t('profilepage.security_enabling_2fa'));

      try {
        const shouldOpenOtpModal = await onToggle2FA();
        if (shouldOpenOtpModal) {
          toast.dismiss();
          toast.success(t('profilepage.security_2fa_qr_generated'));
          setIsOtpModalOpen(true);
          setOtpCode('');
          setOtpError('');
        }
      } catch (err) {
        toast.error(t('profilepage.security_2fa_enable_failed'));
      } finally {
        setIs2FALoading(false);
      }
    } else {
      setIs2FALoading(true);
      toast.loading(t('profilepage.security_disabling_2fa'));

      try {
        await onToggle2FA();
        toast.success(t('profilepage.security_2fa_disabled_success'));
      } catch (err) {
        toast.error(t('profilepage.security_2fa_disable_failed'));
      } finally {
        setIs2FALoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.length !== 6) {
      setOtpError(t('profilepage.security_otp_invalid_length'));
      toast.error(t('profilepage.security_otp_invalid_length'));
      return;
    }

    setIsVerifying(true);
    const verifyingToast = toast.loading(t('profilepage.security_verifying_otp'));

    try {
      const verified = await onVerify2FA(otpCode);
      if (verified) {
        toast.success(t('profilepage.security_2fa_enabled_success'), { id: verifyingToast });
        setIsOtpModalOpen(false);
        setOtpCode('');
      } else {
        toast.error(t('profilepage.security_otp_invalid'), { id: verifyingToast });
        setOtpError(t('profilepage.security_otp_invalid'));
      }
    } catch (err) {
      toast.error(t('profilepage.security_otp_verification_failed'), { id: verifyingToast });
      setOtpError(t('profilepage.security_otp_verification_failed'));
    } finally {
      setIsVerifying(false);
    }
  };

  const closeModals = () => {
    setIsChangePasswordModalOpen(false);
    setIsOtpModalOpen(false);
    setError('');
    setSuccess('');
    setOtpError('');
    setOtpCode('');
    toast.dismiss();
  };

  return (
    <>
      {/* Toast dùng đúng style đẹp từ toastConfig.js */}
      <Toaster {...toastConfig} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('profilepage.security_title')}
        </h2>

        <div className="space-y-6">
          {/* Đổi mật khẩu */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t('profilepage.security_password')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t('profilepage.security_password_desc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Key className="w-4 h-4" />
                {t('profilepage.security_change_password')}
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {t('profilepage.security_2fa')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {twoFactorEnabled
                      ? t('profilepage.security_2fa_enabled_desc')
                      : t('profilepage.security_2fa_disabled_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle2FAClick}
                disabled={is2FALoading || loading}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-4 ${
                  twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                } ${is2FALoading || loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                <span
                  className={`inline-flex h-10 w-10 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                    twoFactorEnabled ? 'translate-x-12' : 'translate-x-1'
                  }`}
                >
                  {is2FALoading || loading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin m-auto" />
                  ) : twoFactorEnabled ? (
                    <span className="text-green-600 font-bold m-auto text-xl">✓</span>
                  ) : (
                    <span className="text-gray-500 font-bold m-auto text-xl">✕</span>
                  )}
                </span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-yellow-600 font-bold">Warning</span>
                <span>
                  {twoFactorEnabled
                    ? t('profilepage.security_2fa_enabled_warning')
                    : t('profilepage.security_2fa_recommendation')}
                </span>
              </p>
            </div>
          </div>

          {/* Lời khuyên bảo mật */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                  {t('profilepage.security_tips_title')}
                </h4>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• {t('profilepage.security_tip_strong_password')}</li>
                  <li>• {t('profilepage.security_tip_no_share')}</li>
                  <li>• {t('profilepage.security_tip_change_regularly')}</li>
                  <li>• {t('profilepage.security_tip_enable_2fa')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Đổi mật khẩu */}
        {isChangePasswordModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('profilepage.security_change_password')}
              </h3>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
  {t('profilepage.security_current_password')} <span className="text-red-500">*</span>
</label>
                  <input
                    type="password"
                    value={changePasswordData.oldPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, oldPassword: e.target.value })}
                    placeholder={t('profilepage.security_enter_current_password')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
  {t('profilepage.security_new_password')} <span className="text-red-500">*</span>
</label>
                  <input
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                    placeholder={t('profilepage.security_enter_new_password')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
  {t('profilepage.security_confirm_new_password')} <span className="text-red-500">*</span>
</label>
                  <input
                    type="password"
                    value={changePasswordData.confirmPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                    placeholder={t('profilepage.security_confirm_new_password')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
                {success && <p className="text-green-600 text-sm text-center font-medium">{success}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                  {t('profilepage.security_change_password')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal OTP */}
        {isOtpModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('profilepage.security_otp_title')}
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {t('profilepage.security_otp_description')}
                </p>
              </div>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {t('profilepage.security_otp_code')}
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                {otpError && <p className="text-red-600 text-sm text-center font-medium">{otpError}</p>}
                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length !== 6}
                  className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition ${
                    isVerifying || otpCode.length !== 6
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('profilepage.security_verifying')}
                    </>
                  ) : (
                    t('profilepage.security_confirm_otp')
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                >
                  {t('profilepage.cancel')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}