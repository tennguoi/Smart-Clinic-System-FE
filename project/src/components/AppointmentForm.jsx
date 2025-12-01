import { useState, useEffect, useMemo } from 'react';
import { Send, Calendar, Clock, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AppointmentForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchServices(serviceSearch), 300);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  const fetchServices = async (keyword) => {
    try {
      const { serviceApi } = await import('../api/serviceApi');
      const data = await serviceApi.searchServices(keyword, null, 0, 50);
      setServices(data?.services ?? []);
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  const isValidTime = (time) => {
    if (!time) return true;
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m;
    return (total >= 480 && total <= 720) || (total >= 840 && total <= 1080);
  };

  // Default date = today
  useEffect(() => {
    if (!formData.date && minDate) {
      setFormData(prev => ({ ...prev, date: minDate }));
    }
  }, [minDate]);

  // Auto redirect after success
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => navigate('/'), 4000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus, navigate]);

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
        fullName: '', phone: '', email: '', date: minDate, time: '', symptoms: '', serviceIds: []
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
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
      const digits = value.replace(/\D/g, '').slice(0, 10);
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

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.services-dropdown')) setIsServicesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative">

      {/* SUCCESS TOAST – GIỮ NGUYÊN ICON CŨ */}
      {submitStatus === 'success' && (
        <div className="fixed top-28 right-6 z-50 bg-green-50 border border-green-300 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl leading-none">✓</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900 text-base">
              {t('appointment.successTitle')}
            </p>
            <p className="text-sm text-green-800 mt-1">
              {t('appointment.successMessage')}
            </p>
          </div>
        </div>
      )}

      {/* ERROR TOAST – GIỮ NGUYÊN ICON CŨ */}
      {submitStatus === 'error' && (
        <div className="fixed top-28 right-6 z-50 bg-red-50 border border-red-300 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl leading-none">✕</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-900 text-base">
              {t('appointment.errorTitle')}
            </p>
            <p className="text-sm text-red-800 mt-1">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {t('appointment.formTitle')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointment.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder={t('appointment.fullNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointment.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel" required name="phone" value={formData.phone} onChange={handleChange}
                placeholder="0123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
              />
              {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('appointment.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email" required name="email" value={formData.email} onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointment.date')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date" required name="date" value={formData.date} onChange={handleChange}
                  min={minDate} max={maxDate}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointment.time')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="time" required name="time" value={formData.time} onChange={handleTimeChange}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm ${timeError ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {timeError && <p className="mt-1 text-sm text-red-600">{timeError}</p>}
              <p className="mt-1 text-xs text-gray-500">{t('appointment.workingHoursHint')}</p>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('appointment.symptomsLabel')}
            </label>
            <textarea
              name="symptoms" rows={3} value={formData.symptoms} onChange={handleChange}
              placeholder={t('appointment.symptomsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
            />
          </div>

          {/* Services Dropdown */}
          <div className="services-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('appointment.servicesLabel')}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm flex items-center justify-between bg-white"
              >
                <span>
                  {formData.serviceIds.length === 0
                    ? t('appointment.selectServicePlaceholder')
                    : t('appointment.selectedServices', { count: formData.serviceIds.length })}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isServicesOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('appointment.searchPlaceholder')}
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-cyan-500 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {services.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        {serviceSearch ? t('appointment.noResults') : t('common.loading')}
                      </div>
                    ) : (
                      services.map(svc => (
                        <label key={svc.serviceId} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(svc.serviceId)}
                            onChange={() => toggleService(svc.serviceId)}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{svc.name}</div>
                            <div className="text-xs text-gray-500">
                              {svc.category} • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(svc.price)}
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
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">{t('appointment.selectedLabel')}</p>
                <div className="flex flex-wrap gap-1">
                  {services
                    .filter(s => formData.serviceIds.includes(s.serviceId))
                    .map(s => (
                      <span key={s.serviceId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                        {s.name}
                        <button type="button" onClick={() => toggleService(s.serviceId)} className="ml-1 hover:text-cyan-900">×</button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !!timeError || !!phoneError}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('appointment.submitting')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('appointment.submitButton')}</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            {t('appointment.confirmationNote')}
          </p>
        </form>
      </div>
    </div>
  );
}