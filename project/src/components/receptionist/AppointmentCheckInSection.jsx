import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, User, AlertCircle, Loader2, Search, X, Eye, Plus } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
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

const PAGE_SIZE = 10;

export default function AppointmentCheckInSection({ onOpenPatientForm }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    setDebugInfo({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : null,
      userInfo: user ? JSON.parse(user) : null
    });

    if (!token) {
      toast.error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại!');
    }
  }, []);

  useEffect(() => {
    let result = [...appointments];

    if (searchName) {
      result = result.filter(a => 
        a.patientName?.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (searchPhone) {
      result = result.filter(a => a.phone?.includes(searchPhone));
    }

    const total = result.length;
    const pages = Math.ceil(total / PAGE_SIZE);
    const start = currentPage * PAGE_SIZE;
    const paginated = result.slice(start, start + PAGE_SIZE);

    setFilteredAppointments(paginated);
    setTotalPages(pages);
  }, [appointments, searchName, searchPhone, currentPage]);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      const data = await queueApi.getTodayAppointments();
      setAppointments(Array.isArray(data) ? data : []);
      setCurrentPage(0);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể tải danh sách';
      toast.error(msg);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    const interval = setInterval(fetchTodayAppointments, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleClearFilters = () => {
    setSearchName('');
    setSearchPhone('');
    setCurrentPage(0);
  };

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

  const handleViewPatientDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setPatientForm({
      ...appointment,
      dobDate: appointment.dob ? new Date(appointment.dob) : null,
    });
    setShowForm(true);
  };

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

  const handleSubmitForm = async () => {
    if (!selectedAppointment) return toast.error('Không tìm thấy lịch hẹn!');

    if (patientForm.phone.length !== 10) return toast.error('Số điện thoại phải đúng 10 chữ số!');
    if (!patientForm.patientName.trim()) return toast.error('Vui lòng nhập tên bệnh nhân!');
    if (!patientForm.dob) return toast.error('Vui lòng chọn ngày sinh!');

    setFormSubmitting(true);
    try {
      const res = await queueApi.checkInFromAppointmentWithInfo(
        selectedAppointment.appointmentId,
        patientForm
      );

      toast.success(
        res.roomName
          ? `Đã thêm – Phòng: ${res.roomName}${res.doctorName ? ` – BS: ${res.doctorName}` : ''}`
          : 'Đã thêm vào hàng chờ thành công!'
      );

      setShowForm(false);
      setSelectedAppointment(null);
      setPatientForm(emptyPatientForm);
      fetchTodayAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in thất bại');
    } finally {
      setFormSubmitting(false);
    }
  };

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

  const isUpcoming = (t) => {
    const diff = (new Date(t) - new Date()) / 60000;
    return diff > 0 && diff <= 30;
  };

  const isPast = (t) => new Date(t) < new Date();

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {debugInfo && !debugInfo.hasToken && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-bold text-red-900">Không tìm thấy token đăng nhập!</p>
              <p className="text-sm text-red-700 mt-1">Vui lòng đăng nhập lại để sử dụng tính năng này.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="w-9 h-9 text-blue-600" />
          <span>Lịch hẹn hôm nay</span>
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Tìm theo tên</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên bệnh nhân..."
                value={searchName}
                onChange={(e) => { setSearchName(e.target.value); setCurrentPage(0); }}
                className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchName && (
                <button onClick={() => { setSearchName(''); setCurrentPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Tìm theo số điện thoại</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập số điện thoại..."
                value={searchPhone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  setSearchPhone(v);
                  setCurrentPage(0);
                }}
                maxLength={10}
                className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchPhone && (
                <button onClick={() => { setSearchPhone(''); setCurrentPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleClearFilters}
              disabled={!searchName && !searchPhone}
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {(searchName || searchPhone) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Đang lọc:</span>
            {searchName && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Tên: {searchName}</span>}
            {searchPhone && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">SĐT: {searchPhone}</span>}
          </div>
        )}
      </div>

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
                      : 'Không có lịch hẹn nào hôm nay'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => {
                  const stt = currentPage * PAGE_SIZE + index + 1;
                  return (
                    <tr 
                      key={appointment.appointmentId}
                      className={`hover:bg-gray-50 transition-colors ${
                        appointment.hasCheckedIn ? 'bg-green-50' : 
                        isPast(appointment.appointmentTime) ? 'bg-red-50' :
                        isUpcoming(appointment.appointmentTime) ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">{stt}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {appointment.appointmentCode}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700">{appointment.phone || '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{appointment.email || '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{formatTime(appointment.appointmentTime)}</td>

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
                          <span className="text-gray-500 text-xs">Chờ check-in</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {!appointment.hasCheckedIn ? (
                          <button
                            onClick={() => handleAddPatientFromAppointment(appointment)}
                            className="text-green-600 hover:text-green-700 p-2 transition mx-auto"
                            title="Thêm vào hàng chờ"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewPatientDetail(appointment)}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition mx-auto"
                            title="Xem chi tiết bệnh nhân"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={selectedAppointment?.hasCheckedIn || false}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          selectedAppointment={selectedAppointment}
          submitting={formSubmitting}
        />
      )}
    </div>
  );
}