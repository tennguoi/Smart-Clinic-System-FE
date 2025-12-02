import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ← Thêm
import { authService } from '../services/authService';
import { useClinic } from '../contexts/ClinicContext';
import LanguageSwitcher from '../components/LanguageSwitcher'; // ← Thêm
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const Login = () => {
  const { t } = useTranslation(); // ← Hook i18n
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinicInfo } = useClinic();

  const baseLogoUrl = clinicInfo?.logoUrl?.trim() || '';
  const cacheBuster = clinicInfo?.updatedAt
    ? new Date(clinicInfo.updatedAt).getTime()
    : Date.now();
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

      // Xác thực 2FA
      if (requires2FA === true) {
        setSuccess(t('login.otpSent')); // ← Dùng i18n
        setTimeout(() => {
          navigate('/verify-2fa', { state: { email } });
        }, 1000);
        return;
      }

      // Đăng nhập bình thường
      if (!token) {
        setError(t('login.noToken'));
        setLoading(false);
        return;
      }

      authService.login(token, { userId, email, fullName }, roles);
      setSuccess(t('login.success'));

      const defaultRoute = authService.getDefaultRoute();
      setTimeout(() => {
        navigate(defaultRoute, { replace: true });
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || t('login.failed')
      );
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
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/70 to-blue-100/70 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-teal-300 rounded-full opacity-30 blur-3xl animate-ping top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse bottom-10 right-10"></div>

      {/* Language Switcher - góc trên bên phải */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            key={clinicLogoUrl || 'default'}
            src={showDefaultLogo ? logo : clinicLogoUrl}
            alt={showDefaultLogo ? t('login.defaultLogo') : t('login.clinicLogo')}
            className="w-full max-w-[150px] h-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = logo;
            }}
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-6">
          {t('login.title')} {/* Đăng nhập phòng khám */}
        </h2>

        {/* Thông báo */}
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
              {t('login.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder={t('login.emailPlaceholder')}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('login.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-transform duration-300 
              ${loading ? 'opacity-70 cursor-not-allowed' : '1hover:bg-teal-700 hover:scale-105'}`}
          >
            {loading ? t('login.loggingIn') : t('login.loginButton')}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            {t('login.forgotPassword')}{' '}
            <a href="/forgot-password" className="text-teal-600 hover:underline">
              {t('login.clickHere')}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;