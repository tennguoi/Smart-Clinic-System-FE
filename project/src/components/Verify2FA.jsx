import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const Verify2FA = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setError(message || 'Xác thực OTP thất bại!');
        setLoading(false);
        return;
      }

      // Lấy thông tin user sau khi verify thành công
      const userResponse = await axios.get('http://localhost:8082/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { userId, fullName, roles } = userResponse.data;

      // Lưu vào authService
      authService.login(token, { userId, email, fullName }, roles);

      setSuccess('Xác thực 2FA thành công!');

      // Chuyển hướng đến trang chính
      const defaultRoute = authService.getDefaultRoute();
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 800);

    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.message || 'Xác thực OTP thất bại!');
    } finally {
      setLoading(false);
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
          Xác thực 2FA
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Vui lòng nhập mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">
              Mã OTP
            </label>
            <input
              type="text"
              id="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập mã 6 số"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-transform duration-300 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105'}`}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Quay lại{' '}
            <a href="/login" className="text-teal-600 hover:underline">
              Trang đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Verify2FA;