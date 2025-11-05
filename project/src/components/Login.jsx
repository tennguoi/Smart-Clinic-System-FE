import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8082/api/auth/login', {
        email,
        password,
      }, { timeout: 5000 });
      
      const { data } = response;
      console.log('Full login response:', data);
      
      // Kiểm tra nếu có token => đăng nhập thành công
      if (data.token) {
        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          roles: data.roles || [],
        }));
        
        setSuccess('Đăng nhập thành công!');
        setError('');
        
        // Chuyển hướng đến /admin ngay lập tức
        setTimeout(() => navigate('/admin', { replace: true }), 500);
      } 
      // Nếu message chứa "2FA required" => cần xác thực 2FA
      else if (data.message && data.message.includes('2FA required')) {
        setError('Vui lòng xác thực OTP đã được gửi đến email của bạn.');
        setSuccess('');
        // Có thể chuyển hướng đến trang verify 2FA
        // setTimeout(() => navigate('/verify-2fa', { state: { email } }), 1500);
      } 
      // Trường hợp khác
      else {
        setError(data.message || 'Đăng nhập thất bại! Dữ liệu không hợp lệ.');
        setSuccess('');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.response || err);
      
      // Xử lý lỗi chi tiết hơn
      if (err.response) {
        // Server trả về response với status code lỗi
        const errorMessage = err.response.data?.message || 'Đăng nhập thất bại!';
        setError(errorMessage);
      } else if (err.request) {
        // Request đã được gửi nhưng không nhận được response
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi khác
        setError('Đã xảy ra lỗi: ' + err.message);
      }
      setSuccess('');
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
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Đăng nhập
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