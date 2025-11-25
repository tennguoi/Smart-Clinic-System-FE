// src/components/receptionist/AppointmentsSection.jsx
import { useEffect, useState } from 'react';
import {
  Plus, X, Calendar, User, Phone, Mail, FileText,
  Loader2, Search, Check, Edit2, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
  const [searchQueryAppointments, setSearchQueryAppointments] = useState('');
  const pageSize = 10;

  // Load appointments
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/api/appointments', {
          params: {
            status: selectedStatus,
            page: currentPage,
            size: pageSize,
            keyword: searchQueryAppointments.trim() || null,
          },
        });
        setAppointments(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      } catch (err) {
        setError('Không thể tải lịch hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedStatus, currentPage, searchQueryAppointments]);

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
        setError('Không thể tải danh sách dịch vụ');
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

  const handleOpenEdit = (appt) => {
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

  const handleSubmit = async () => {
    if (!form.patientName.trim()) return setError('Vui lòng nhập họ tên');
    if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại');
    if (!form.appointmentTime) return setError('Vui lòng chọn thời gian');
    if (form.selectedServices.length === 0)
      return setError('Vui lòng chọn ít nhất 1 dịch vụ');

    setSubmitting(true);
    setError('');
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
        await axiosInstance.put(
          `/api/appointments/${editingAppointment.appointmentId}`,
          payload
        );
        setSuccess('Cập nhật thành công!');
      } else {
        const res = await axiosInstance.post('/api/appointments', payload);
        setSuccess(`Tạo thành công! Mã lịch: ${res.data.appointmentCode}`);
      }

      setShowForm(false);

      // Refresh danh sách
      const refreshed = await axiosInstance.get('/api/appointments', {
        params: {
          status: selectedStatus,
          page: currentPage,
          size: pageSize,
          keyword: searchQueryAppointments.trim() || null,
        },
      });
      setAppointments(refreshed.data.content || []);
      setTotalPages(refreshed.data.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, {
        params: { status: 'Confirmed' },
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointmentId === id ? { ...a, status: 'Confirmed' } : a
        )
      );
      setSuccess('Đã xác nhận');
    } catch {
      setError('Xác nhận thất bại');
    }
  };

  const handleCancel = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, {
        params: { status: 'Cancelled' },
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.appointmentId === id ? { ...a, status: 'Cancelled' } : a
        )
      );
      setSuccess('Đã hủy');
    } catch {
      setError('Hủy thất bại');
    }
  };

  const handleClearSearch = () => {
    setSearchQueryAppointments('');
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedStatus('Pending');
    setSearchQueryAppointments('');
    setCurrentPage(0);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4 p-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {start > 0 && (
          <>
            <button onClick={() => setCurrentPage(0)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              1
            </button>
            {start > 1 && <span className="px-3 py-2 text-gray-500">..</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page + 1}
          </button>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <span className="px-3 py-2 text-gray-500">..</span>}
            <button onClick={() => setCurrentPage(totalPages - 1)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý lịch hẹn
        </h2>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo lịch hẹn mới
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên bệnh nhân hoặc số điện thoại..."
                value={searchQueryAppointments}
                onChange={(e) => {
                  setSearchQueryAppointments(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQueryAppointments && (
                <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Chờ xác nhận</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  STT
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mã lịch
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    Chưa có lịch hẹn nào
                  </td>
                </tr>
              ) : (
                appointments.map((a, index) => {
                  const rowNumber = currentPage * pageSize + index + 1;

                  return (
                    <tr key={a.appointmentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 text-center">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{a.patientName}</div>
                            <div className="text-xs text-gray-500">{a.phone}</div>
                          </div>
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
                            a.services.map((svc, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
                              >
                                {svc.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa chọn dịch vụ</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {a.appointmentCode}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                            a.status === 'Confirmed'
                              ? 'bg-green-100 text-green-700'
                              : a.status === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {a.status === 'Pending' ? 'Chờ xác nhận' : a.status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {a.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleOpenEdit(a)} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                              <Edit2 className="w-4 h-4" /> Sửa
                            </button>
                            <button onClick={() => handleConfirm(a.appointmentId)} className="text-green-600 hover:text-green-800 font-medium">
                              Xác nhận
                            </button>
                            <button onClick={() => handleCancel(a.appointmentId)} className="text-red-600 hover:text-red-800 font-medium">
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Không khả dụng</span>
                        )}
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

      {/* MODAL FORM - giữ nguyên như cũ */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {editingAppointment ? (
                  <>
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    Sửa lịch hẹn
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    Tạo lịch hẹn mới
                  </>
                )}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Họ tên + SĐT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.patientName}
                    onChange={(e) =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              {/* Email + thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (tùy chọn)
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian hẹn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.appointmentTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appointmentTime: e.target.value,
                      })
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dịch vụ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dịch vụ <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={searchQueryServices}
                    onChange={(e) =>
                      setSearchQueryServices(e.target.value)
                    }
                    placeholder="Tìm kiếm dịch vụ..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-gray-50">
                  {loadingServices ? (
                    <div className="p-6 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Đang tải danh sách dịch vụ...
                    </div>
                  ) : (
                    filteredServices.map((svc) => {
                      const isSelected = form.selectedServices.some(
                        (s) => s.id === svc.id
                      );
                      return (
                        <div
                          key={svc.id}
                          onClick={() => toggleService(svc)}
                          className={`p-4 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-white ${
                            isSelected
                              ? 'bg-purple-50 border-l-4 border-l-purple-600'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {svc.name}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {formatPrice(svc.price)}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-6 h-6 text-purple-600" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {form.selectedServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.selectedServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {svc.name}
                        <button
                          onClick={() => toggleService(svc)}
                          className="hover:bg-purple-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Triệu chứng, yêu cầu đặc biệt..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium inline-flex items-center justify-center gap-2"
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {submitting
                  ? 'Đang xử lý...'
                  : editingAppointment
                  ? 'Lưu thay đổi'
                  : 'Tạo lịch hẹn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
