import { useState } from 'react';
import { Send, Calendar, Clock } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    await new Promise(resolve => setTimeout(resolve, 1500));

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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-teal-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            placeholder="0123 456 789"
          />
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            placeholder="email@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày Mong Muốn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Giờ Mong Muốn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="time"
                id="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
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
            rows={4}
            value={formData.symptoms}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
            placeholder="Mô tả ngắn gọn về tình trạng sức khỏe của bạn..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg transition-colors font-semibold text-base flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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