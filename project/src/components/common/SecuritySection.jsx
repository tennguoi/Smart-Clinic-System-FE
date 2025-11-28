import { Lock, Shield, Key, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

export default function SecuritySection({ twoFactorEnabled, onToggle2FA, onVerify2FA, onChangePassword, loading }) {
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
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/api/auth/change-password', {
        oldPassword: changePasswordData.oldPassword,
        newPassword: changePasswordData.newPassword,
      });
      if (data?.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setChangePasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setSuccess('');
          setError('');
        }, 1500);
      } else {
        setError(data?.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi đổi mật khẩu');
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
      setOtpError('Vui lòng nhập mã OTP 6 số.');
      setIsVerifying(false);
      return;
    }

    try {
      const verified = await onVerify2FA(otpCode);
      if (verified) {
        setIsOtpModalOpen(false);
        setOtpCode('');
        setOtpError('');
      } else {
        setOtpError('OTP không hợp lệ. Vui lòng thử lại.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtpCode('');
    setOtpError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Bảo Mật & Cài Đặt</h2>

      <div className="space-y-6">
        {/* Section Đổi Mật Khẩu */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Mật khẩu</h3>
                <p className="text-xs text-gray-500">Quản lý mật khẩu đăng nhập của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Đổi Mật Khẩu
            </button>
          </div>
        </div>

        {/* Section 2FA */}
        <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Xác Thực 2 Yếu Tố (2FA)
                </h3>
                <p className="text-sm text-gray-600">
                  {twoFactorEnabled
                    ? 'Tài khoản của bạn được bảo vệ với lớp bảo mật bổ sung'
                    : 'Bật tính năng này để tăng cường bảo mật tài khoản'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggle2FAClick}
              disabled={is2FALoading || loading}
              className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 ${
                twoFactorEnabled
                  ? 'bg-green-500 focus:ring-green-200'
                  : 'bg-gray-300 focus:ring-gray-200'
              } ${(is2FALoading || loading) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-flex items-center justify-center h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  twoFactorEnabled ? 'translate-x-12' : 'translate-x-1'
                }`}
              >
                {is2FALoading || loading ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : twoFactorEnabled ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <span className="text-gray-400 font-bold">✕</span>
                )}
              </span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-yellow-600 font-bold">⚠</span>
              <span>
                {twoFactorEnabled
                  ? 'Bạn sẽ cần mã xác thực từ email mỗi khi đăng nhập'
                  : 'Khuyến nghị bật 2FA để bảo vệ tài khoản khỏi truy cập trái phép'}
              </span>
            </p>
          </div>
        </div>

        {/* Lời Khuyên Bảo Mật */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Lời Khuyên Bảo Mật
              </h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Sử dụng mật khẩu mạnh với ít nhất 12 ký tự</li>
                <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                <li>• Đổi mật khẩu định kỳ mỗi 3-6 tháng</li>
                <li>• Bật xác thực 2 yếu tố để tăng cường bảo mật</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đổi Mật Khẩu */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setIsChangePasswordModalOpen(false);
                setError('');
                setSuccess('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đổi Mật Khẩu</h3>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={changePasswordData.oldPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đổi Mật Khẩu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nhập OTP */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseOtpModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác Thực OTP</h3>
              <p className="text-sm text-gray-600">
                Mã OTP đã được gửi đến email của bạn.<br />
                Vui lòng nhập mã 6 số để bật 2FA.
              </p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Mã OTP</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
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
                className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                  isVerifying ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors flex items-center justify-center gap-2`}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Xác nhận OTP'
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseOtpModal}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}