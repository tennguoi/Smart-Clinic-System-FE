import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
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
      if (!email) {
        setError(t('resetPassword.noEmail'));
        setLoading(false);
        return;
      }

      // Validation: Check if password has at least 6 characters
      if (newPassword.length < 6) {
        setError(t('resetPassword.passwordTooShort'));
        setLoading(false);
        return;
      }

      await axios.post('http://localhost:8082/api/auth/reset-password', {
        email,
        newPassword,
      });

      setSuccess(t('resetPassword.success'));
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('resetPassword.failed'));
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

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-full max-w-[150px] h-auto object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          {t('resetPassword.title')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded mb-4 text-sm text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              {t('resetPassword.newPassword')}
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder={t('resetPassword.placeholder')}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('resetPassword.passwordRequirement')} {/* Thêm key này vào file dịch */}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 6} // Disable nếu mật khẩu < 6 ký tự
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-all duration-300 
              ${loading || newPassword.length < 6 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:scale-105 shadow-lg'}`}
          >
            {loading ? t('resetPassword.updating') : t('resetPassword.updateButton')}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('resetPassword.backTo')}{' '}
            <a href="/login" className="text-teal-600 hover:underline font-medium">
              {t('resetPassword.login')}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;