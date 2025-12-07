
// src/components/AppointmentForm.jsx
import { useState, useEffect, useMemo } from 'react';
import { Send, Calendar, Clock, ChevronDown, Search, X, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AppointmentForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // -------------------- STATE --------------------
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    symptoms: '',
    serviceIds: []
  });
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [timeError, setTimeError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

  // -------------------- DATE LIMITS --------------------
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    const max = new Date(today);
    max.setDate(today.getDate() + 3);
    return {
      minDate: min.toISOString().split('T')[0],
      maxDate: max.toISOString().split('T')[0]
    };
  }, []);

  // Default date = today
  useEffect(() => {
    if (!formData.date && minDate) {
      setFormData(prev => ({ ...prev, date: minDate }));
    }
  }, [minDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto redirect sau khi success
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => navigate('/'), 4000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus, navigate]);

  // -------------------- TIME VALIDATION --------------------
  // Hợp lệ nếu trong 08:00–12:00 hoặc 14:00–18:00
  const isValidTime = (time) => {
    if (!time) return true;
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m;
    const inMorning = total >= 480 && total <= 720;
    const inAfternoon = total >= 840 && total <= 1080;
    return inMorning || inAfternoon;
  };

  const fetchServices = async (keyword) => {
    try {
      const { serviceApi } = await import('../api/serviceApi');
      const data = await serviceApi.searchServices(keyword, null, 0, 50);
      setServices(data?.services ?? []);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  // Debounce tìm kiếm dịch vụ: gọi sau 300ms khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(serviceSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  // -------------------- FORM EVENTS --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setTimeError('');

    if (!isValidTime(formData.time)) {
      setTimeError(t('appointment.timeError'));
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone || formData.phone.length < 9) {
      setErrorMessage(t('appointment.phoneError'));
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        patientName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        appointmentTime: `${formData.date}T${formData.time}:00`,
        notes: formData.symptoms || '',
        serviceIds: formData.serviceIds
      };

      await axios.post(
        'http://localhost:8082/api/public/appointments/quick-book',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        date: minDate,
        time: '',
        symptoms: '',
        serviceIds: []
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
        error.message ??
        t('common.error')
      );
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10); // VN đa số 10 số
      setFormData(prev => ({ ...prev, phone: digits }));
      setPhoneError(digits.length > 10 ? t('appointment.phoneTooLong') : '');
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'time') setTimeError('');
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setFormData(prev => ({ ...prev, time }));
    setTimeError(time && !isValidTime(time) ? t('appointment.timeError') : '');
  };

  const toggleService = (id) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter(x => x !== id)
        : [...prev.serviceIds, id]
    }));
  };

  // Click ngoài để đóng dropdown
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.services-dropdown')) setIsServicesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // -------------------- RENDER --------------------
  return (
    <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* SUCCESS TOAST */}
      {submitStatus === 'success' && (
        <div className="fixed top-6 right-6 z-50 animate-[slideInRight_0.4s_ease-out]">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg animate-[scaleIn_0.3s_ease-out]">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {t('appointment.successTitle')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {t('appointment.successMessage')}
              </p>
            </div>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {submitStatus === 'error' && (
        <div className="fixed top-6 right-6 z-50 animate-[slideInRight_0.4s_ease-out]">
          <div className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <X className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {t('appointment.errorTitle')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[95%] mx-auto px-4">
        {/* HEADER */}
        <div className="text-center pt-8 pb-6 animate-[fadeInDown_0.6s_ease-out]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('appointment.formTitle')}
          </h1>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 dark:border-gray-700/20 animate-[fadeInUp_0.6s_ease-out] mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME + PHONE */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('appointment.fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white"
                  placeholder={t('appointment.fullNamePlaceholder')}
                />
              </div>

              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('appointment.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  inputMode="numeric"
                  pattern="\d{9,11}"
                  maxLength={11}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white ${
                    phoneError ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="0123456789"
                />
                {phoneError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('appointment.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white"
                placeholder="email@example.com"
              />
            </div>

            {/* DATE & TIME */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('appointment.date')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDate}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('appointment.time')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleTimeChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white ${
                      timeError ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                </div>
                {timeError && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {timeError}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('appointment.workingHoursHint')}
                </p>
              </div>
            </div>

            {/* SYMPTOMS */}
            <div className="group">
              <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('appointment.symptomsLabel')}
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 resize-none text-sm outline-none text-gray-900 dark:text-white"
                placeholder={t('appointment.symptomsPlaceholder')}
              />
            </div>

            {/* SERVICES DROPDOWN */}
            <div className="services-dropdown group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('appointment.servicesLabel')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm flex items-center justify-between hover:border-cyan-300 dark:hover:border-cyan-500 outline-none"
                >
                  <span className={formData.serviceIds.length === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white font-medium'}>
                    {formData.serviceIds.length === 0
                      ? t('appointment.selectServicePlaceholder')
                      : t('appointment.selectedServices', { count: formData.serviceIds.length })}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isServicesOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl overflow-hidden animate-[fadeInDown_0.3s_ease-out]">
                    {/* SEARCH */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t('appointment.searchPlaceholder')}
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* SERVICE LIST */}
                    <div className="max-h-64 overflow-y-auto">
                      {services.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-gray-500 dark:text-gray-400 text-center">
                          {serviceSearch ? t('appointment.noResults') : t('common.loading')}
                        </div>
                      ) : (
                        services.map((svc) => (
                          <label
                            key={svc.serviceId}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/20 dark:hover:to-blue-900/20 cursor-pointer text-sm transition-all duration-200 border-b border-gray-50 dark:border-gray-700 last:border-0"
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={formData.serviceIds.includes(svc.serviceId)}
                                onChange={() => toggleService(svc.serviceId)}
                                className="w-5 h-5 rounded border-2 border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer dark:border-gray-500"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">{svc.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{svc.category}</span>
                                <span className="font-medium text-cyan-600 dark:text-cyan-400">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(svc.price)}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {formData.serviceIds.length > 0 && (
                <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-800 animate-[fadeIn_0.3s_ease-out]">
                  <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
                    {t('appointment.selectedLabel')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {services
                      .filter((svc) => formData.serviceIds.includes(svc.serviceId))
                      .map((svc) => (
                        <span
                          key={svc.serviceId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-700 border border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Check className="w-3 h-3" />
                          {svc.name}
                          <button
                            type="button"
                            onClick={() => toggleService(svc.serviceId)}
                            className="ml-1 hover:text-cyan-900 dark:hover:text-cyan-100 hover:bg-cyan-100 dark:hover:bg-cyan-800 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !!timeError || !!phoneError}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 rounded-xl transition-all duration-300 font-bold text-base flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('appointment.submitting')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t('appointment.submitButton')}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {t('appointment.confirmationNote')}
              </p>
            </div>
          </form>
        </div>

        {/* FOOTER INFO */}
        <div className="pb-8 text-center text-sm text-gray-600 dark:text-gray-300 animate-[fadeIn_0.8s_ease-out]">
          <p>{t('appointment.helpText')}: <span className="font-bold text-cyan-600 dark:text-cyan-400">1900 1234</span></p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes fadeInDown {
          from { transform: translateY(-20px); opacity: 0; }
          to   { transform: translateY(0);      opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
