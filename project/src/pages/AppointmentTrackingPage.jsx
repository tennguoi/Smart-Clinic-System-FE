import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

export default function AppointmentTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setError('Mã lịch hẹn không hợp lệ');
      setLoading(false);
      return;
    }

    fetchAppointment();
  }, [code]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8082/api/public/appointments/track/${code}`
      );
      setAppointment(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching appointment:', err);
      setError(
        err.response?.data?.message || 
        'Không tìm thấy lịch hẹn. Vui lòng kiểm tra lại mã.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận', icon: Clock },
      'Confirmed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xác nhận', icon: CheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy', icon: XCircle },
      'Completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Hoàn thành', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.text} font-semibold`}>
        <Icon className="w-5 h-5" />
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Chưa xác định';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Đang tải thông tin lịch hẹn...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Không tìm thấy lịch hẹn</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Thông Tin Lịch Hẹn</h1>
          <p className="text-gray-600 dark:text-gray-300">Theo dõi trạng thái và chi tiết lịch khám của bạn</p>
        </div>

        {/* Appointment Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-700 dark:to-teal-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm mb-1">Mã lịch hẹn</p>
                <p className="text-3xl font-bold">{appointment.appointmentCode}</p>
              </div>
              {getStatusBadge(appointment.status)}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thời gian khám</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDateTime(appointment.appointmentTime)}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bệnh nhân</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.patientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Số điện thoại</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.phone}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            {appointment.email && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.email}</p>
                </div>
              </div>
            )}

            {/* Services */}
            {appointment.services && appointment.services.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">Dịch vụ đăng ký</p>
                <div className="space-y-2">
                  {appointment.services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ghi chú</p>
                  <p className="text-gray-900 dark:text-white">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* Confirmed By */}
            {appointment.confirmedBy && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Được xác nhận bởi</p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100">{appointment.confirmedBy}</p>
                {appointment.confirmedAt && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Vào {formatDateTime(appointment.confirmedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-semibold transition-colors"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => navigate('/appointment')}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Đặt lịch mới
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <p className="text-blue-900 dark:text-blue-100 text-sm">
            <strong>Lưu ý:</strong> Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với phòng khám qua số hotline hoặc email được gửi khi đặt lịch.
          </p>
        </div>
      </div>
    </div>
  );
}
