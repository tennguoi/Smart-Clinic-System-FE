import { Lock, Shield, Key, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { useTranslation } from 'react-i18next';

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
      return;
    }

    try {
      const { data } = await axiosInstance.post('/api/auth/change-password', {
        oldPassword: changePasswordData.oldPassword,
        newPassword: changePasswordData.newPassword,
      });

      if (data?.success) {
        setSuccess(t('profilepage.security_password_changed_success'));
        setChangePasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(data?.message || t('profilepage.security_password_change_failed'));
      }
    } catch (err) {
      setError(err.response?.data?.message || t('profilepage.security_password_change_error'));
    }
  };

  const handleToggle2FAClick = async () => {
    if (!twoFactorEnabled) {
      setIs2FALoading(true);
      try {
        const shouldOpenOtpModal = await onToggle2FA();
        if (shouldOpenOtpModal) {
          setIsOtpModalOpen(true);
          setOtpCode('');
          setOtpError('');
        }
      } finally {
        setIs2FALoading(false);
      }
    } else {
      await onToggle2FA();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setIsVerifying(true);

    if (otpCode.length !== 6) {
      setOtpError(t('profilepage.security_otp_invalid_length'));
      setIsVerifying(false);
      return;
    }

    try {
      const verified = await onVerify2FA(otpCode);
      if (verified) {
        setIsOtpModalOpen(false);
        setOtpCode('');
      } else {
        setOtpError(t('profilepage.security_otp_invalid'));
      }
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
  };

  return (
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
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
              } ${is2FALoading || loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-flex h-10 w-10 rounded-full bg-white shadow-lg transform transition-transform ${
                twoFactorEnabled ? 'translate-x-12' : 'translate-x-1'
              }`}>
                {is2FALoading || loading ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin m-auto" />
                ) : twoFactorEnabled ? (
                  <span className="text-green-600 font-bold m-auto">Check</span>
                ) : (
                  <span className="text-gray-400 font-bold m-auto">Cross</span>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profilepage.security_change_password')}
            </h3>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profilepage.security_current_password')}
                </label>
                <input
                  type="password"
                  value={changePasswordData.oldPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, oldPassword: e.target.value })}
                  placeholder={t('profilepage.security_enter_current_password')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profilepage.security_new_password')}
                </label>
                <input
                  type="password"
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                  placeholder={t('profilepage.security_enter_new_password')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profilepage.security_confirm_new_password')}
                </label>
                <input
                  type="password"
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                  placeholder={t('profilepage.security_confirm_new_password')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {t('profilepage.security_change_password')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal OTP */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <button onClick={closeModals} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              {otpError && <p className="text-red-600 text-sm text-center">{otpError}</p>}
              <button
                type="submit"
                disabled={isVerifying}
                className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                  isVerifying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('profilepage.security_verifying')}
                  </>
                ) : (
                  t('profilepage.security_confirm_otp')
                )}
              </button>
              <button
                type="button"
                onClick={closeModals}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t('profilepage.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}