import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Loader2, Eye, Plus, X } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
import AppointmentSearchFilter from './AppointmentSearchFilter';
import CountBadge from '../common/CountBadge'; // 👈 IMPORT COMPONENT
import { queueApi } from '../../api/receptionApi';
import { useTheme } from '../../contexts/ThemeContext';
import { toastConfig } from '../../config/toastConfig';

const PAGE_SIZE = 10;

export default function AppointmentCheckInSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Trạng thái lọc
  const [searchStatus, setSearchStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFiltered, setTotalFiltered] = useState(0); // 👈 THÊM STATE ĐỂ LƯU TỔNG SỐ SAU KHI LỌC

  const [patientForm, setPatientForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    dob: '',
    dobDate: null,
    gender: 'male',
    address: '',
    priority: 'Urgent',
    idNumber: '',
    insuranceNumber: '',
    notes: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Helpers
  const formatTime = (dateTime) => {
    if (!dateTime) return '—';
    return new Date(dateTime).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };
  const isUpcoming = (t) => {
    const diff = (new Date(t) - new Date()) / 60000;
    return diff > 0 && diff <= 30;
  };
  const isPast = (t) => new Date(t) < new Date();

  // Lọc dữ liệu mỗi khi inputs thay đổi
  useEffect(() => {
    let result = [...appointments];

    // 1) Lọc theo keyword (tên hoặc số điện thoại)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(a =>
        (a.patientName?.toLowerCase()?.includes(keyword)) ||
        (a.phone?.includes(searchKeyword))
      );
    }

    // 2) Lọc theo trạng thái
    if (searchStatus !== 'all') {
      result = result.filter(a => {
        if (searchStatus === 'checked-in') return a.hasCheckedIn;
        if (searchStatus === 'upcoming') return !a.hasCheckedIn && isUpcoming(a.appointmentTime);
        if (searchStatus === 'past') return !a.hasCheckedIn && isPast(a.appointmentTime);
        if (searchStatus === 'waiting') return !a.hasCheckedIn && !isUpcoming(a.appointmentTime) && !isPast(a.appointmentTime);
        return true;
      });
    }

    // 3) Lưu tổng số sau khi lọc
    const total = result.length;
    setTotalFiltered(total); // 👈 LƯU TỔNG SỐ

    // 4) Paginate
    const pages = Math.ceil(total / PAGE_SIZE);
    const start = currentPage * PAGE_SIZE;
    const paginated = result.slice(start, start + PAGE_SIZE);

    setFilteredAppointments(paginated);
    setTotalPages(pages);
  }, [appointments, searchKeyword, searchStatus, currentPage]);

  // Tải lịch hẹn hôm nay
  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      const response = await queueApi.getTodayAppointments();
      
      console.log('Dữ liệu API getTodayAppointments:', response);

      let dataToSet = [];
      
      if (Array.isArray(response)) {
        dataToSet = response;
      } else if (response && Array.isArray(response.data)) {
        dataToSet = response.data;
      } else if (response && Array.isArray(response.result)) {
        dataToSet = response.result;
      }

      setAppointments(dataToSet);
      setCurrentPage(0);
    } catch (error) {
      console.error("Lỗi fetch lịch hẹn:", error);
      toast.error(error.response?.data?.message ?? t('appointmentCheckIn.errors.loadFailed'));
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

  // Mở form từ lịch hẹn
  const handleAddPatientFromAppointment = (appointment) => {
    setSelectedAppointment(appointment);

    const dobDate = appointment.dob ? new Date(appointment.dob) : null;
    const dobString = dobDate && !isNaN(dobDate.getTime())
      ? dobDate.toISOString().split('T')[0]
      : '';

    setPatientForm({
      patientName: appointment.patientName ?? '',
      phone: appointment.phone ?? '',
      email: appointment.email ?? '',
      dob: dobString,
      dobDate,
      gender: appointment.gender ?? 'male',
      address: appointment.address ?? '',
      priority: appointment.priority ?? 'Urgent',
      idNumber: appointment.idNumber ?? '',
      insuranceNumber: appointment.insuranceNumber ?? '',
      notes: appointment.notes ?? '',
    });
    setShowForm(true);
  };

  // Xem chi tiết lịch hẹn
  const handleViewDetail = (appointment) => {
    setSelectedDetail(appointment);
    setShowDetailModal(true);
  };

  // Form change
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

  // Submit form
  const handleSubmitForm = async () => {
    if (!selectedAppointment) return toast.error(t('appointmentCheckIn.errors.noAppointment'));
    if (patientForm.phone.length !== 10) return toast.error(t('appointmentCheckIn.errors.phoneInvalid'));
    if (!patientForm.patientName.trim()) return toast.error(t('appointmentCheckIn.errors.nameRequired'));
    if (!patientForm.dob) return toast.error(t('appointmentCheckIn.errors.dobRequired'));

    setFormSubmitting(true);
    try {
      const res = await queueApi.checkInFromAppointmentWithInfo(
        selectedAppointment.appointmentId,
        patientForm
      );

      toast.success(
        res.roomName
          ? t('appointmentCheckIn.success.addedWithRoom', { 
              room: res.roomName, 
              doctor: res.doctorName ? ` – ${t('appointmentCheckIn.doctor')}: ${res.doctorName}` : '' 
            })
          : t('appointmentCheckIn.success.added')
      );

      setShowForm(false);
      setSelectedAppointment(null);
      setPatientForm({
        patientName: '',
        phone: '',
        email: '',
        dob: '',
        dobDate: null,
        gender: 'male',
        address: '',
        priority: 'Urgent',
        idNumber: '',
        insuranceNumber: '',
        notes: ''
      });
      fetchTodayAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message ?? t('appointmentCheckIn.errors.checkInFailed'));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  // Translate gender
  const getGenderText = (gender) => {
    if (gender === 'female') return t('appointmentCheckIn.gender.female');
    if (gender === 'other') return t('appointmentCheckIn.gender.other');
    return t('appointmentCheckIn.gender.male');
  };

  // Translate priority
  const getPriorityText = (priority) => {
    if (priority === 'Emergency') return t('appointmentCheckIn.priority.emergency');
    if (priority === 'Urgent') return t('appointmentCheckIn.priority.urgent');
    return t('appointmentCheckIn.priority.normal');
  };

  // Get priority color class
  const getPriorityColorClass = (priority) => {
    if (priority === 'Emergency') return theme === 'dark' ? 'text-red-400' : 'text-red-600';
    if (priority === 'Urgent') return theme === 'dark' ? 'text-orange-400' : 'text-orange-600';
    return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  };

  // =================== RENDER ===================
  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster 
        position={toastConfig.position}
        containerStyle={toastConfig.containerStyle}
        toastOptions={toastConfig.toastOptions}
      />

      {/* Header với CountBadge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className={`text-4xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            <Calendar className="w-9 h-9 text-blue-600" />
            <span>{t('appointmentCheckIn.title')}</span>
          </h1>
          
          {/* 👇 THÊM COUNTBADGE */}
          <CountBadge
            currentCount={filteredAppointments.length}
            totalCount={totalFiltered}
            label={t('appointmentCheckIn.label') || 'lịch hẹn'}
           
          />
        </div>
      </div>

      {/* Bộ lọc */}
      <AppointmentSearchFilter
        searchKeyword={searchKeyword}
        searchStatus={searchStatus}
        onSearchKeywordChange={setSearchKeyword}
        onSearchStatusChange={setSearchStatus}
        onClear={() => setCurrentPage(0)}
      />

      {/* Bảng danh sách */}
      {loading ? (
        <div className={`rounded-lg shadow border p-12 text-center mt-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('appointmentCheckIn.loading')}</p>
        </div>
      ) : (
        <div className={`rounded-lg shadow border overflow-hidden mt-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-20 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.stt')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.code')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.patient')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.phone')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.time')}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.services')}
                </th>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.status')}
                </th>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('appointmentCheckIn.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-16 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(searchKeyword || searchStatus !== 'all')
                      ? t('appointmentCheckIn.noResults')
                      : t('appointmentCheckIn.noAppointments')}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt, idx) => {
                  const stt = currentPage * PAGE_SIZE + idx + 1;
                  return (
                    <tr key={appt.appointmentId ?? `${appt.appointmentCode}-${idx}`}>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{stt}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-4 py-2 rounded-md text-base font-mono font-bold border ${
                          theme === 'dark' ? 'bg-blue-900/20 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {appt.appointmentCode}
                        </span>
                      </td>
                      <td className={`px-4 py-4 text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{appt.patientName}</td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{appt.phone ?? '—'}</td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{formatTime(appt.appointmentTime)}</td>
                      <td className="px-4 py-4">
                        {appt.services?.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {appt.services.map((s) => (
                              <span
                                key={s.serviceId ?? s.name}
                                className={`px-2.5 py-1 text-xs rounded-full border ${
                                  theme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200'
                                }`}
                              >
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {appt.hasCheckedIn ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                          }`}>
                            <CheckCircle className="w-4 h-4" /> {t('appointmentCheckIn.status.added')}
                          </span>
                        ) : isUpcoming(appt.appointmentTime) ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse ${
                            theme === 'dark' ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                          }`}>
                            <Clock className="w-4 h-4" /> {t('appointmentCheckIn.status.upcoming')}
                          </span>
                        ) : isPast(appt.appointmentTime) ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                          }`}>
                            <AlertCircle className="w-4 h-4" /> {t('appointmentCheckIn.status.overdue')}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Clock className="w-4 h-4" /> {t('appointmentCheckIn.status.waiting')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center space-x-3">
                        {!appt.hasCheckedIn ? (
                          <button
                            onClick={() => handleAddPatientFromAppointment(appt)}
                            className="text-green-600 hover:text-green-700 p-2 transition"
                            title={t('appointmentCheckIn.actions.addToQueue')}
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleViewDetail(appt)}
                            className={`p-2 rounded-full transition ${theme === 'dark' ? 'text-blue-300 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-100'}`}
                            title={t('appointmentCheckIn.actions.viewDetail')}
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
            <div className={`border-t px-6 py-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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

      {/* Modal chi tiết */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center p-6 sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                <Eye className="w-6 h-6" />
                {t('appointmentCheckIn.modal.title')}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className={theme === 'dark' ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Mã lịch + thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={theme === 'dark' ? 'block text-sm text-gray-300 mb-1' : 'block text-sm text-gray-700 mb-1'}>
                    {t('appointmentCheckIn.modal.code')}
                  </label>
                  <div className={`px-4 py-3 font-mono rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    {selectedDetail.appointmentCode}
                  </div>
                </div>
                <div>
                  <label className={theme === 'dark' ? 'block text-sm text-gray-300 mb-1' : 'block text-sm text-gray-700 mb-1'}>
                    {t('appointmentCheckIn.modal.time')}
                  </label>
                  <div className={`px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                    {formatTime(selectedDetail.appointmentTime)}
                  </div>
                </div>
              </div>

              {/* Thông tin bệnh nhân */}
              <div>
                <h3 className={theme === 'dark' ? 'text-lg font-bold text-gray-100 mb-4' : 'text-lg font-bold text-gray-800 mb-4'}>
                  {t('appointmentCheckIn.modal.patientInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.name')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm font-medium ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      {selectedDetail.patientName ?? '—'}
                    </div>
                  </div>
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.phone')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm font-medium ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      {selectedDetail.phone ?? '—'}
                    </div>
                  </div>
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.email')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                      {selectedDetail.email ?? '—'}
                    </div>
                  </div>
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.gender')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                      {getGenderText(selectedDetail.gender)}
                    </div>
                  </div>
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.notes')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm font-semibold ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                      {selectedDetail.notes ?? '—'}
                    </div>
                  </div>
                  <div>
                    <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                      {t('appointmentCheckIn.modal.priority')}
                    </label>
                    <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                      <span className={`font-bold ${getPriorityColorClass(selectedDetail.priority)}`}>
                        {getPriorityText(selectedDetail.priority)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bổ sung */}
                {(selectedDetail.idNumber || selectedDetail.insuranceNumber || selectedDetail.address) && (
                  <div className={`mt-6 pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDetail.idNumber && (
                        <div>
                          <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                            {t('appointmentCheckIn.modal.idNumber')}
                          </label>
                          <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                            {selectedDetail.idNumber}
                          </div>
                        </div>
                      )}
                      {selectedDetail.insuranceNumber && (
                        <div>
                          <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                            {t('appointmentCheckIn.modal.insurance')}
                          </label>
                          <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
                            {selectedDetail.insuranceNumber}
                          </div>
                        </div>
                      )}
                      {selectedDetail.address && (
                        <div className="md:col-span-2">
                          <label className={theme === 'dark' ? 'block text-xs text-gray-400 mb-1' : 'block text-xs text-gray-600 mb-1'}>
                            {t('appointmentCheckIn.modal.address')}
                          </label>
                          <div className={`px-4 py-3 rounded-lg border text-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
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
                  <h3 className={theme === 'dark' ? 'text-lg font-bold text-gray-100 mb-4' : 'text-lg font-bold text-gray-800 mb-4'}>
                    {t('appointmentCheckIn.modal.services')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.services.map((s, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                          theme === 'dark' ? 'bg-purple-900/20 text-purple-300 border-purple-800' : 'bg-purple-100 text-purple-700 border-purple-200'
                        }`}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trạng thái đã check-in */}
              <div className={`pt-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-end">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                    {t('appointmentCheckIn.modal.checkedIn')}
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