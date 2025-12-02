import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClinic } from '../contexts/ClinicContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clinicInfo } = useClinic();

  // Logo động giống Login & ResetPassword
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
      const response = await axios.post('http://localhost:8082/api/auth/forgot-password', { email });
      
      setSuccess(response.data.message || t('forgotPassword.otpSent'));
      
      // Chuyển sang trang nhập OTP sau 1.5s
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { email, from: 'forgot-password' } 
        });
      }, 1500);

    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg || t('forgotPassword.failed')
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

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        {/* Logo động */}
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
          {t('forgotPassword.title')}
        </h2>

        <p className="text-center text-gray-600 text-sm mb-6">
          {t('forgotPassword.description')}
        </p>

        {/* Thông báo */}
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('forgotPassword.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              placeholder={t('forgotPassword.emailPlaceholder')}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-teal-600 text-white p-3 rounded-lg font-semibold transition-all duration-300 
              ${loading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-teal-700 hover:scale-105 shadow-lg'
              }`}
          >
            {loading ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('forgotPassword.backTo')}{' '}
          <a href="/login" className="text-teal-600 hover:underline font-medium">
            {t('forgotPassword.login')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;