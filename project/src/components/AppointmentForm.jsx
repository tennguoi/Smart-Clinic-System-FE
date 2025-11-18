import { useState } from 'react';
import { Send, Calendar, Clock } from 'lucide-react';
import axios from 'axios';

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    symptoms: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeError, setTimeError] = useState('');

  // Hàm kiểm tra thời gian hợp lệ
  const isValidTime = (time) => {
    if (!time) return true; // Cho phép trống khi chưa chọn
    
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    // Kiểm tra khoảng thời gian: 8:00-12:00 và 14:00-17:00
    const isMorning = totalMinutes >= 8 * 60 && totalMinutes <= 12 * 60;
    const isAfternoon = totalMinutes >= 14 * 60 && totalMinutes <= 17 * 60;
    
    return isMorning || isAfternoon;
  };

  const getTimeErrorMessage = () => {
    return 'Vui lòng chọn thời gian trong khung giờ: 8:00-12:00 hoặc 14:00-17:00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setTimeError('');

    // Kiểm tra thời gian trước khi gửi
    if (!isValidTime(formData.time)) {
      setTimeError(getTimeErrorMessage());
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
        notes: formData.symptoms
      };

      console.log('Sending appointment request:', payload);

      const response = await axios.post(
        'http://localhost:8082/api/public/appointments/quick-book',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Appointment created successfully:', response.data);

      setSubmitStatus('success');
      setIsSubmitting(false);

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        symptoms: ''
      });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      );
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error khi người dùng thay đổi thời gian
    if (name === 'time') {
      setTimeError('');
    }
  };

  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    
    setFormData({
      ...formData,
      time: timeValue
    });

    // Validate thời gian ngay khi chọn
    if (timeValue && !isValidTime(timeValue)) {
      setTimeError(getTimeErrorMessage());
    } else {
      setTimeError('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        ĐẶT LỊCH HẸN & MÔ TẢ TRIỆU CHỨNG
      </h3>

      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <p className="font-semibold text-green-900">Gửi thành công!</p>
            <p className="text-sm text-green-700">Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">✕</span>
          </div>
          <div>
            <p className="font-semibold text-red-900">Có lỗi xảy ra!</p>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
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
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="0123 456 789"
            />
          </div>
        </div>

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
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
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
                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                  timeError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {timeError && (
              <p className="mt-1 text-sm text-red-600">{timeError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Khung giờ làm việc: 8:00-12:00 và 14:00-17:00
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả Triệu chứng <span className="text-red-500">*</span>
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            required
            rows={3}
            value={formData.symptoms}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
            placeholder="Mô tả ngắn gọn về tình trạng sức khỏe của bạn..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || timeError}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2.5 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}