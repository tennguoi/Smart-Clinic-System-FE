import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useClinic } from '../contexts/ClinicContext';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinicInfo } = useClinic();
  
  const baseLogoUrl = clinicInfo?.logoUrl?.trim() || '';
  const cacheBuster = clinicInfo?.updatedAt ? new Date(clinicInfo.updatedAt).getTime() : Date.now();
  const clinicLogoUrl = baseLogoUrl ? `${baseLogoUrl}?v=${cacheBuster}` : '';
  const showDefaultLogo = !clinicLogoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:8082/api/auth/login', {
        email,
        password,
      });

      const { token, roles, userId, fullName, message, requires2FA } = response.data;

      // ✅ Kiểm tra nếu cần xác thực 2FA
      if (requires2FA === true) {
        setSuccess('OTP đã được gửi đến email của bạn!');
        setTimeout(() => {
          // Chuyển đến trang verify 2FA (không phải verify-otp)
          navigate('/verify-2fa', { state: { email } });
        }, 1000);
        return;
      }

      // ✅ Đăng nhập bình thường (không có 2FA)
      if (!token) {
        setError('Đăng nhập thất bại! Không nhận được token.');
        setLoading(false);
        return;
      }

      authService.login(token, { userId, email, fullName }, roles);
      setSuccess('Đăng nhập thành công!');

      const defaultRoute = authService.getDefaultRoute();
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 800);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng kiểm tra email và mật khẩu.');
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

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <img 
            key={clinicLogoUrl || 'default'}
            src={showDefaultLogo ? logo : clinicLogoUrl} 
            alt={showDefaultLogo ? "Logo" : "Logo phòng khám"} 
            className="w-full max-w-[150px] h-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = logo;
            }}
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Đăng nhập phòng khám
          </h2>

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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-transform duration-300 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105'}`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Quên mật khẩu?{' '}
            <a href="/forgot-password" className="text-teal-600 hover:underline">
              Nhấn vào đây
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;