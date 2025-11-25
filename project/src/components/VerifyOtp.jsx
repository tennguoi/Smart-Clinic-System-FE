import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const VerifyOtp = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Nếu không có email → về trang quên mật khẩu
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Countdown 60s
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // XÁC THỰC OTP – PHIÊN BẢN CUỐI CÙNG, HOÀN HẢO
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8082/api/auth/verify-otp', {
        email,
        otpCode: otpCode.trim(),
      });

      // Chỉ đến đây khi OTP ĐÚNG
      setSuccess('Xác thực thành công! Đang chuyển hướng...');

      setTimeout(() => {
        navigate('/reset-password', { state: { email }, replace: true });
      }, 1200);

    } catch (err) {
      // TẤT CẢ lỗi (400, 500, OTP sai, hết hạn...) đều vào đây → KHÔNG NHẢY TRANG
      const message = err.response?.data?.message 
        || err.response?.data?.error 
        || 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';

      setError(message);
      setOtpCode(''); // Xóa ô nhập để người dùng nhập lại
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8082/api/auth/forgot-password', { email });
      setSuccess('Đã gửi lại mã OTP mới đến email của bạn');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi lại thất bại, vui lòng thử lại');
    } finally {
      setResendLoading(false);
    }
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

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-full max-w-[150px] h-auto object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-2">
          Xác thực OTP
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Mã đã được gửi đến <span className="font-semibold">{email}</span>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm text-center animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-6">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-2xl tracking-widest font-mono"
              placeholder="------"
              maxLength="6"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
              loading || otpCode.length !== 6
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'
            }`}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa nhận được mã?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || countdown > 0}
              className={`font-medium ${
                resendLoading || countdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-teal-600 hover:underline'
              }`}
            >
              {resendLoading ? 'Đang gửi...' : countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Quay lại{' '}
          <a href="/login" className="text-teal-600 hover:underline font-medium">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;