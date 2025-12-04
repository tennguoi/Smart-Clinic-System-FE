import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, User, Phone, Mail, AlertCircle, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import PatientForm from './PatientForm';
import { queueApi } from '../../api/receptionApi';

const emptyPatientForm = {
  patientName: '',
  phone: '',
  email: '',
  dob: '',
  gender: 'male',
  address: '',
  priority: 'Urgent',
  idNumber: '',
  insuranceNumber: '',
  notes: '',
  dobDate: null,
};

export default function AppointmentCheckInSection({ onOpenPatientForm }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // ✅ State quản lý form
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ✅ State quản lý tìm kiếm
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

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

  // ✅ Filter appointments khi search thay đổi
  useEffect(() => {
    if (!searchName && !searchPhone) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter(apt => {
      const matchName = !searchName || 
        apt.patientName.toLowerCase().includes(searchName.toLowerCase());
      const matchPhone = !searchPhone || 
        apt.phone.includes(searchPhone);
      
      return matchName && matchPhone;
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchName, searchPhone]);

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

  // ✅ Clear filters
  const handleClearFilters = () => {
    setSearchName('');
    setSearchPhone('');
  };

  // ✅ Mở form và điền thông tin từ appointment
  const handleAddPatientFromAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setPatientForm({
      patientName: appointment.patientName || '',
      phone: appointment.phone || '',
      email: appointment.email || '',
      dob: '',
      gender: 'male',
      address: '',
      priority: appointment.priority || 'Urgent',
      idNumber: '',
      insuranceNumber: '',
      notes: appointment.notes || '',
      dobDate: null,
    });
    setShowForm(true);
  };

  // ✅ Xử lý thay đổi form
  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      let numeric = value.replace(/\D/g, '').slice(0, 10);
      setPatientForm(prev => ({ ...prev, [field]: numeric }));
    } else if (field === 'dob') {
      if (value instanceof Date && !isNaN(value.getTime())) {
        const isoValue = value.toISOString().split('T')[0];
        setPatientForm(prev => ({ ...prev, dobDate: value, dob: isoValue }));
      } else {
        setPatientForm(prev => ({ ...prev, dobDate: null, dob: '' }));
      }
    } else {
      setPatientForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // ✅ Submit form: Check-in từ lịch hẹn và thêm vào hàng chờ
  const handleSubmitForm = async () => {
    if (!selectedAppointment) {
      toast.error('Không tìm thấy lịch hẹn!');
      return;
    }

    // Validate
    if (patientForm.phone.length !== 10) {
      toast.error('Số điện thoại phải đúng 10 chữ số!');
      return;
    }

    if (!patientForm.patientName.trim()) {
      toast.error('Vui lòng nhập tên bệnh nhân!');
      return;
    }

    if (!patientForm.dob) {
      toast.error('Vui lòng chọn ngày sinh!');
      return;
    }

    setFormSubmitting(true);
    try {
      // Gọi API check-in từ lịch hẹn
      const res = await queueApi.checkInFromAppointmentWithInfo(
        selectedAppointment.appointmentId,
        patientForm
      );

      console.log('✅ Check-in response:', res);

      // Thông báo thành công
      if (res.roomName) {
        toast.success(
          `🏥 Bệnh nhân được chuyển tới phòng: ${res.roomName}${res.doctorName ? `\nBác sĩ: ${res.doctorName}` : ''}`,
          { autoClose: 5000 }
        );
      } else {
        toast.success('✅ Đã check-in bệnh nhân! Đang phân phòng...');
      }

      // Đóng form
      setShowForm(false);
      setSelectedAppointment(null);
      setPatientForm(emptyPatientForm);

      // Refresh danh sách lịch hẹn
      await fetchTodayAppointments();

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Có lỗi xảy ra!';
      console.error('❌ Error submitting form:', error);
      toast.error(`❌ ${msg}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // ✅ Hủy form
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
    setPatientForm(emptyPatientForm);
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
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Debug Panel */}
      {debugInfo && !debugInfo.hasToken && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="w-9 h-9 text-blue-600" />
          <span>Lịch hẹn hôm nay</span>
        </h1>
        <button
          onClick={fetchTodayAppointments}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Làm mới
        </button>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
      </div> */}

      {/* Search Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name search */}
          <div className="flex flex-col">
            <label htmlFor="searchName" className="text-sm font-medium text-gray-700 mb-2">
              Tìm theo tên
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="searchName"
                type="text"
                placeholder="Nhập tên bệnh nhân..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchName && (
                <button
                  onClick={() => setSearchName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Phone search */}
          <div className="flex flex-col">
            <label htmlFor="searchPhone" className="text-sm font-medium text-gray-700 mb-2">
              Tìm theo số điện thoại
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="searchPhone"
                type="text"
                placeholder="Nhập số điện thoại..."
                value={searchPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setSearchPhone(value);
                }}
                className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={10}
              />
              {searchPhone && (
                <button
                  onClick={() => setSearchPhone('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Clear button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleClearFilters}
              disabled={!searchName && !searchPhone}
              type="button"
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Active filters indicator */}
        {(searchName || searchPhone) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Đang lọc:</span>
            {searchName && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Tên: {searchName}
              </span>
            )}
            {searchPhone && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                SĐT: {searchPhone}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-20">STT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã lịch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bệnh nhân</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    {(searchName || searchPhone) 
                      ? 'Không tìm thấy lịch hẹn phù hợp'
                      : debugInfo?.hasToken 
                        ? 'Không có lịch hẹn đã xác nhận trong ngày hôm nay'
                        : 'Vui lòng đăng nhập để xem danh sách'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <tr 
                    key={appointment.appointmentId} 
                    className={`hover:bg-gray-50 transition-colors ${
                      appointment.hasCheckedIn ? 'bg-green-50' : 
                      isPast(appointment.appointmentTime) ? 'bg-red-50' :
                      isUpcoming(appointment.appointmentTime) ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                        {appointment.appointmentCode}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{appointment.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {appointment.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{appointment.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {appointment.hasCheckedIn ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          Đã thêm
                        </span>
                      ) : isUpcoming(appointment.appointmentTime) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                          <Clock className="w-4 h-4" />
                          Sắp tới
                        </span>
                      ) : isPast(appointment.appointmentTime) ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          Quá giờ
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          Chờ check-in
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!appointment.hasCheckedIn ? (
                        <button
                          onClick={() => handleAddPatientFromAppointment(appointment)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2 mx-auto"
                        >
                          <User className="w-4 h-4" />
                          Thêm vào hàng chờ
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">Đã thêm</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Hiển thị PatientForm */}
      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={false}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          selectedAppointment={selectedAppointment}
        />
      )}
    </div>
  );
}