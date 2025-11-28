import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, User, Phone, Mail, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import { queueApi } from '../../api/receptionApi';

export default function AppointmentCheckInSection({ onOpenPatientForm }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // ✅ Kiểm tra token khi component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Debug Info:');
    console.log('- Token exists:', !!token);
    console.log('- Token preview:', token ? token.substring(0, 30) + '...' : 'NONE');
    console.log('- User info:', user);
    console.log('- Current URL:', window.location.href);
    
    setDebugInfo({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : null,
      userInfo: user ? JSON.parse(user) : null
    });

    if (!token) {
      toast.error('⚠️ Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại!');
    }
  }, []);

  // Fetch danh sách lịch hẹn hôm nay
  const fetchTodayAppointments = async () => {
    setLoading(true);
    
    try {
      console.log('📡 Fetching appointments from API...');
      const data = await queueApi.getTodayAppointments();
      
      console.log('✅ API Response:', data);
      console.log('- Type:', typeof data);
      console.log('- Is Array:', Array.isArray(data));
      console.log('- Length:', data?.length);
      
      setAppointments(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        toast.info('ℹ️ Không có lịch hẹn nào trong ngày hôm nay');
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      console.error('- Error type:', error.constructor.name);
      console.error('- Error message:', error.message);
      console.error('- Response status:', error.response?.status);
      console.error('- Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Không thể tải danh sách lịch hẹn';
      
      toast.error(`❌ ${errorMessage}`);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    
    // Auto refresh every 2 minutes
    const interval = setInterval(fetchTodayAppointments, 120000);
    return () => clearInterval(interval);
  }, []);

  // Mở form thêm bệnh nhân với thông tin từ appointment
const handleAddPatientFromAppointment = async (appointment) => {
  if (onOpenPatientForm) {
    onOpenPatientForm({
      ...appointment,
      isFromAppointment: true,
      priority: 'Urgent' // Tự động ưu tiên cho người đặt lịch
    });
  }
};
  const formatTime = (dateTime) => {
    if (!dateTime) return '—';
    return new Date(dateTime).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isUpcoming = (appointmentTime) => {
    const now = new Date();
    const apptTime = new Date(appointmentTime);
    const diffMinutes = (apptTime - now) / 60000;
    return diffMinutes > 0 && diffMinutes <= 30;
  };

  const isPast = (appointmentTime) => {
    return new Date(appointmentTime) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Debug Panel */}
      {debugInfo && !debugInfo.hasToken && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-bold text-red-900">⚠️ Không tìm thấy token đăng nhập!</p>
              <p className="text-sm text-red-700 mt-1">Vui lòng đăng nhập lại để sử dụng tính năng này.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Lịch hẹn hôm nay
            </h1>
            <p className="text-gray-600 mt-2">Thêm bệnh nhân từ danh sách đặt lịch</p>
          </div>
          <button
            onClick={fetchTodayAppointments}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng lịch hẹn</p>
              <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã thêm vào hàng chờ</p>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.filter(a => a.hasCheckedIn).length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Chưa thêm</p>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.filter(a => !a.hasCheckedIn).length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-20 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-20 text-center">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-medium mb-2">Không có lịch hẹn nào hôm nay</p>
            <p className="text-sm text-gray-400">
              {debugInfo?.hasToken 
                ? 'Không có lịch hẹn đã xác nhận trong ngày hôm nay' 
                : 'Vui lòng đăng nhập để xem danh sách'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.appointmentId}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  appointment.hasCheckedIn
                    ? 'border-green-200 bg-green-50'
                    : isUpcoming(appointment.appointmentTime)
                    ? 'border-amber-300 bg-amber-50'
                    : isPast(appointment.appointmentTime)
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left: Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{appointment.patientName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-mono font-semibold">
                              {appointment.appointmentCode}
                            </span>
                            {appointment.hasCheckedIn && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Đã thêm vào hàng chờ
                              </span>
                            )}
                            {!appointment.hasCheckedIn && isUpcoming(appointment.appointmentTime) && (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold flex items-center gap-1 animate-pulse">
                                <Clock className="w-4 h-4" />
                                Sắp tới
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{appointment.phone}</span>
                        </div>
                        {appointment.email && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-sm">{appointment.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold">{formatTime(appointment.appointmentTime)}</span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Ghi chú:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Action Button */}
                    <div className="ml-6">
                      {!appointment.hasCheckedIn ? (
                        <button
                          onClick={() => handleAddPatientFromAppointment(appointment)}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg flex items-center gap-3"
                        >
                          <User className="w-6 h-6" />
                          Thêm bệnh nhân
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-green-600">
                          <CheckCircle className="w-12 h-12" />
                          <span className="font-semibold text-sm">Đã thêm vào hàng chờ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning for past appointments */}
                  {!appointment.hasCheckedIn && isPast(appointment.appointmentTime) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">
                        Lịch hẹn đã quá giờ - Vui lòng xác nhận với bệnh nhân
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}