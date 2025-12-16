import React, { useState, useEffect, useRef } from 'react'; // ← Thêm useEffect, useRef
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const Verify2FA = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // ← Thay đổi từ otpCode string thành mảng
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // ← Thêm countdown (nếu cần resend OTP)
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const inputRefs = useRef([]); // ← Thêm useRef cho các ô input

  // Focus ô đầu tiên khi load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown 60s (nếu có chức năng resend)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động nhảy ô
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pasted.padEnd(6, '').slice(0, 6).split('');
    setOtp(newOtp);
    inputRefs.current[pasted.length < 6 ? pasted.length : 5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join(''); // ← Chuyển mảng thành string

    if (otpCode.length !== 6) {
      setError(t('verify2fa.invalidLength') || 'Mã OTP phải có 6 chữ số'); // ← Thêm key này vào file dịch
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Gọi API verify-2fa (khác với verify-otp của forgot password)
      const response = await axios.post('http://localhost:8082/api/auth/verify-2fa', {
        email,
        otpCode,
      });

      const { token, message } = response.data;

      if (!response.data.success) {
        setError(message || t('verify2fa.error'));
        setLoading(false);
        return;
      }

      // Lấy thông tin user sau khi verify thành công
      const userResponse = await axios.get('http://localhost:8082/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { userId, fullName, roles, twoFactorEnabled } = userResponse.data;

      // Lưu vào authService
      authService.login(token, { userId, email, fullName, twoFactorEnabled }, roles);

      setSuccess(t('verify2fa.success'));

      // Chuyển hướng đến trang chính
      const defaultRoute = authService.getDefaultRoute();
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 800);

    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.message || t('verify2fa.error'));

      // Reset OTP khi có lỗi
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Hàm resend OTP (nếu cần)
  const handleResend = async () => {
    if (countdown > 0) return;

    // Reset countdown và OTP
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
    inputRefs.current[0]?.focus();

    // Gửi request resend ở đây nếu backend hỗ trợ
    // try {
    //   await axios.post('http://localhost:8082/api/auth/resend-2fa', { email });
    //   setSuccess(t('verify2fa.resent'));
    // } catch (err) {
    //   setError(t('verify2fa.resendFailed'));
    // }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/70 to-blue-100/70 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-teal-300 rounded-full opacity-30 blur-3xl animate-ping top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse bottom-10 right-10"></div>

      {/* Language Switcher - góc trên bên phải */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-full max-w-[150px] h-auto object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-2">
          {t('verify2fa.title')}
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          {t('verify2fa.description')}
          <strong className="text-teal-700 ml-1">{email}</strong>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-5 text-sm text-center animate-shake">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg mb-5 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 6 ô nhập OTP */}
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-14 h-14 text-2xl font-bold text-center border-2 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-200 transition-all"
                maxLength="1"
                inputMode="numeric"
                disabled={loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-300 
              ${loading || otp.join('').length !== 6
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 shadow-lg'
              }`}
          >
            {loading ? t('verify2fa.verifying') : t('verify2fa.verify')}
          </button>
        </form>

        {/* Nút Resend (tùy chọn) */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('verify2fa.notReceived') || 'Không nhận được mã?'}{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className={`font-semibold transition-colors ${countdown > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-teal-600 hover:text-teal-700 hover:underline'
                }`}
            >
              {countdown > 0
                ? `${t('verify2fa.resendIn') || 'Gửi lại sau'} ${countdown}s`
                : t('verify2fa.resend') || 'Gửi lại mã'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('verify2fa.backTo')}{' '}
          <a href="/login" className="text-teal-600 hover:underline font-medium">
            {t('verify2fa.loginPage')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Verify2FA;