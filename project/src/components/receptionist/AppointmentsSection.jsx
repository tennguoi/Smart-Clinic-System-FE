// src/components/receptionist/AppointmentsSection.jsx
import { useEffect, useState } from 'react';
import {
  Plus, X, Calendar, User, Phone, Mail, FileText,
  Loader2, Search, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit2, Check, Trash2, Clock, Eye
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import axiosInstance from '../../utils/axiosConfig';
import CountBadge from '../common/CountBadge';

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

export default function AppointmentsSection() {
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  
  // Date filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'view', 'edit'
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQueryServices, setSearchQueryServices] = useState('');

  const [form, setForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    appointmentTime: '',
    notes: '',
    selectedServices: [],
  });

  // Pagination + search
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQueryAppointments, setSearchQueryAppointments] = useState('');
  const pageSize = 10;

  // Load appointments
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
        
        // Client-side date filtering
        if (filterStartDate) {
          data = data.filter(appt => {
            if (!appt.appointmentTime) return false;
            const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
            return apptDate >= filterStartDate;
          });
        }
        
        if (filterEndDate) {
          data = data.filter(appt => {
            if (!appt.appointmentTime) return false;
            const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
            return apptDate <= filterEndDate;
          });
        }
        
        setAppointments(data);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      } catch (err) {
        toast.error('Không thể tải lịch hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedStatus, currentPage, searchQueryAppointments, filterStartDate, filterEndDate]);

  // Load services khi mở form
  useEffect(() => {
    if (!showForm) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await axiosInstance.get('/api/public/services?page=0&size=100');
        const normalized = (res.data.content || []).map((s) => ({ ...s, id: s.serviceId }));
        setServices(normalized);
      } catch {
        toast.error('Không thể tải danh sách dịch vụ');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [showForm]);

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchQueryServices.toLowerCase())
  );

  const toggleService = (service) => {
    setForm((prev) => {
      const exists = prev.selectedServices.some((s) => s.id === service.id);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s.id !== service.id)
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
      appointmentTime: '',
      notes: '',
      selectedServices: [],
    });
    setSearchQueryServices('');
    setShowForm(true);
  };

  const handleOpenView = (appt) => {
    setModalMode('view');
    setEditingAppointment(appt);
    const normalized = (appt.services || []).map((s) => ({ ...s, id: s.serviceId }));
    setForm({
      patientName: appt.patientName,
      phone: appt.phone,
      email: appt.email || '',
      appointmentTime: appt.appointmentTime
        ? new Date(appt.appointmentTime).toISOString().slice(0, 16)
        : '',
      notes: appt.notes || '',
      selectedServices: normalized,
    });
    setSearchQueryServices('');
    setShowForm(true);
  };

  const handleSwitchToEdit = () => {
    setModalMode('edit');
  };

  const handleSubmit = async () => {
    if (!form.patientName.trim()) return toast.error('Vui lòng nhập họ tên');
    if (!form.phone.trim()) return toast.error('Vui lòng nhập số điện thoại');
    if (form.phone.length !== 10) return toast.error('Số điện thoại phải đúng 10 chữ số');
    if (!form.appointmentTime) return toast.error('Vui lòng chọn thời gian hẹn');

    setSubmitting(true);
    try {
      const payload = {
        patientName: form.patientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        appointmentTime: form.appointmentTime,
        notes: form.notes.trim() || null,
        serviceIds: form.selectedServices.map((s) => s.id),
      };

      if (editingAppointment) {
        await axiosInstance.put(`/api/appointments/${editingAppointment.appointmentId}`, payload);
        toast.success('Cập nhật lịch hẹn thành công!');
      } else {
        const res = await axiosInstance.post('/api/appointments', payload);
        toast.success(`Tạo lịch hẹn thành công! Mã lịch: ${res.data.appointmentCode}`);
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
      
      // Apply date filters
      if (filterStartDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate >= filterStartDate;
        });
      }
      
      if (filterEndDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate <= filterEndDate;
        });
      }
      
      setAppointments(data);
      setTotalPages(refreshed.data.totalPages || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, { params: { status: 'Confirmed' } });
      setAppointments((prev) => prev.map((a) => a.appointmentId === id ? { ...a, status: 'Confirmed' } : a));
      toast.success('Đã xác nhận lịch hẹn');
    } catch {
      toast.error('Xác nhận thất bại');
    }
  };

  const handleConfirmFromModal = async () => {
    if (!editingAppointment) return;
    try {
      await axiosInstance.patch(`/api/appointments/${editingAppointment.appointmentId}/status`, null, { params: { status: 'Confirmed' } });
      toast.success('Đã xác nhận lịch hẹn');
      setShowForm(false);
      
      // Refresh data
      const refreshed = await axiosInstance.get('/api/appointments', {
        params: {
          status: selectedStatus,
          page: currentPage,
          size: pageSize,
          keyword: searchQueryAppointments.trim() || null,
        },
      });
      
      let data = refreshed.data.content || [];
      
      // Apply date filters
      if (filterStartDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate >= filterStartDate;
        });
      }
      
      if (filterEndDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate <= filterEndDate;
        });
      }
      
      setAppointments(data);
      setTotalPages(refreshed.data.totalPages || 0);
    } catch {
      toast.error('Xác nhận thất bại');
    }
  };

  const handleCancelFromModal = async () => {
    if (!editingAppointment) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    
    try {
      await axiosInstance.patch(`/api/appointments/${editingAppointment.appointmentId}/status`, null, { params: { status: 'Cancelled' } });
      toast.success('Đã hủy lịch hẹn');
      setShowForm(false);
      
      // Refresh data
      const refreshed = await axiosInstance.get('/api/appointments', {
        params: {
          status: selectedStatus,
          page: currentPage,
          size: pageSize,
          keyword: searchQueryAppointments.trim() || null,
        },
      });
      
      let data = refreshed.data.content || [];
      
      // Apply date filters
      if (filterStartDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate >= filterStartDate;
        });
      }
      
      if (filterEndDate) {
        data = data.filter(appt => {
          if (!appt.appointmentTime) return false;
          const apptDate = new Date(appt.appointmentTime).toISOString().split('T')[0];
          return apptDate <= filterEndDate;
        });
      }
      
      setAppointments(data);
      setTotalPages(refreshed.data.totalPages || 0);
    } catch {
      toast.error('Hủy lịch hẹn thất bại');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, { params: { status: 'Cancelled' } });
      setAppointments((prev) => prev.map((a) => a.appointmentId === id ? { ...a, status: 'Cancelled' } : a));
      toast.success('Đã hủy lịch hẹn');
    } catch {
      toast.error('Hủy thất bại');
    }
  };

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const maxDateTime = threeDaysLater.toISOString().slice(0, 16);

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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(0, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-2 mt-4 p-4">
        <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {start > 0 && start > 1 && <span className="px-3 py-2 text-gray-500">...</span>}

        {pages.map(page => (
          <button key={page} onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg border transition font-medium ${
              currentPage === page 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}>
            {page + 1}
          </button>
        ))}

        {end < totalPages - 1 && end < totalPages - 2 && <span className="px-3 py-2 text-gray-500">...</span>}

        <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage === totalPages - 1}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="w-9 h-9 text-blue-600" />
          <span>Quản Lý Lịch Hẹn</span>
          <CountBadge 
            currentCount={appointments.length} 
            totalCount={totalElements} 
            label="lịch hẹn" 
          />
        </h1>
        <button onClick={handleOpenAdd}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo lịch hẹn
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Tên bệnh nhân hoặc số điện thoại..."
                value={searchQueryAppointments}
                onChange={(e) => { setSearchQueryAppointments(e.target.value); setCurrentPage(0); }}
                className="w-full pl-9 pr-10 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              {searchQueryAppointments && (
                <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(0); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="Pending">Chờ xác nhận</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                if (filterEndDate && newStartDate > filterEndDate) {
                  toast.error('Từ ngày phải nhỏ hơn hoặc bằng Đến ngày');
                  return;
                }
                setFilterStartDate(newStartDate);
                setCurrentPage(0);
              }}
              max={filterEndDate || undefined}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={(e) => {
                const newEndDate = e.target.value;
                if (filterStartDate && newEndDate < filterStartDate) {
                  toast.error('Đến ngày phải lớn hơn hoặc bằng Từ ngày');
                  return;
                }
                setFilterEndDate(newEndDate);
                setCurrentPage(0);
              }}
              min={filterStartDate || undefined}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button onClick={handleClearFilters}
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium whitespace-nowrap">
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading && !showForm ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">STT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã lịch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dịch vụ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">Chưa có lịch hẹn nào</td>
                </tr>
              ) : (
                appointments.map((a, index) => {
                  const rowNumber = currentPage * pageSize + index + 1;
                  return (
                    <tr key={a.appointmentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 text-center">{rowNumber}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {a.appointmentCode}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">{a.patientName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{a.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDateTime(a.appointmentTime)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex flex-wrap gap-1.5">
                          {a.services?.length > 0 ? (
                            <>
                              {a.services.slice(0, 3).map((svc, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                  {svc.name}
                                </span>
                              ))}
                              {a.services.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                  +{a.services.length - 3} dịch vụ
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa chọn dịch vụ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                          a.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          a.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.status === 'Pending' ? 'Chờ xác nhận' : a.status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleOpenView(a)} title="Xem chi tiết"
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-blue-50/80 backdrop-blur">
              <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                {isCreateMode ? (
                  <>
                    <Plus className="w-5 h-5" />
                    Tạo lịch hẹn mới
                  </>
                ) : isViewMode ? (
                  <>
                    <Eye className="w-5 h-5" />
                    Chi tiết lịch hẹn
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5" />
                    Chỉnh sửa lịch hẹn
                  </>
                )}
              </h2>
              <div className="flex items-center gap-2">
                {isViewMode && editingAppointment?.status === 'Pending' && (
                  <button
                    onClick={handleSwitchToEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Chỉnh sửa
                  </button>
                )}
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Họ tên + SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                  <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    disabled={isViewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="tel" maxLength={10} value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    disabled={isViewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="0901234567" />
                  {form.phone && form.phone.length !== 10 && !isViewMode && (
                    <p className="text-xs text-red-600 mt-1">Số điện thoại phải đúng 10 chữ số</p>
                  )}
                </div>
              </div>

              {/* Email + Thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (tùy chọn)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={isViewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="example@gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian hẹn <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={form.appointmentTime}
                    onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                    disabled={isViewMode}
                    min={minDateTime} max={maxDateTime}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
                  {!isViewMode && <p className="text-xs text-gray-500 mt-1">Chỉ đặt được trong vòng 3 ngày tới</p>}
                </div>
              </div>

              {/* Dịch vụ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ (tùy chọn)</label>
                
                {!isViewMode && (
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchQueryServices} onChange={(e) => setSearchQueryServices(e.target.value)}
                      placeholder="Tìm kiếm dịch vụ..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                )}

                <div className={`max-h-60 overflow-y-auto border border-gray-200 rounded-md ${isViewMode ? 'bg-gray-50' : 'bg-gray-50'}`}>
                  {loadingServices ? (
                    <div className="p-6 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Đang tải danh sách dịch vụ...
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">Không tìm thấy dịch vụ nào</div>
                  ) : (
                    filteredServices.map((svc) => {
                      const isSelected = form.selectedServices.some(s => s.id === svc.id);
                      return (
                        <div key={svc.id} onClick={() => !isViewMode && toggleService(svc)}
                          className={`p-4 ${!isViewMode ? 'cursor-pointer hover:bg-white' : 'cursor-not-allowed'} border-b border-gray-100 last:border-0 transition-colors ${isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{svc.name}</div>
                              <div className="text-xs text-gray-600 mt-1">{formatPrice(svc.price)}</div>
                            </div>
                            {isSelected && <Check className="w-6 h-6 text-purple-600" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {form.selectedServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.selectedServices.map((svc) => (
                      <div key={svc.id} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                        {svc.name}
                        {!isViewMode && (
                          <button onClick={() => toggleService(svc)} className="hover:bg-purple-200 rounded-full p-0.5 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Triệu chứng, yêu cầu đặc biệt..." />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              {isViewMode ? (
                <>
                  {editingAppointment?.status === 'Pending' && (
                    <>
                      <button
                        onClick={handleConfirmFromModal}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition font-medium inline-flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Xác nhận
                      </button>
                      <button
                        onClick={handleCancelFromModal}
                        className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition font-medium inline-flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Hủy lịch
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-400 transition font-medium">
                    Đóng
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition font-medium">
                    Hủy
                  </button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center gap-2">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Đang xử lý...' : isCreateMode ? 'Tạo lịch hẹn' : 'Lưu thay đổi'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}