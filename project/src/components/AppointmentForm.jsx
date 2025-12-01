import { useState, useEffect, useMemo } from 'react';
import { Send, Calendar, Clock, ChevronDown, Search, X, Check } from 'lucide-react';

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
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeError, setTimeError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(serviceSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  const fetchServices = async (keyword) => {
    const mockServices = [
      { serviceId: 1, name: 'Khám tổng quát', category: 'Khám bệnh', price: 200000 },
      { serviceId: 2, name: 'Xét nghiệm máu', category: 'Xét nghiệm', price: 150000 },
      { serviceId: 3, name: 'Chụp X-quang', category: 'Chẩn đoán hình ảnh', price: 300000 },
      { serviceId: 4, name: 'Siêu âm', category: 'Chẩn đoán hình ảnh', price: 250000 },
      { serviceId: 5, name: 'Khám tim mạch', category: 'Khám chuyên khoa', price: 350000 }
    ];
    
    const filtered = keyword 
      ? mockServices.filter(s => s.name.toLowerCase().includes(keyword.toLowerCase()))
      : mockServices;
    setServices(filtered);
  };

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

  useEffect(() => {
    if (!formData.date && minDate) {
      setFormData((prev) => ({ ...prev, date: minDate }));
    }
  }, [minDate]);

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
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
                Đặt lịch thành công!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Chúng tôi đã ghi nhận yêu cầu của bạn. Vui lòng kiểm tra email để biết thêm chi tiết.
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
                Có lỗi xảy ra!
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

      <div className="max-w-4xl mx-auto px-4">
        {/* HEADER - Đã sửa margin và padding */}
        <div className="text-center pt-8 pb-6 animate-[fadeInDown_0.6s_ease-out]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Đặt Lịch Khám Bệnh
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vui lòng điền thông tin để đặt lịch hẹn với bác sĩ
          </p>
        </div>

        {/* FORM CARD - Đã sửa padding */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 dark:border-gray-700/20 animate-[fadeInUp_0.6s_ease-out] mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME + PHONE */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm outline-none text-gray-900 dark:text-white ${
                    phoneError ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="0123456789"
                />
                {phoneError && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Địa chỉ Email <span className="text-red-500">*</span>
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
                  Ngày Mong Muốn <span className="text-red-500">*</span>
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
                  Giờ Mong Muốn <span className="text-red-500">*</span>
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
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {timeError}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Khung giờ làm việc: 8:00-12:00 và 14:00-18:00
                </p>
              </div>
            </div>

            {/* SYMPTOMS */}
            <div className="group">
              <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mô tả Triệu chứng (không bắt buộc)
              </label>
              <textarea
                id="symptoms"
                name="symptoms"
                rows={4}
                value={formData.symptoms}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 resize-none text-sm outline-none text-gray-900 dark:text-white"
                placeholder="Bạn có thể mô tả tình trạng sức khỏe của mình (tuỳ chọn)"
              />
            </div>

            {/* SERVICES DROPDOWN */}
            <div className="services-dropdown group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Chọn dịch vụ (tùy chọn)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-300 text-sm flex items-center justify-between hover:border-cyan-300 dark:hover:border-cyan-500 outline-none"
                >
                  <span className={formData.serviceIds.length === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white font-medium'}>
                    {formData.serviceIds.length === 0
                      ? 'Chọn dịch vụ khám...'
                      : `✓ Đã chọn ${formData.serviceIds.length} dịch vụ`}
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
                          placeholder="Tìm kiếm dịch vụ..."
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
                          {serviceSearch ? 'Không tìm thấy dịch vụ phù hợp' : 'Đang tải...'}
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
                                className="w-5 h-5 rounded border-2 border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">{svc.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">{svc.category}</span>
                                <span className="font-medium text-cyan-600">
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(svc.price)}
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
                  <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 mb-2">Dịch vụ đã chọn:</p>
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
                            className="ml-1 hover:text-cyan-900 hover:bg-cyan-100 rounded-full p-0.5 transition-colors"
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
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>GỬI YÊU CẦU ĐẶT LỊCH</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Chúng tôi sẽ xác nhận lịch khám trong vòng 30 phút
              </p>
            </div>
          </form>
        </div>

        {/* FOOTER INFO */}
        <div className="pb-8 text-center text-sm text-gray-600 dark:text-gray-300 animate-[fadeIn_0.8s_ease-out]">
          <p>Cần hỗ trợ? Liên hệ hotline: <span className="font-bold text-cyan-600">1900 1234</span></p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}