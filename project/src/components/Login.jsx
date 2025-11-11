import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      const { token, roles, userId, fullName, message } = response.data;

      console.log('Login response received:', response.data);

      // Kiểm tra nếu cần xác thực 2FA
      if (message && message.includes('2FA required')) {
        setError('Vui lòng kiểm tra email để lấy mã OTP xác thực 2FA.');
        setLoading(false);
        // Có thể điều hướng đến trang nhập OTP
        // navigate('/verify-2fa', { state: { email, userId } });
        return;
      }

      // Kiểm tra có token không
      if (!token) {
        setError('Đăng nhập thất bại! Không nhận được token.');
        setLoading(false);
        return;
      }

      // Lưu thông tin đăng nhập
      console.log('Saving to authService - token:', token.substring(0, 50) + '...');
      console.log('Saving to authService - roles:', roles);
      authService.login(token, { userId, email, fullName }, roles);

      // Verify saved
      console.log('After login - token in storage:', authService.getToken() ? 'YES' : 'NO');
      console.log('After login - roles in storage:', authService.getRoles());

      setSuccess('Đăng nhập thành công!');
      console.log('Login response:', response.data);
      console.log('User roles:', roles);

      // Điều hướng dựa trên role
      const defaultRoute = authService.getDefaultRoute();
      console.log('Redirecting to:', defaultRoute);
      
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại! Vui lòng kiểm tra email và mật khẩu.');

      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
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
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          
          <p className="mt-4 text-center text-sm">
            Quên mật khẩu?{' '}
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Nhấn vào đây
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;