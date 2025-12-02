// src/pages/VerifyOtp.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClinic } from '../contexts/ClinicContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import logo from '../images/logo.png';
import backgroundImage from '../images/background.png';

const VerifyOtp = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();
  const email = location.state?.email || '';

  const inputRefs = useRef([]);

  // Logo động
  const baseLogoUrl = clinicInfo?.logoUrl?.trim() || '';
  const cacheBuster = clinicInfo?.updatedAt
    ? new Date(clinicInfo.updatedAt).getTime()
    : Date.now();
  const clinicLogoUrl = baseLogoUrl ? `${baseLogoUrl}?v=${cacheBuster}` : '';
  const showDefaultLogo = !clinicLogoUrl;

  // Không có email → đẩy về forgot password
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

  // Focus ô đầu tiên khi load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(t('verifyOtp.invalidLength'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8082/api/auth/verify-otp', {
        email,
        otpCode,
      });

      setSuccess(t('verifyOtp.success'));
      setTimeout(() => {
        navigate('/reset-password', { state: { email }, replace: true });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        t('verifyOtp.invalidOrExpired')
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8082/api/auth/forgot-password', { email });
      setSuccess(t('verifyOtp.resent'));
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || t('verifyOtp.resendFailed'));
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

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl relative z-10 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <img
            key={clinicLogoUrl || 'default'}
            src={showDefaultLogo ? logo : clinicLogoUrl}
            alt={showDefaultLogo ? t('login.defaultLogo') : t('login.clinicLogo')}
            className="w-full max-w-[150px] h-auto object-contain"
            onError={(e) => (e.currentTarget.src = logo)}
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-teal-700 mb-2">
          {t('verifyOtp.title')}
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {t('verifyOtp.sentTo')} <span className="font-semibold text-teal-700">{email}</span>
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

        <form onSubmit={handleVerify}>
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
            {loading ? t('verifyOtp.verifying') : t('verifyOtp.verifyButton')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('verifyOtp.notReceived')}{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className={`font-semibold transition-colors ${
                resendLoading || countdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-teal-600 hover:text-teal-700 hover:underline'
              }`}
            >
              {resendLoading
                ? t('verifyOtp.sending')
                : countdown > 0
                ? `${t('verifyOtp.resendIn')} ${countdown}s`
                : t('verifyOtp.resend')}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('verifyOtp.backTo')}{' '}
          <a href="/login" className="text-teal-600 hover:underline font-medium">
            {t('verifyOtp.login')}
          </a>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;