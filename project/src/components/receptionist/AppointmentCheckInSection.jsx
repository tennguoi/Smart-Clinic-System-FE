import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Loader2, Eye, Plus, X} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
import AppointmentSearchFilter from './AppointmentSearchFilter'; // ← Dùng component có sẵn
import { queueApi } from '../../api/receptionApi';

const PAGE_SIZE = 10;

export default function AppointmentCheckInSection() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
const [searchStatus, setSearchStatus] = useState('all'); // ← THÊM DÒNG NÀY
  const [patientForm, setPatientForm] = useState({
    patientName: '', phone: '', email: '', dob: '', dobDate: null,
    gender: 'male', address: '', priority: 'Urgent', idNumber: '',
    insuranceNumber: '', notes: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Lọc dữ liệu
useEffect(() => {
  let result = [...appointments];

  // Lọc theo keyword (tên hoặc số điện thoại)
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    result = result.filter(a =>
      a.patientName?.toLowerCase().includes(keyword) ||
      a.phone?.includes(searchKeyword)
    );
  }

  // Lọc theo trạng thái
  if (searchStatus !== 'all') {
    result = result.filter(a => {
      if (searchStatus === 'checked-in') return a.hasCheckedIn;
      if (searchStatus === 'upcoming') return !a.hasCheckedIn && isUpcoming(a.appointmentTime);
      if (searchStatus === 'past') return !a.hasCheckedIn && isPast(a.appointmentTime);
      if (searchStatus === 'waiting') return !a.hasCheckedIn && !isUpcoming(a.appointmentTime) && !isPast(a.appointmentTime);
      return true;
    });
  }

  const total = result.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const start = currentPage * PAGE_SIZE;
  const paginated = result.slice(start, start + PAGE_SIZE);

  setFilteredAppointments(paginated);
  setTotalPages(pages);
}, [appointments, searchKeyword, searchStatus, currentPage]);


  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      const data = await queueApi.getTodayAppointments();
      setAppointments(Array.isArray(data) ? data : []);
      setCurrentPage(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách');
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

  const handleAddPatientFromAppointment = (appointment) => {
    setSelectedAppointment(appointment);

    const dobDate = appointment.dob ? new Date(appointment.dob) : null;
    const dobString = dobDate && !isNaN(dobDate.getTime())
      ? dobDate.toISOString().split('T')[0]
      : '';

    setPatientForm({
      patientName: appointment.patientName || '',
      phone: appointment.phone || '',
      email: appointment.email || '',
      dob: dobString,
      dobDate: dobDate,
      gender: appointment.gender || 'male',
      address: appointment.address || '',
      priority: appointment.priority || 'Urgent',
      idNumber: appointment.idNumber || '',
      insuranceNumber: appointment.insuranceNumber || '',
      notes: appointment.notes || '',
    });
    setShowForm(true);
  };

  const handleViewDetail = (appointment) => {
    setSelectedDetail(appointment);
    setShowDetailModal(true);
  };

  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
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
      setPatientForm({
        patientName: '', phone: '', email: '', dob: '', dobDate: null,
        gender: 'male', address: '', priority: 'Urgent', idNumber: '',
        insuranceNumber: '', notes: ''
      });
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
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '—';
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="w-9 h-9 text-blue-600" />
          <span>Lịch hẹn hôm nay</span>
        </h1>
      </div>

      {/* Bộ lọc đẹp như trang quản lý */}
      <AppointmentSearchFilter
  searchKeyword={searchKeyword}
  searchStatus={searchStatus}
  onSearchKeywordChange={setSearchKeyword}
  onSearchStatusChange={setSearchStatus}
  onClear={() => setCurrentPage(0)}
/>

      {/* Bảng */}
      {loading ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center mt-6">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-20">STT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã lịch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bệnh nhân</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dịch vụ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                   {(searchKeyword || searchStatus !== 'all') ? 'Không tìm thấy lịch hẹn phù hợp' : 'Không có lịch hẹn nào hôm nay'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt, idx) => {
                  const stt = currentPage * PAGE_SIZE + idx + 1;
                  return (
                    <tr>
                      <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">{stt}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-4 py-2 rounded-md text-base font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
  {appt.appointmentCode}
</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{appt.patientName}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{appt.phone || '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{formatTime(appt.appointmentTime)}</td>
                      <td className="px-4 py-4">
                        {appt.services?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {appt.services.map(s => (
                              <span key={s.serviceId} className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {appt.hasCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <CheckCircle className="w-4 h-4" /> Đã thêm
                          </span>
                        ) : isUpcoming(appt.appointmentTime) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 animate-pulse">
                            <Clock className="w-4 h-4" /> Sắp tới
                          </span>
                        ) : isPast(appt.appointmentTime) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <AlertCircle className="w-4 h-4" /> Quá giờ
                          </span>
                        ) : (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
    <Clock className="w-4 h-4" /> Chờ check-in
  </span>
)}
                      </td>
                      <td className="px-4 py-4 text-center space-x-3">
                        {!appt.hasCheckedIn ? (
                          <button
                            onClick={() => handleAddPatientFromAppointment(appt)}
                            className="text-green-600 hover:text-green-700 p-2 transition"
                            title="Thêm vào hàng chờ"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDetail(appt)}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded-full transition"
                            title="Xem chi tiết lịch hẹn"
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
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      {/* Form thêm bệnh nhân */}
      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={false}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          selectedAppointment={selectedAppointment}
          submitting={formSubmitting}
        />
      )}

      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Chi tiết lịch hẹn
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Mã lịch + Thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã lịch hẹn</label>
                  <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg font-mono text-blue-700">
                    {selectedDetail.appointmentCode}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian hẹn</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    {formatTime(selectedDetail.appointmentTime)}
                  </div>
                </div>
              </div>

        {/* Thông tin bệnh nhân */}
<div>
  <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin bệnh nhân</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Họ tên */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Họ tên</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
        {selectedDetail.patientName || '—'}
      </div>
    </div>

    {/* Số điện thoại */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-900">
        {selectedDetail.phone || '—'}
      </div>
    </div>

    {/* Email */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
        {selectedDetail.email || '—'}
      </div>
    </div>

    {/* Giới tính */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Giới tính</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
        {selectedDetail.gender === 'female' ? 'Nữ' : selectedDetail.gender === 'other' ? 'Khác' : 'Nam'}
      </div>
    </div>

    {/* Ghi chú */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold text-gray-900">
        {selectedDetail.notes || '—'}
      </div>
    </div>

    {/* Mức độ ưu tiên */}
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Mức độ ưu tiên</label>
      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm">
        {selectedDetail.priority === 'Emergency'
          ? <span className="text-red-600 font-bold">Khẩn cấp</span>
          : selectedDetail.priority === 'Urgent'
          ? <span className="text-orange-600 font-bold">Ưu tiên</span>
          : <span className="text-gray-700">Thường</span>}
      </div>
    </div>
  </div>

  {/* Các thông tin bổ sung */}
  {(selectedDetail.idNumber || selectedDetail.insuranceNumber || selectedDetail.address) && (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedDetail.idNumber && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CCCD/CMND</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
              {selectedDetail.idNumber}
            </div>
          </div>
        )}
        {selectedDetail.insuranceNumber && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Số BHYT</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
              {selectedDetail.insuranceNumber}
            </div>
          </div>
        )}
        {selectedDetail.address && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
              {selectedDetail.address}
            </div>
          </div>
        )}
      </div>
    </div>
  )}
</div>

              {/* Dịch vụ */}
              {selectedDetail.services?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Dịch vụ đã chọn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.services.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trạng thái đã check-in */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Đã được thêm vào hàng chờ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}