import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
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
      const response = await axios.post('http://localhost:8082/api/auth/forgot-password', { email });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi OTP thất bại!');
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
          <img src={logo} alt="Logo" className="w-full max-w-[150px] h-auto object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          Quên mật khẩu
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-transform duration-300 
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105'}`}
          >
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Quay lại{' '}
            <a href="/login" className="text-teal-600 hover:underline">
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;