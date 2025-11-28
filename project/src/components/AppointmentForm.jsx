import { useState, useEffect, useMemo } from 'react';
import { Send, Calendar, Clock, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AppointmentForm() {
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

  const navigate = useNavigate();

  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const min = new Date(today);
    min.setDate(today.getDate());
    const max = new Date(today);
    max.setDate(today.getDate() + 3);
    return {
      minDate: min.toISOString().split('T')[0],
      maxDate: max.toISOString().split('T')[0]
    };
  }, []);

  // Debounce search services
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(serviceSearch);
    }, 300);

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

  // Validate time (08:00–12:00 | 14:00–18:00)
  const isValidTime = (time) => {
    if (!time) return true;
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const isMorning = totalMinutes >= 8 * 60 && totalMinutes <= 12 * 60;
    const isAfternoon = totalMinutes >= 14 * 60 && totalMinutes <= 18 * 60;
    return isMorning || isAfternoon;
  };

  const getTimeErrorMessage = () => {
    return 'Vui lòng chọn thời gian trong khung giờ: 8:00-12:00 hoặc 14:00-18:00';
  };

  // Default date = minDate (ISO format for date picker)
  useEffect(() => {
    if (!formData.date && minDate) {
      setFormData((prev) => ({ ...prev, date: minDate }));
    }
  }, [minDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Khi thành công: hiện toast, 4s sau tự về Home
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        navigate('/');
        setSubmitStatus('idle');
      }, 4000);
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
      setTimeError(getTimeErrorMessage());
      setIsSubmitting(false);
      return;
    }

    if (phoneError || !formData.phone || formData.phone.length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (9–11 chữ số).');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const appointmentDateTime = `${formData.date}T${formData.time}:00`;
      const payload = {
        patientName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        appointmentTime: appointmentDateTime,
        notes: formData.symptoms || '',
        serviceIds: formData.serviceIds
      };

      const response = await axios.post(
        'http://localhost:8082/api/public/appointments/quick-book',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Appointment created:', response.data);

      setSubmitStatus('success');
      setIsSubmitting(false);

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
      console.error('Error creating appointment:', error);
      setErrorMessage(
        error.response?.data?.message ??
        error.message ??
        'Có lỗi xảy ra. Vui lòng thử lại.'
      );
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      const capped = digitsOnly.slice(0, 10);

      let pErr = '';
      if (digitsOnly.length > 10) pErr = 'Số điện thoại tối đa 10 chữ số.';

      setFormData({ ...formData, phone: capped });
      setPhoneError(pErr);
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'time') setTimeError('');
  };

  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    setFormData({ ...formData, time: timeValue });
    if (timeValue && !isValidTime(timeValue)) {
      setTimeError(getTimeErrorMessage());
    } else {
      setTimeError('');
    }
  };

  const toggleService = (serviceId) => {
    setFormData((prev) => {
      const newServiceIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newServiceIds };
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.services-dropdown')) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">

      {/* SUCCESS TOAST - TOP RIGHT, TO HƠN, THẤP XUỐNG HƠN */}
      {submitStatus === 'success' && (
        <div className="fixed top-28 right-6 z-50 bg-green-50 border border-green-300 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl leading-none">✓</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-green-900 text-base">
              Đặt lịch thành công!
            </p>
            <p className="text-sm text-green-800 mt-1">
              Chúng tôi đã ghi nhận yêu cầu của bạn. Bạn sẽ được chuyển về trang chủ trong giây lát...
            </p>
          </div>
        </div>
      )}

      {/* ERROR TOAST - TOP RIGHT, TO HƠN, THẤP XUỐNG HƠN */}
      {submitStatus === 'error' && (
        <div className="fixed top-28 right-6 z-50 bg-red-50 border border-red-300 rounded-xl px-6 py-4 shadow-2xl flex items-start space-x-4 max-w-md">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl leading-none">✕</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-900 text-base">
              Có lỗi xảy ra!
            </p>
            <p className="text-sm text-red-800 mt-1">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          ĐẶT LỊCH HẸN & MÔ TẢ TRIỆU CHỨNG
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME + PHONE */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số Điện Thoại <span className="text-red-500">*</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                placeholder="0123456789"
              />
              {phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="email@example.com"
            />
          </div>

          {/* DATE & TIME */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày Mong Muốn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Giờ Mong Muốn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleTimeChange}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm ${
                    timeError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {timeError && (
                <p className="mt-1 text-sm text-red-600">{timeError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Khung giờ làm việc: 8:00-12:00 và 14:00-18:00
              </p>
            </div>
          </div>

          {/* SYMPTOMS - OPTIONAL */}
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả Triệu chứng (không bắt buộc)
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              value={formData.symptoms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
              placeholder="Bạn có thể mô tả tình trạng (tuỳ chọn)"
            />
          </div>

          {/* SERVICES DROPDOWN */}
          <div className="services-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn dịch vụ (tùy chọn)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm flex items-center justify-between bg-white"
              >
                <span>
                  {formData.serviceIds.length === 0
                    ? 'Chọn dịch vụ...'
                    : `Đã chọn ${formData.serviceIds.length} dịch vụ`}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isServicesOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">

                  {/* SEARCH */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm dịch vụ..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-transparent text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* SERVICE LIST */}
                  <div className="max-h-48 overflow-y-auto">
                    {services.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        {serviceSearch ? 'Không tìm thấy dịch vụ phù hợp' : 'Đang tải...'}
                      </div>
                    ) : (
                      services.map((svc) => (
                        <label
                          key={svc.serviceId}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(svc.serviceId)}
                            onChange={() => toggleService(svc.serviceId)}
                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{svc.name}</div>
                            <div className="text-xs text-gray-500">
                              {svc.category} •{' '}
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(svc.price)}
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
                <p className="text-xs text-gray-600 mb-1">Dịch vụ đã chọn:</p>
                <div className="flex flex-wrap gap-1">
                  {services
                    .filter((svc) => formData.serviceIds.includes(svc.serviceId))
                    .map((svc) => (
                      <span
                        key={svc.serviceId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800"
                      >
                        {svc.name}
                        <button
                          type="button"
                          onClick={() => toggleService(svc.serviceId)}
                          className="ml-1 hover:text-cyan-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || !!timeError || !!phoneError}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>GỬI YÊU CẦU ĐẶT LỊCH</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Chúng tôi sẽ xác nhận lịch khám trong vòng 30 phút
          </p>
        </form>
      </div>
    </div>
  );
}
