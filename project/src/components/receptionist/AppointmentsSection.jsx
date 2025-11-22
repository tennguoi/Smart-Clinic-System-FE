// src/components/admin/AppointmentsSection.jsx
import { useEffect, useState } from 'react';
import {
  Plus, X, Calendar, User, Phone, Mail, FileText,
  Loader2, Search, Check, Edit2, Clock, CheckCircle2, XCircle
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
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    patientName: '', phone: '', email: '', appointmentTime: '', notes: '', selectedServices: []
  });

  // Load appointments
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/appointments', { params: { status: selectedStatus } });
        setAppointments(res.data || []);
      } catch {
        setError('Không thể tải lịch hẹn');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedStatus]);

  // Load services khi mở form
  useEffect(() => {
    if (!showForm) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await axiosInstance.get('/api/public/services?page=0&size=100');
        const normalized = (res.data.content || []).map(s => ({ ...s, id: s.serviceId }));
        setServices(normalized);
      } catch {
        setError('Không thể tải danh sách dịch vụ');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [showForm]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleService = (service) => {
    setForm(prev => {
      const exists = prev.selectedServices.some(s => s.id === service.id);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter(s => s.id !== service.id)
          : [...prev.selectedServices, service]
      };
    });
  };

  const handleOpenAdd = () => {
    setEditingAppointment(null);
    setForm({ patientName: '', phone: '', email: '', appointmentTime: '', notes: '', selectedServices: [] });
    setSearchQuery('');
    setShowForm(true);
  };

  const handleOpenEdit = (appt) => {
    setEditingAppointment(appt);
    const normalized = (appt.services || []).map(s => ({ ...s, id: s.serviceId }));
    setForm({
      patientName: appt.patientName,
      phone: appt.phone,
      email: appt.email || '',
      appointmentTime: appt.appointmentTime ? new Date(appt.appointmentTime).toISOString().slice(0, 16) : '',
      notes: appt.notes || '',
      selectedServices: normalized
    });
    setSearchQuery('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.patientName.trim()) return setError('Vui lòng nhập họ tên');
    if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại');
    if (!form.appointmentTime) return setError('Vui lòng chọn thời gian');
    if (form.selectedServices.length === 0) return setError('Vui lòng chọn ít nhất 1 dịch vụ');

    setSubmitting(true);
    try {
      const payload = {
        patientName: form.patientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        appointmentTime: form.appointmentTime,
        notes: form.notes.trim() || null,
        serviceIds: form.selectedServices.map(s => s.id),
      };

      if (editingAppointment) {
        await axiosInstance.put(`/api/appointments/${editingAppointment.appointmentId}`, payload);
        setSuccess('Cập nhật thành công!');
      } else {
        const res = await axiosInstance.post('/api/appointments', payload);
        setSuccess(`Tạo thành công! Mã lịch: ${res.data.appointmentCode}`);
      }

      setShowForm(false);
      const refreshed = await axiosInstance.get('/api/appointments', { params: { status: selectedStatus } });
      setAppointments(refreshed.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, { params: { status: 'Confirmed' } });
      setAppointments(prev => prev.map(a => a.appointmentId === id ? { ...a, status: 'Confirmed' } : a));
      setSuccess('Đã xác nhận');
    } catch { setError('Xác nhận thất bại'); }
  };

  const handleCancel = async (id) => {
    try {
      await axiosInstance.patch(`/api/appointments/${id}/status`, null, { params: { status: 'Cancelled' } });
      setAppointments(prev => prev.map(a => a.appointmentId === id ? { ...a, status: 'Cancelled' } : a));
      setSuccess('Đã hủy');
    } catch { setError('Hủy thất bại'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
            <p className="text-gray-600 mt-2 text-lg">Theo dõi và xử lý lịch khám nhanh chóng</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-6 py-3.5 bg-white border border-gray-300 rounded-2xl text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
            >
              <option value="Pending">Chờ xác nhận</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Tạo lịch hẹn mới
            </button>
          </div>
        </div>

        {/* Alert */}
        {success && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3">
            <XCircle className="w-6 h-6" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thời gian</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dịch vụ</th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mã lịch</th>
                  <th className="px-8 py-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-8 py-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-24">
                      <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto" />
                      <p className="mt-4 text-gray-600 text-lg">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-24 text-gray-500 text-xl font-medium">
                      Chưa có lịch hẹn nào
                    </td>
                  </tr>
                ) : (
                  appointments.map(a => (
                    <tr key={a.appointmentId} className="hover:bg-gray-50/50 transition-all duration-200">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-7 h-7 text-blue-700" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{a.patientName}</div>
                            <div className="text-sm text-gray-600 mt-1">{a.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <div className="flex items-center gap-2 text-gray-800">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">{formatDateTime(a.appointmentTime)}</span>
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <div className="flex flex-wrap gap-2">
                          {a.services && a.services.length > 0 ? (
                            a.services.map((svc, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full border border-purple-200 shadow-sm"
                              >
                                {svc.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Chưa chọn dịch vụ</span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-7">
                        <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 font-mono text-sm font-bold rounded-xl border border-blue-200">
                          {a.appointmentCode}
                        </span>
                      </td>

                      <td className="px-8 py-7 text-center">
                        <span className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold border-2 ${
                          a.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : a.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>
                          {a.status === 'Pending' ? 'Chờ xác nhận' :
                           a.status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                        </span>
                      </td>

                      <td className="px-8 py-7 text-center">
                        {a.status === 'Pending' && (
                          <div className="flex items-center justify-center gap-5">
                            <button onClick={() => handleOpenEdit(a)} className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 transition">
                              <Edit2 className="w-4.5 h-4.5" /> Sửa
                            </button>
                            <button onClick={() => handleConfirm(a.appointmentId)} className="text-emerald-600 hover:text-emerald-800 font-medium transition">
                              Xác nhận
                            </button>
                            <button onClick={() => handleCancel(a.appointmentId)} className="text-red-600 hover:text-red-800 font-medium transition">
                              Hủy
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM - ĐẸP VL, HIỆN ĐẠI, ĐẦY ĐỦ CHỨC NĂNG */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-3xl">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {editingAppointment ? <><Edit2 className="w-6 h-6 text-indigo-600" /> Sửa lịch hẹn</> : <><Plus className="w-6 h-6 text-blue-600" /> Tạo lịch hẹn mới</>}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 transition">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-5 h-5" /> Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.patientName}
                      onChange={e => setForm({ ...form, patientName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-5 h-5" /> Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                      placeholder="0901234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-5 h-5" /> Email (tùy chọn)
                    </label>
                    <input
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 transition"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-5 h-5" /> Thời gian hẹn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.appointmentTime}
                      onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Dịch vụ */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    Dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm dịch vụ..."
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                    {loadingServices ? (
                      <div className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-400" /></div>
                    ) : filteredServices.map(svc => {
                      const isSelected = form.selectedServices.some(s => s.id === svc.id);
                      return (
                        <div
                          key={svc.id}
                          onClick={() => toggleService(svc)}
                          className={`p-5 cursor-pointer transition-all hover:bg-white border-b border-gray-100 last:border-0 ${
                            isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{svc.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatPrice(svc.price)}
                              </div>
                            </div>
                            {isSelected && <Check className="w-7 h-7 text-purple-600" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {form.selectedServices.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {form.selectedServices.map(svc => (
                        <div key={svc.id} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                          {svc.name}
                          <button onClick={() => toggleService(svc)} className="hover:bg-purple-200 rounded-full p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-5 h-5" /> Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 resize-none transition"
                    placeholder="Triệu chứng, yêu cầu đặc biệt..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 p-6 border-t bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-3 transition"
                >
                  {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {submitting ? 'Đang xử lý...' : editingAppointment ? 'Lưu thay đổi' : 'Tạo lịch hẹn'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}