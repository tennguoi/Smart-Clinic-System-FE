// src/components/receptionist/AppointmentsSection.jsx
import { useEffect, useState } from 'react';
import {
  Plus, X, Calendar, User, Phone, Mail,
  Loader2, Search, CheckCircle2, XCircle,
  Edit2, Check, Trash2, Clock, Eye
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import axiosInstance from '../../utils/axiosConfig';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const toLocalDateTimeString = (localDate) => {
  const d = new Date(localDate);
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0') + 'T' +
         String(d.getHours()).padStart(2, '0') + ':' +
         String(d.getMinutes()).padStart(2, '0') + ':00';
};

export default function AppointmentsSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQueryServices, setSearchQueryServices] = useState('');

  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    notes: '',
    selectedServices: [],
  });

  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQueryAppointments, setSearchQueryAppointments] = useState('');
  const pageSize = 10;

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const isValidTime = (timeStr) => {
    if (!timeStr) return false;
    const [hour, minute] = timeStr.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    const morningStart = 8 * 60;
    const morningEnd = 12 * 60;
    const afternoonStart = 14 * 60;
    const afternoonEnd = 18 * 60;
    return (
      (totalMinutes >= morningStart && totalMinutes <= morningEnd) ||
      (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd)
    );
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/appointments', {
          params: {
            status: selectedStatus,
            page: currentPage,
            size: pageSize,
            keyword: searchQueryAppointments.trim() || null,
          },
        });

        let data = res.data.content || [];

        if (filterStartDate || filterEndDate) {
          data = data.filter(appt => {
            if (!appt.appointmentTime) return false;
            const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
            if (filterStartDate && apptDate < filterStartDate) return false;
            if (filterEndDate && apptDate > filterEndDate) return false;
            return true;
          });
        }

        setAppointments(data);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } catch (err) {
        toast.error(t('appointmentManagement.loadError', 'Không thể tải danh sách lịch hẹn'));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedStatus, currentPage, searchQueryAppointments, filterStartDate, filterEndDate, t]);

  useEffect(() => {
    if (!showForm) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await axiosInstance.get('/api/public/services?page=0&size=100');
        const normalized = (res.data.content || []).map(s => ({ ...s, id: s.serviceId }));
        setServices(normalized);
      } catch {
        toast.error(t('appointmentManagement.loadServicesError', 'Không thể tải danh sách dịch vụ'));
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [showForm, t]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQueryServices.toLowerCase())
  );

  const toggleService = (service) => {
    setForm(prev => {
      const exists = prev.selectedServices.some(s => s.id === service.id);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter(s => s.id !== service.id)
          : [...prev.selectedServices, service],
      };
    });
  };

  const handleOpenAdd = () => {
    setModalMode('create');
    setEditingAppointment(null);
    setForm({
      patientName: '',
      phone: '',
      email: '',
      notes: '',
      selectedServices: [],
    });
    setAppointmentDate(null);
    setAppointmentTime('');
    setSearchQueryServices('');
    setShowForm(true);
  };

  const handleOpenView = (appt) => {
    setModalMode('view');
    setEditingAppointment(appt);
    const normalized = (appt.services || []).map(s => ({ ...s, id: s.serviceId }));

    const apptDateTime = appt.appointmentTime ? new Date(appt.appointmentTime) : null;
    setAppointmentDate(apptDateTime);
    setAppointmentTime(apptDateTime
      ? `${apptDateTime.getHours().toString().padStart(2, '0')}:${apptDateTime.getMinutes().toString().padStart(2, '0')}`
      : ''
    );

    setForm({
      patientName: appt.patientName,
      phone: appt.phone,
      email: appt.email || '',
      notes: appt.notes || '',
      selectedServices: normalized,
    });
    setSearchQueryServices('');
    setShowForm(true);
  };

  const handleSwitchToEdit = () => setModalMode('edit');

  const handleSubmit = async () => {
    if (!form.patientName.trim()) return toast.error(t('appointmentManagement.nameRequired', 'Vui lòng nhập họ tên'));
    if (!form.phone.trim()) return toast.error(t('appointmentManagement.phoneRequired', 'Vui lòng nhập số điện thoại'));
    if (form.phone.length !== 10) return toast.error(t('appointmentManagement.phoneLength', 'Số điện thoại phải đúng 10 chữ số'));
    if (!appointmentDate) return toast.error(t('appointmentManagement.dateRequired', 'Vui lòng chọn ngày hẹn'));
    if (!appointmentTime || !isValidTime(appointmentTime)) return toast.error(t('appointmentManagement.timeInvalid', 'Giờ hẹn phải từ 08:00–12:00 hoặc 14:00–18:00'));

    const [hour, minute] = appointmentTime.split(':');
    const selectedDateTime = new Date(appointmentDate);
    selectedDateTime.setHours(parseInt(hour, 10));
    selectedDateTime.setMinutes(parseInt(minute, 10));
    selectedDateTime.setSeconds(0);
    selectedDateTime.setMilliseconds(0);

    if (selectedDateTime <= new Date()) {
      toast.error(t('appointmentManagement.pastTime', 'Không thể đặt lịch vào thời gian đã qua. Vui lòng chọn giờ trong tương lai.'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        patientName: form.patientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        appointmentTime: toLocalDateTimeString(selectedDateTime),
        notes: form.notes.trim() || null,
        serviceIds: form.selectedServices.map(s => s.id),
      };

      if (editingAppointment) {
        await axiosInstance.put(`/api/appointments/${editingAppointment.appointmentId}`, payload);
        toast.success(t('appointmentManagement.updateSuccess', 'Cập nhật lịch hẹn thành công!'));
      } else {
        const res = await axiosInstance.post('/api/appointments', payload);
       toast.success(t('appointmentManagement.createSuccess', { code: res.data.appointmentCode }));
      }

      setShowForm(false);

      const refreshed = await axiosInstance.get('/api/appointments', {
        params: {
          status: selectedStatus,
          page: currentPage,
          size: pageSize,
          keyword: searchQueryAppointments.trim() || null,
        },
      });

      let data = refreshed.data.content || [];
      if (filterStartDate || filterEndDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const d = new Date(appt.appointmentTime).toISOString().split('T')[0];
          if (filterStartDate && d < filterStartDate) return false;
          if (filterEndDate && d > filterEndDate) return false;
          return true;
        });
      }
      setAppointments(data);
      setTotalPages(refreshed.data.totalPages || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', 'Thao tác thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmFromModal = async () => {
    if (!editingAppointment || confirmLoading) return;
    setConfirmLoading(true);
    try {
      await axiosInstance.patch(
        `/api/appointments/${editingAppointment.appointmentId}/status`,
        null,
        { params: { status: 'Confirmed' } }
      );
      toast.success(t('appointmentManagement.confirmSuccess', 'Đã xác nhận lịch hẹn thành công!'));
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === editingAppointment.appointmentId
            ? { ...a, status: 'Confirmed' }
            : a
        )
      );
      setEditingAppointment(prev => ({ ...prev, status: 'Confirmed' }));
    } catch (err) {
      toast.error(err.response?.data?.message || t('appointmentManagement.confirmFailed', 'Xác nhận thất bại'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelTargetId) return;
    setCancelLoading(true);
    try {
      await axiosInstance.patch(`/api/appointments/${cancelTargetId}/status`, null, {
        params: { status: 'Cancelled' }
      });
      setAppointments(prev => prev.map(a => 
        a.appointmentId === cancelTargetId ? { ...a, status: 'Cancelled' } : a
      ));
      if (showForm && editingAppointment?.appointmentId === cancelTargetId) {
        setShowForm(false);
      }
      toast.success(t('appointmentManagement.cancelSuccess', 'Đã hủy lịch hẹn'));
    } catch {
      toast.error(t('appointmentManagement.cancelFailed', 'Hủy thất bại'));
    } finally {
      setCancelLoading(false);
      setShowCancelConfirmation(false);
      setCancelTargetId(null);
    }
  };

  const openCancelConfirmation = (id) => {
    setCancelTargetId(id);
    setShowCancelConfirmation(true);
  };

  const handleClearSearch = () => {
    setSearchQueryAppointments('');
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedStatus('Pending');
    setSearchQueryAppointments('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(0);
  };

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
          <Calendar className="w-9 h-9 text-blue-600" />
          <span>{t('appointmentManagement.title', 'Quản Lý Lịch Hẹn')}</span>
        <CountBadge 
  currentCount={appointments.length} 
  totalCount={totalElements} 
  label={totalElements === 1 
    ? t('appointmentManagement.appointment', 'appointment')   // số ít
    : t('appointmentManagement.appointments', 'appointments') // số nhiều
  } 
/>
        </h1>
        <button onClick={handleOpenAdd}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('appointmentManagement.createButton', 'Tạo lịch hẹn')}
        </button>
      </div>

      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border p-6 mb-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('appointmentManagement.searchLabel', 'Tìm kiếm')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('appointmentManagement.searchPlaceholder', 'Tên bệnh nhân hoặc số điện thoại...')}
                value={searchQueryAppointments}
                onChange={(e) => { setSearchQueryAppointments(e.target.value); setCurrentPage(0); }}
                className={`w-full pl-9 pr-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              {searchQueryAppointments && (
                <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('appointmentManagement.statusLabel', 'Trạng thái')}</label>
            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(0); }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
              <option value="Pending">{t('appointmentManagement.statusPending', 'Chờ xác nhận')}</option>
              <option value="Confirmed">{t('appointmentManagement.statusConfirmed', 'Đã xác nhận')}</option>
              <option value="Cancelled">{t('appointmentManagement.statusCancelled', 'Đã hủy')}</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('appointmentManagement.fromDate', 'Từ ngày')}</label>
            <input type="date" value={filterStartDate}
              onChange={(e) => {
                const val = e.target.value;
                if (filterEndDate && val > filterEndDate) {
                  toast.error(t('appointmentManagement.dateRangeError', 'Từ ngày phải nhỏ hơn hoặc bằng Đến ngày'));
                  return;
                }
                setFilterStartDate(val);
                setCurrentPage(0);
              }}
              max={filterEndDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
          </div>

          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('appointmentManagement.toDate', 'Đến ngày')}</label>
            <input type="date" value={filterEndDate}
              onChange={(e) => {
                const val = e.target.value;
                if (filterStartDate && val < filterStartDate) {
                  toast.error(t('appointmentManagement.dateRangeError2', 'Đến ngày phải lớn hơn hoặc bằng Từ ngày'));
                  return;
                }
                setFilterEndDate(val);
                setCurrentPage(0);
              }}
              min={filterStartDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button onClick={handleClearFilters}
              className={`w-full px-4 py-3 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
              {t('appointmentManagement.clearFilters', 'Xóa lọc')}
            </button>
          </div>
        </div>
      </div>

      {loading && !showForm ? (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border p-12 text-center transition-colors duration-300`}>
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('appointmentManagement.loadingList', 'Đang tải danh sách lịch hẹn...')}</p>
        </div>
      ) : (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border overflow-hidden transition-colors duration-300`}>
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.stt', 'STT')}</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.code', 'Mã lịch')}</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.patient', 'Bệnh nhân')}</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.phone', 'Số điện thoại')}</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.time', 'Thời gian')}</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.services', 'Dịch vụ')}</th>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.status', 'Trạng thái')}</th>
                <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('appointmentManagement.table.actions', 'Thao tác')}</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-16 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('appointmentManagement.noAppointments', 'Chưa có lịch hẹn nào')}</td>
                </tr>
              ) : (
                appointments.map((a, index) => {
                  const stt = currentPage * pageSize + index + 1;
                  return (
                    <tr key={a.appointmentId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}>
                      <td className={`px-4 py-4 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{stt}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                          {a.appointmentCode}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{a.patientName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{a.phone}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDateTime(a.appointmentTime)}
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex flex-wrap gap-1.5">
                          {a.services?.length > 0 ? (
                            <>
                              {a.services.slice(0, 3).map((svc, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                                  {svc.name}
                                </span>
                              ))}
                              {a.services.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                  +{a.services.length - 3} {t('appointmentManagement.moreServices', 'dịch vụ')}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 italic text-xs">{t('appointmentManagement.noService', 'Chưa chọn dịch vụ')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                          a.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          a.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {a.status === 'Pending' ? t('appointmentManagement.statusPending', 'Chờ xác nhận') : 
                           a.status === 'Confirmed' ? t('appointmentManagement.statusConfirmed', 'Đã xác nhận') : 
                           t('appointmentManagement.statusCancelled', 'Đã hủy')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center space-x-2">
                        <button onClick={() => handleOpenView(a)} title={t('appointmentManagement.viewDetail', 'Xem chi tiết')}
                          className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
            <div className={`flex justify-between items-center p-6 border-b sticky top-0 backdrop-blur z-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50/80 border-gray-200'}`}>
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
                {isCreateMode ? (
                  <>
                    <Plus className="w-5 h-5" />
                    {t('appointmentManagement.createTitle', 'Tạo lịch hẹn mới')}
                  </>
                ) : isViewMode ? (
                  <>
                    <Eye className="w-5 h-5" />
                    {t('appointmentManagement.viewTitle', 'Chi tiết lịch hẹn')}
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5" />
                    {t('appointmentManagement.editTitle', 'Chỉnh sửa lịch hẹn')}
                  </>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {isViewMode && editingAppointment?.status === 'Pending' && (
                  <button onClick={handleSwitchToEdit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    {t('appointmentManagement.editButton', 'Chỉnh sửa')}
                  </button>
                )}
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('appointmentManagement.patientName', 'Họ tên')} <span className="text-red-500">*</span>
                  </label>
                  <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder={t('appointmentManagement.namePlaceholder', 'Nguyễn Văn A')} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('appointmentManagement.phone', 'Số điện thoại')} <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" maxLength={10} value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder={t('appointmentManagement.phonePlaceholder', '0901234567')} />
                  {form.phone && form.phone.length !== 10 && !isViewMode && (
                    <p className="text-xs text-red-600 mt-1">{t('appointmentManagement.phoneLength', 'Số điện thoại phải đúng 10 chữ số')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('appointmentManagement.email', 'Email (tùy chọn)')}</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder={t('appointmentManagement.emailPlaceholder', 'example@gmail.com')} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('appointmentManagement.date', 'Ngày hẹn')} <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={appointmentDate}
                    onChange={(date) => setAppointmentDate(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    maxDate={threeDaysLater}
                    disabled={isViewMode}
                    placeholderText={t('appointmentManagement.datePlaceholder', 'Chọn ngày')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    wrapperClassName="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('appointmentManagement.time', 'Giờ hẹn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || isValidTime(val)) {
                        setAppointmentTime(val);
                      } else {
                        toast.error(t('appointmentManagement.timeError', 'Chỉ được chọn giờ từ 08:00–12:00 hoặc 14:00–18:00'));
                      }
                    }}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  {appointmentTime && !isValidTime(appointmentTime) && !isViewMode && (
                    <p className="text-xs text-red-600 mt-1">{t('appointmentManagement.timeInvalid', 'Giờ không hợp lệ')}</p>
                  )}
                </div>
                <div />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('appointmentManagement.servicesLabel', 'Dịch vụ (tùy chọn)')}</label>
                {!isViewMode && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchQueryServices} onChange={(e) => setSearchQueryServices(e.target.value)}
                      placeholder={t('appointmentManagement.searchServices', 'Tìm kiếm dịch vụ...')}
                      className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                )}

                <div className={`max-h-60 overflow-y-auto border rounded-md ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  {loadingServices ? (
                    <div className="p-6 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      {t('appointmentManagement.loadingServices', 'Đang tải danh sách dịch vụ...')}
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">{t('appointmentManagement.noServicesFound', 'Không tìm thấy dịch vụ nào')}</div>
                  ) : (
                    filteredServices.map((svc) => {
                      const isSelected = form.selectedServices.some(s => s.id === svc.id);
                      return (
                        <div key={svc.id} onClick={() => !isViewMode && toggleService(svc)}
                          className={`p-4 ${!isViewMode ? 'cursor-pointer hover:bg-white dark:hover:bg-gray-600' : 'cursor-not-allowed'} border-b last:border-0 transition-colors ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'} ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{svc.name}</div>
                              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{formatPrice(svc.price)}</div>
                            </div>
                            {isSelected && <Check className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {form.selectedServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.selectedServices.map((svc) => (
                      <div key={svc.id} className="flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                        {svc.name}
                        {!isViewMode && (
                          <button onClick={() => toggleService(svc)} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('appointmentManagement.notes', 'Ghi chú (tùy chọn)')}</label>
                <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-60 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder={t('appointmentManagement.notesPlaceholder', 'Triệu chứng, yêu cầu đặc biệt...')} />
              </div>
            </div>

            <div className={`flex gap-3 p-6 border-t ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              {isViewMode ? (
                <>
                  {editingAppointment?.status === 'Pending' && (
                    <>
                      <button
                        onClick={handleConfirmFromModal}
                        disabled={confirmLoading}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {confirmLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('appointmentManagement.confirming', 'Đang xác nhận...')}
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            {t('appointmentManagement.confirm', 'Xác nhận')}
                          </>
                        )}
                      </button>
                      <button onClick={() => { openCancelConfirmation(editingAppointment.appointmentId); setShowForm(false); }}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        {t('appointmentManagement.cancel', 'Hủy lịch')}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button onClick={() => setShowForm(false)}
                    className={`flex-1 py-3 px-4 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    {t('common.cancel', 'Hủy')}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 font-medium flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? t('appointmentManagement.processing', 'Đang xử lý...') : isCreateMode ? t('appointmentManagement.createButton', 'Tạo lịch hẹn') : t('appointmentManagement.saveChanges', 'Lưu thay đổi')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transition-colors duration-300`}>
            <XCircle className="w-16 mx-auto mb-4 text-red-500" />
            <h3 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('appointmentManagement.cancelConfirmTitle', 'Hủy lịch hẹn này?')}</h3>
            <p className={`mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('appointmentManagement.cancelConfirmText', 'Lịch hẹn sẽ được chuyển sang trạng thái')} <span className="font-bold text-red-600">{t('appointmentManagement.statusCancelled', 'Đã hủy')}</span>.<br />
              {t('appointmentManagement.cancelConfirmQuestion', 'Bạn có chắc chắn muốn tiếp tục?')}
            </p>
            <div className="flex gap-4">
              <button onClick={handleCancelAppointment} disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-70">
                {cancelLoading ? t('appointmentManagement.processing', 'Đang xử lý...') : t('appointmentManagement.confirmCancel', 'Xác nhận hủy')}
              </button>
              <button onClick={() => { setShowCancelConfirmation(false); setCancelTargetId(null); }} disabled={cancelLoading}
                className={`flex-1 py-3 rounded-lg font-bold transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                {t('appointmentManagement.keep', 'Giữ lại')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}