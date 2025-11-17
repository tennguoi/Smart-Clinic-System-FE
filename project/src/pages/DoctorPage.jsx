import { useCallback, useEffect, useMemo, useState } from 'react';
import DoctorSidebar from '../components/doctor/Sidebar';
import DoctorHeader from '../components/doctor/Header';
import ProfileSection from '../components/admin/ProfileSection';
import SecuritySection from '../components/admin/SecuritySection';
import axiosInstance from '../utils/axiosConfig';
import { authService } from '../services/authService';
import { medicalRecordApi } from '../api/medicalRecordApi';
import { Pencil, Trash2, Plus } from 'lucide-react'; // <<< 1. ĐÃ THÊM PLUS

const initialUserData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  photoUrl: '',
  twoFactorEnabled: false,
};

const persistUserData = (data) => {
  localStorage.setItem('user_info', JSON.stringify(data));
  localStorage.setItem('user', JSON.stringify(data));
};

const fallbackAppointments = [
  {
    id: 'sample-1',
    patientName: 'Nguyễn Văn A',
    time: '09:30',
    date: new Date().toISOString(),
    reason: 'Khám tổng quát',
  },
  {
    id: 'sample-2',
    patientName: 'Trần Thị B',
    time: '10:15',
    date: new Date().toISOString(),
    reason: 'Tái khám định kỳ',
  },
];

export default function DoctorPage() {
  const storedInfo = authService.getUserInfo();
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      return localStorage.getItem('doctor_active_menu') || 'schedule';
    } catch {
      return 'schedule';
    }
  });
  const [userData, setUserData] = useState(() => ({
    ...initialUserData,
    fullName: storedInfo?.fullName || '',
    email: storedInfo?.email || '',
    phone: storedInfo?.phone || '',
    dateOfBirth: storedInfo?.dob || storedInfo?.dateOfBirth || '',
    gender: storedInfo?.gender || '',
    address: storedInfo?.address || '',
    photoUrl: storedInfo?.photoUrl || '',
    twoFactorEnabled: Boolean(storedInfo?.twoFactorEnabled),
  }));

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [appointments, setAppointments] = useState(fallbackAppointments);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');





  // Hồ sơ khám bệnh (Medical Records)
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  const [formPatientId, setFormPatientId] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatmentNotes, setFormTreatmentNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formPatientName, setFormPatientName] = useState('');

  // (Toast removed)

  const fetchMyRecords = useCallback(async () => {
    setRecordsError('');
    setRecordsLoading(true);
    try {
      const list = await medicalRecordApi.listMine();
      setRecords(Array.isArray(list) ? list : []);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể tải hồ sơ khám';
      setRecordsError(msg);
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'records') {
      fetchMyRecords();
    }
  }, [activeMenu, fetchMyRecords]);

  // --- HÀM NÀY GIỮ NGUYÊN (CODE CỦA ĐỒNG ĐỘI) ---
  const handleCreateRecord = async (e) => {
    e?.preventDefault?.();
    setFormSuccess('');
    setRecordsError('');
    if (!formDiagnosis || !formDiagnosis.trim()) {
      setRecordsError('Chẩn đoán (diagnosis) là bắt buộc');
      return;
    }
    setFormSubmitting(true);
    try {
      const created = await medicalRecordApi.create({
        // Hiện chỉ gửi diagnosis và ghi chú; patientId để null (tùy chọn)
        patientId: null,
        diagnosis: formDiagnosis.trim(),
        treatmentNotes: formTreatmentNotes?.trim() || '',
      });
      setFormSuccess('Tạo hồ sơ khám thành công!');
      // Hiển thị tên bệnh nhân vừa nhập ở UI (vì backend không lưu patientName)
      const createdWithName = {
        ...created,
        patientName: (formPatientName && formPatientName.trim()) || created.patientName || null,
      };
      setRecords((prev) => [createdWithName, ...(Array.isArray(prev) ? prev : [])]);
      setFormPatientId('');
      setFormPatientName('');
      setFormDiagnosis('');
      setFormTreatmentNotes('');
      setShowCreateForm(false);
      setTimeout(() => setFormSuccess(''), 2500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Tạo hồ sơ khám thất bại';
      setRecordsError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // ... (Các hàm handleLogout, handleFieldChange, ... giữ nguyên) ...
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.logout();
      window.location.href = '/login';
    }
  };

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    try {
      const payload = {
        fullName: userData.fullName,
        phone: userData.phone,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
      };
      const { data } = await axiosInstance.post('/api/auth/update-profile', payload);
      if (data?.success) {
        setProfileSuccess('Cập nhật hồ sơ thành công!');
        persistUserData(userData);
        setTimeout(() => setProfileSuccess(''), 2500);
      } else {
        throw new Error(data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật hồ sơ';
      setProfileError(message);
    }
  };

  const handlePhotoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('photo', file);

      setProfileError('');
      setProfileSuccess('');
      try {
        const { data } = await axiosInstance.post('/api/auth/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data?.success) {
          setUserData((prev) => {
            const updated = { ...prev, photoUrl: data.data };
            persistUserData(updated);
            return updated;
          });
          setProfileSuccess('Tải ảnh lên thành công!');
          setTimeout(() => setProfileSuccess(''), 2500);
        } else {
          throw new Error(data?.message || 'Tải ảnh thất bại');
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Tải ảnh thất bại';
        setProfileError(message);
      }
    };
    input.click();
  };

  const handleToggle2FA = async () => {
    setProfileError('');
    setProfileSuccess('');
    try {
      if (userData.twoFactorEnabled) {
        const { data } = await axiosInstance.post('/api/auth/disable-2fa');
        if (data?.success) {
          setUserData((prev) => {
            const updated = { ...prev, twoFactorEnabled: false };
            persistUserData(updated);
            return updated;
          });
          setProfileSuccess('Đã tắt xác thực 2 yếu tố.');
          setTimeout(() => setProfileSuccess(''), 2500);
          return true;
        }
        throw new Error(data?.message || 'Tắt 2FA thất bại');
      } else {
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', {
          email: userData.email,
        });
        if (data?.success) {
          setProfileSuccess('Đã gửi mã OTP đến email của bạn.');
          setTimeout(() => setProfileSuccess(''), 2500);
          return true;
        }
        throw new Error(data?.message || 'Bật 2FA thất bại');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật 2FA';
      setProfileError(message);
      return false;
    }
  };

  const handleVerify2FA = async (otpCode) => {
    setProfileError('');
    setProfileSuccess('');
    try {
      const { data } = await axiosInstance.post('/api/auth/verify-2fa-enable', {
        email: userData.email,
        otpCode,
      });
      if (data?.success) {
        setUserData((prev) => {
          const updated = { ...prev, twoFactorEnabled: true };
          persistUserData(updated);
          return updated;
        });
        setProfileSuccess('Bật xác thực 2 yếu tố thành công!');
        setTimeout(() => setProfileSuccess(''), 2500);
        return true;
      }
      setProfileError(data?.message || 'Xác thực OTP thất bại');
      return false;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xác thực OTP thất bại';
      setProfileError(message);
      return false;
    }
  };

  const derivedStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter((appt) => new Date(appt.date).toDateString() === today).length;
    return {
      todayAppointments,
      totalUpcoming: appointments.length,
      weekPatients: Math.max(appointments.length - 1, 0),
    };
  }, [appointments]);

  const renderSchedule = () => (
    // ... (Code cũ, giữ nguyên) ...
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Lịch hôm nay</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{derivedStats.todayAppointments}</p>
          <p className="text-sm text-blue-700 mt-1">Cuộc hẹn đang chờ khám</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Bệnh nhân tuần này</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{derivedStats.weekPatients}</p>
          <p className="text-sm text-emerald-700 mt-1">Đã hoàn thành khám</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Lịch sắp tới</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{derivedStats.totalUpcoming}</p>
          <p className="text-sm text-purple-700 mt-1">Cuộc hẹn trong danh sách</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lịch khám sắp tới</h2>
          {appointmentsError && <span className="text-sm text-red-600">{appointmentsError}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giờ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lý do</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointmentsLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id || `${appt.patientName}-${appt.time}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{appt.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(appt.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title) => (
    // ... (Code cũ, giữ nguyên) ...
    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm">Chức năng đang được phát triển. Vui lòng quay lại sau.</p>
    </div>
  );

  const renderMedicalRecords = () => (
    // ... (Code cũ, giữ nguyên) ...
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Hồ sơ khám</h2>
            <button
              onClick={() => {
                setRecordsError('');
                setFormSuccess('');
                setShowCreateForm((v) => !v);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showCreateForm ? 'Đóng' : 'Tạo hồ sơ mới'}
            </button>
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 z-30">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setShowCreateForm(false)}
              />
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <form
                  onSubmit={handleCreateRecord}
                  className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Tạo hồ sơ mới</h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                      aria-label="Đóng"
                    >
                      ✕
                    </button>
                  </div>

                  {recordsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                      {recordsError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                      {formSuccess}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh nhân</label>
                      <input
                        type="text"
                        value={formPatientName}
                        onChange={(e) => setFormPatientName(e.target.value)}
                        placeholder="Nhập tên bệnh nhân (tùy chọn)"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chẩn đoán (bắt buộc)</label>
                      <input
                        type="text"
                        value={formDiagnosis}
                        onChange={(e) => setFormDiagnosis(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú điều trị</label>
                      <textarea
                        value={formTreatmentNotes}
                        onChange={(e) => setFormTreatmentNotes(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phác đồ, thuốc, dặn dò..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                    >
                      {formSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Hồ sơ đã tạo</h2>
          {recordsLoading && <span className="text-sm text-gray-500">Đang tải...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chẩn đoán</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chưa có hồ sơ.</td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <RecordRow
                    key={r.recordId}
                    index={idx + 1}
                    record={r}
                    onUpdated={fetchMyRecords}
                    onError={setRecordsError}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // --- COMPONENT RECORDROW (ĐÃ SỬA LẠI VỊ TRÍ) ---
  const RecordRow = ({ index, record, onUpdated, onError }) => {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [localDiagnosis, setLocalDiagnosis] = useState(record.diagnosis || '');
    const [localNotes, setLocalNotes] = useState(record.treatmentNotes || '');
    const [deleting, setDeleting] = useState(false);
    
    // <<< 1. THÊM STATE MỚI
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    const handleSave = async () => {
      if (!localDiagnosis || !localDiagnosis.trim()) {
        onError && onError('Chẩn đoán là bắt buộc');
        return;
      }
      setSaving(true);
      try {
        await medicalRecordApi.update(record.recordId, {
          diagnosis: localDiagnosis.trim(),
          treatmentNotes: localNotes?.trim() || '',
        });
        setEditing(false);
        onUpdated && onUpdated();
      } catch (e) {
        const msg = e.response?.data?.message || e.message || 'Cập nhật hồ sơ thất bại';
        onError && onError(msg);
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
      setDeleting(true);
      try {
        await medicalRecordApi.remove(record.recordId);
        onUpdated && onUpdated();
      } catch (e) {
        const msg = e.response?.data?.message || e.message || 'Xóa hồ sơ thất bại';
        onError && onError(msg);
      } finally {
        setDeleting(false);
      }
    };

    return (
      <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-600">{index}</td>
        <td className="px-6 py-4 text-sm text-gray-800">{record.patientName || record.patientId || '—'}</td>
        <td className="px-6 py-4 text-sm text-gray-800">
          {editing ? (
            <input
              type="text"
              value={localDiagnosis}
              onChange={(e) => setLocalDiagnosis(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            record.diagnosis
          )}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {editing ? (
            <input
              type="text"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            record.treatmentNotes || '—'
          )}
          {/* <<< ĐÃ XÓA MODAL CALL Ở VỊ TRÍ SAI */}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {editing ? (
            <div className="flex items-center gap-3">
              {/* <<< ĐÃ XÓA NÚT + Ở VỊ TRÍ SAI */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocalDiagnosis(record.diagnosis || '');
                  setLocalNotes(record.treatmentNotes || '');
                }}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          ) : (
            // --- ĐÂY LÀ KHỐI 'else' (KHI KHÔNG SỬA) ---
            <div className="flex items-center gap-3">
              
              {/* <<< 2. THÊM NÚT + VÀO ĐÚNG VỊ TRÍ NÀY */}
              <button
                  onClick={() => {
                    onError(null); // Xóa lỗi cũ (nếu có)
                    setShowPrescriptionModal(true); // Mở modal
                  }}
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                  aria-label="Thêm toa thuốc"
                  title="Thêm toa thuốc"
                >
                  <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                aria-label="Sửa"
                title="Sửa"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-60"
                aria-label="Xóa"
                title={deleting ? 'Đang xóa...' : 'Xóa'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* <<< 3. THÊM MODAL CALL VÀO ĐÚNG VỊ TRÍ NÀY (BÊN NGOÀI <tr>) */}
      {showPrescriptionModal && (
        <PrescriptionFormModal
          record={record}
          onError={onError} // Dùng lại state 'recordsError' của cha
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            onUpdated(); // Tải lại bảng
            setShowPrescriptionModal(false);
          }}
        />
      )}
      </>
    );
  };

  //
  // --- 4. THÊM TOÀN BỘ ĐỊNH NGHĨA MODAL VÀO ĐÂY (ĐÃ VIỆT HÓA) ---
  //
  const PrescriptionFormModal = ({ record, onClose, onSuccess, onError }) => {
    // State riêng của cái Form (Modal) này
    const [drugs, setDrugs] = useState('');
    const [instructions, setInstructions] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      onError(null); // Xóa lỗi ở component cha

      // Kiểm tra xem 2 ô đã được điền chưa
      if (!drugs.trim() || !instructions.trim()) {
        setError('Toa thuốc và Hướng dẫn sử dụng đều là bắt buộc.');
        return;
      }

      setSubmitting(true);
      try {
        // Gọi API Bước 3 (API mới của bạn)
        await medicalRecordApi.addPrescription({
          recordId: record.recordId,
          drugs: drugs.trim(),
          instructions: instructions.trim(),
        });

        setSuccess('Thêm toa thuốc thành công!');
        // Đợi 1.5 giây rồi tự động đóng modal và gọi onSuccess
        setTimeout(() => {
          onSuccess(); // Tải lại bảng
        }, 1500);

      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Thêm toa thuốc thất bại';
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-40">
        {/* Lớp nền mờ */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
        {/* Nội dung Form */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Thêm Toa thuốc cho: <span className="text-blue-600">{record.diagnosis}</span>
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Hiển thị lỗi hoặc thành công (nếu có) */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* 2 ô nhập liệu của bạn (ĐÃ SỬA) */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Toa thuốc</label>
                <textarea
                  value={drugs}
                  onChange={(e) => setDrugs(e.target.value)}
                  rows={5}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên thuốc, hàm lượng, số lượng...&#10;Ví dụ:&#10;1. Paracetamol 500mg (10 viên)&#10;2. Amoxicillin 500mg (14 viên)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hướng dẫn sử dụng</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={5}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập liều dùng, cách dùng...&#10;Ví dụ:&#10;1. Uống 1 viên/lần, 3 lần/ngày sau ăn.&#10;2. Uống 1 viên/lần, 2 lần/ngày sau ăn."
                />
              </div>
            </div>

            {/* Nút Hủy và Lưu */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Toa thuốc'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- KẾT THÚC ĐỊNH NGHĨA MODAL ---

  const renderProfileSection = () => (
    // ... (Code cũ, giữ nguyên) ...
    <div className="space-y-6">
      {profileError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {profileError}
        </div>
      )}
      {profileSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}
      {profileLoading ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center text-gray-500">
          Đang tải hồ sơ...
        </div>
      ) : (
        <>
          <ProfileSection
            fullName={userData.fullName}
            email={userData.email}
            phone={userData.phone}
            dateOfBirth={userData.dateOfBirth}
            gender={userData.gender}
            address={userData.address}
            photoUrl={userData.photoUrl}
            onPhotoChange={handlePhotoChange}
            onChange={handleFieldChange}
          />
          <div className="flex justify-end">
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Cập nhật thông tin
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSecuritySection = () => (
    // ... (Code cũ, giữ nguyên) ...
    <div className="space-y-6">
      {profileError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {profileError}
        </div>
      )}
      {profileSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}
      <SecuritySection
        twoFactorEnabled={userData.twoFactorEnabled}
        onToggle2FA={handleToggle2FA}
        onVerify2FA={handleVerify2FA}
        onChangePassword={() => {}}
      />
    </div>
  );

  const doctorName = useMemo(() => userData.fullName, [userData.fullName]);

  useEffect(() => {
    try {
      localStorage.setItem('doctor_active_menu', activeMenu);
    } catch {}
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <DoctorHeader onLogout={handleLogout} fullName={doctorName} />

        <main className="flex-1 p-8 space-y-8">
          {activeMenu === 'schedule' && renderSchedule()}
          {activeMenu === 'patients' && renderPlaceholder('Danh sách bệnh nhân')}
          {activeMenu === 'prescriptions' && renderPlaceholder('Quản lý đơn thuốc')}
          {activeMenu === 'records' && renderMedicalRecords()}
          {activeMenu === 'invoices' && renderPlaceholder('Quản lý hóa đơn')}
          {activeMenu === 'profile' && renderProfileSection()}
          {activeMenu === 'security' && renderSecuritySection()}
        </main>
      </div>
    </div>
  );
}