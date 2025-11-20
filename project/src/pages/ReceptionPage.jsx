import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/ReceptionSidebar';
import SearchFilter from '../components/receptionist/SearchFilter';
import PatientForm from '../components/receptionist/PatientForm';
import QueueTable from '../components/receptionist/QueueTable';
import RoomAssignModal from '../components/receptionist/RoomAssignModal';
import ProfileSection from '../components/admin/ProfileSection';
import SecuritySection from '../components/admin/SecuritySection';
import ClinicRoomManagement from '../components/receptionist/ClinicRoomManagement';
import { queueApi, userApi } from '../api/receptionApi';
import { serviceApi } from '../api/serviceApi';
import { authService } from '../services/authService';
import axiosInstance from '../utils/axiosConfig';

// ------------------ CONSTANTS ------------------
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

const emptyPatientForm = {
  patientName: '',
  phone: '',
  email: '',
  dob: '',
  gender: '',
  address: '',
  priority: 'Normal',
  checkInTime: '',
};

// ------------------ HELPER FUNCTIONS ------------------

const normalizeStatus = (status) => {
  if (!status) return 'Waiting';

  const s = String(status).toLowerCase().trim();

  // Không xóa dấu nữa! Giữ nguyên tiếng Việt có dấu để so sánh chính xác
  if (s.includes('đang khám') || s.includes('inprogress') || s === 'inprogress') {
    return 'InProgress';
  }
  if (s.includes('hoàn tất') || s.includes('completed') || s === 'completed') {
    return 'Completed';
  }
  if (s.includes('hủy') || s.includes('cancelled') || s === 'cancelled') {
    return 'Cancelled';
  }
  if (s.includes('đang chờ') || s.includes('waiting') || s === 'waiting') {
    return 'Waiting';
  }

  return 'Waiting'; // fallback
};
const persistUserData = (data) => {
  localStorage.setItem('user_info', JSON.stringify(data));
  localStorage.setItem('user', JSON.stringify(data));
};

const sortQueueByPriority = (list) => {
  const priorityOrder = {
    'Emergency': 3, 'Urgent': 2, 'Normal': 1,
    'Khẩn cấp': 3, 'Ưu tiên': 2, 'Thường': 1
  };

  return list.slice().sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;
    const diff = priorityB - priorityA;
    if (diff !== 0) return diff;
    return new Date(a.checkInTime) - new Date(b.checkInTime);
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch (error) {
    return value;
  }
};

// *** MỚI THÊM: Hàm chuyên format ngày sinh sang dd/mm/yyyy ***
const formatDateOfBirth = (dateString) => {
  if (!dateString) return '';
  try {
    // Tạo đối tượng Date từ chuỗi (ISO hoặc yyyy-mm-dd)
    const date = new Date(dateString);
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) return dateString;

    // Format sang tiếng Việt: ngày/tháng/năm
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

// ------------------ MAIN COMPONENT ------------------
export default function ReceptionPage() {
  const [activeMenu, setActiveMenu] = useState(() => {
    const saved = localStorage.getItem('activeMenu');
    return saved || 'appointments';
  });
  const navigate = useNavigate();

  // ========== USER PROFILE STATE ==========
  const [userData, setUserData] = useState(initialUserData);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // ========== APPOINTMENTS STATE ==========
  const [appointments, setAppointments] = useState([]);
  const [serviceLookup, setServiceLookup] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null); // 🆕 Thêm state cho hủy lịch hẹn

  // ========== QUEUE STATE ==========
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  
const [filterStatus, setFilterStatus] = useState(''); // ← ĐỂ RỖNG = XEM TẤT CẢ

  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);

  // ========== ROOM ASSIGN STATE ==========
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
  }, [activeMenu]);

  // ================= LOAD PROFILE =================
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const data = await userApi.getProfile();
      const mapped = {
        fullName: data?.fullName || '',
        email: data?.email || '',
        phone: data?.phone || '',
        dateOfBirth: data?.dob || '', // Lưu ý: Profile Form cần yyyy-mm-dd để input hiển thị đúng
        gender: data?.gender || '',
        address: data?.address || '',
        photoUrl: data?.photoUrl || '',
        twoFactorEnabled: Boolean(data?.twoFactorEnabled),
      };
      setUserData(mapped);
      persistUserData(mapped);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể tải hồ sơ.';
      setProfileError(message);
      if (error.response?.status === 401) {
        authService.logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  // ================= LOAD APPOINTMENTS =================
  useEffect(() => {
    if (activeMenu !== 'appointments') return;
    let ignore = false;

    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      setAppointmentsError('');
      try {
        const response = await axiosInstance.get('/api/appointments', {
          params: { status: selectedStatus },
        });
        if (!ignore) {
          setAppointments(response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          const message = error.response?.data?.message || error.message || 'Không thể tải danh sách lịch hẹn.';
          setAppointmentsError(`Lỗi: ${message}`);
        }
      } finally {
        if (!ignore) {
          setLoadingAppointments(false);
        }
      }
    };

    fetchAppointments();
    return () => { ignore = true; };
  }, [activeMenu, selectedStatus]);

  // Load services once so we can map serviceIds -> service name for display
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await serviceApi.getAllServices(0, 200);
        if (ignore) return;
        const map = {};
        (data.services || []).forEach((s) => {
          if (s?.serviceId) map[s.serviceId] = s.name || s.serviceId;
        });
        setServiceLookup(map);
      } catch (err) {
        // ignore service load errors; we'll show ids instead
        console.error('Failed to load services lookup', err);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const handleConfirmAppointment = async (appointmentId) => {
    setConfirmingId(appointmentId);
    setAppointmentsError('');
    setSuccessMessage('');
    try {
      await axiosInstance.patch(`/api/appointments/${appointmentId}/status`, null, {
        params: { status: 'Confirmed' },
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointmentId === appointmentId
            ? { ...appt, status: 'Confirmed', confirmedAt: new Date().toISOString() }
            : appt
        )
      );
      setSuccessMessage('Lịch hẹn đã được xác nhận và email đã gửi cho bệnh nhân.');
    } catch (error) {
      setAppointmentsError(
        error.response?.data?.message || 'Xác nhận lịch hẹn thất bại. Vui lòng thử lại.'
      );
    } finally {
      setConfirmingId(null);
    }
  };

  // 🆕 THÊM HÀM HỦY LỊCH HẸN
  const handleCancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    setAppointmentsError('');
    setSuccessMessage('');
    try {
      await axiosInstance.patch(`/api/appointments/${appointmentId}/status`, null, {
        params: { status: 'Cancelled' },
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointmentId === appointmentId
            ? { ...appt, status: 'Cancelled', cancelledAt: new Date().toISOString() }
            : appt
        )
      );
      setSuccessMessage('Lịch hẹn đã được hủy thành công.');
    } catch (error) {
      setAppointmentsError(
        error.response?.data?.message || 'Hủy lịch hẹn thất bại. Vui lòng thử lại.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ================= QUEUE MANAGEMENT =================

  const fetchQueueData = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
if (filterStatus && filterStatus !== '' && filterStatus !== 'All') {
    params.status = filterStatus;
}

      const data = await queueApi.searchQueue(params);
      
      const mappedData = (data || []).map((item) => ({
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        patientName: item.patientName,
        phone: item.phone,
        email: item.email,
        
        // *** ÁP DỤNG FORMAT NGÀY SINH TẠI ĐÂY ***
        // Dữ liệu này để hiển thị trên Table -> cần format dd/mm/yyyy
        dob: formatDateOfBirth(item.dob), 
        
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: normalizeStatus(item.status || item.queueStatus),
        checkInTime: item.checkInTime,
        assignedRoomId: item.assignedRoomId || item.assignedRoom?.roomId || null,
        assignedRoomName: item.assignedRoomName || item.assignedRoom?.roomName || null,
      }));
      
      setQueueList(sortQueueByPriority(mappedData));
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân.';
      setQueueError(message);
    } finally {
      setLoadingQueue(false);
    }
  }, [searchPhone, filterStatus]);

  useEffect(() => {
    if (activeMenu === 'records') {
      fetchQueueData();
    }
  }, [activeMenu, filterStatus, fetchQueueData]);

  const handleSearchClick = () => {
    fetchQueueData();
  };

  const handleClearFilters = () => {
    setSearchPhone('');
    setFilterStatus('Waiting');
  };

  const updateLocalQueueStatus = (queueId, newStatus) => {
    const standardizedStatus = normalizeStatus(newStatus);
    setQueueList((prevList) => {
      if (filterStatus && normalizeStatus(filterStatus) !== standardizedStatus && filterStatus !== '') {
        return prevList.filter((p) => p.queueId !== queueId);
      }
      const updatedList = prevList.map((p) =>
        p.queueId === queueId ? { ...p, status: standardizedStatus } : p
      );
      return sortQueueByPriority(updatedList);
    });
  };

  // ================= QUEUE FORM HANDLERS =================
  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setPatientForm((prev) => ({ ...prev, [field]: numericValue }));
    } else {
      setPatientForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddPatient = () => {
    setPatientForm({
      ...emptyPatientForm,
      status: 'Waiting',
    });
    setEditPatientId(null);
    setShowForm(true);
  };

  const handleEditPatient = async (patient) => {
    try {
      // Gọi API lấy chi tiết để có dữ liệu gốc (yyyy-mm-dd) cho Form sửa
      const full = await queueApi.getQueueDetail(patient.queueId);
      setPatientForm({
        patientName: full.patientName || '',
        phone: full.phone || '',
        email: full.email || '',
        
        // *** LƯU Ý QUAN TRỌNG ***
        // Ở đây ta KHÔNG dùng formatDateOfBirth. 
        // Form input type="date" bắt buộc cần yyyy-mm-dd (VD: 2025-11-18) mới hiển thị đúng.
        dob: full.dob || '', 
        
        gender: full.gender || '',
        address: full.address || '',
        priority: full.priority || 'Normal',
        checkInTime: full.checkInTime || '',
        status: normalizeStatus(full.status),
      });
      setEditPatientId(full.queueId);
      setShowForm(true);
    } catch (err) {
      toast.error('Không tải được thông tin chi tiết!');
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await queueApi.deletePatient(patientId);
      setQueueList((prev) => prev.filter((p) => p.queueId !== patientId));
      toast.success('Đã xoá bệnh nhân!');
    } catch {
      toast.error('Không thể xoá bệnh nhân!');
    }
  };

  const handleSubmitForm = async () => {
    try {
      if (!editPatientId) {
        const now = new Date();
        patientForm.checkInTime = now.toISOString();
      }

      if (patientForm.phone.length !== 10) {
        toast.error('Số điện thoại phải đúng 10 chữ số!');
        return;
      }

      if (editPatientId) {
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        const newStatus = normalizeStatus(res.status || patientForm.status);
        
        setQueueList((prev) => {
          if (filterStatus && normalizeStatus(filterStatus) !== newStatus && filterStatus !== '') {
             return prev.filter(p => p.queueId !== editPatientId);
          }
          return sortQueueByPriority(
            prev.map((p) => (p.queueId === editPatientId ? { 
                ...p, 
                ...res, 
                queueId: editPatientId, 
                status: newStatus,
                // Khi update xong, cập nhật lại hiển thị trên bảng là dd/mm/yyyy
                dob: formatDateOfBirth(res.dob) 
            } : p))
          );
        });
        toast.success('Cập nhật bệnh nhân thành công!');
      } else {
        const res = await queueApi.addPatient(patientForm);
        const newStatus = normalizeStatus(res.status || 'Waiting');
        
        if (!filterStatus || normalizeStatus(filterStatus) === newStatus) {
            // Khi thêm mới xong, hiển thị trên bảng là dd/mm/yyyy
            const newItemFormatted = {
                ...res,
                status: newStatus,
                dob: formatDateOfBirth(res.dob)
            };
            setQueueList((prev) => sortQueueByPriority([...prev, newItemFormatted]));
        }
        toast.success('Thêm bệnh nhân thành công!');
      }

      setShowForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra!';
      toast.error(errorMessage);
    }
  };

  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await queueApi.updateStatus(queueId, status);
      updateLocalQueueStatus(queueId, status);
      toast.success(`Cập nhật trạng thái thành công!`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái!';
      toast.error(errorMessage);
    }
  };

  // ================= ROOM ASSIGN HANDLERS =================
  const handleAssignRoom = (patient) => {
    setSelectedPatient(patient);
    setShowRoomModal(true);
  };

  const handleRoomAssigned = async () => {
  await fetchQueueData(); // Đảm bảo trạng thái mới nhất: InProgress + phòng đã gán
  toast.success('Phân phòng thành công!');
};

  // ================= PROFILE HANDLERS =================
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
        dob: userData.dateOfBirth, // Gửi lên server
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
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', { email: userData.email });
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

  const receptionistName = useMemo(() => userData.fullName, [userData.fullName]);

  // ... (Render Appointments Section - ĐÃ CẬP NHẬT THÊM NÚT HỦY)

  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">📅 Quản lý lịch hẹn</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            Trạng thái
          </label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {appointmentsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {appointmentsError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã lịch
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Dịch vụ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingAppointments ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                  Đang tải dữ liệu lịch hẹn...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                  Không có lịch hẹn nào cho trạng thái hiện tại.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{appointment.patientName}</div>
                    <div className="text-xs text-gray-500">Tạo lúc {formatDateTime(appointment.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{appointment.phone}</div>
                    <div className="text-xs text-blue-600">{appointment.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(appointment.appointmentTime)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="text-sm text-gray-800">{appointment.appointmentCode || '—'}</div>
                    <div className="text-xs text-gray-400">ID: {appointment.appointmentId ? String(appointment.appointmentId).slice(0, 8) : '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(() => {
                      const raw = appointment.serviceIds;
                      const ids = Array.isArray(raw)
                        ? raw
                        : raw
                        ? String(raw).split(',').map((s) => s.trim()).filter(Boolean)
                        : [];
                      return ids.length > 0 ? (
                        <div className="text-sm text-gray-700">{ids.map((id) => serviceLookup[id] || id).join(', ')}</div>
                      ) : (
                        <div className="text-gray-400">Không có</div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                    {appointment.notes || <span className="text-gray-400">Không có</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {appointment.status === 'Pending'
                        ? 'Chờ xác nhận'
                        : appointment.status === 'Confirmed'
                        ? 'Đã xác nhận'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {appointment.status === 'Pending' ? (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleConfirmAppointment(appointment.appointmentId)}
                          disabled={confirmingId === appointment.appointmentId}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                        >
                          {confirmingId === appointment.appointmentId ? 'Đang xác nhận...' : 'Xác nhận'}
                        </button>
                        {/* 🆕 THÊM NÚT HỦY CHO LỊCH ĐANG CHỜ */}
                        <button
                          onClick={() => handleCancelAppointment(appointment.appointmentId)}
                          disabled={cancellingId === appointment.appointmentId}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                        >
                          {cancellingId === appointment.appointmentId ? 'Đang hủy...' : 'Hủy lịch'}
                        </button>
                      </div>
                    ) : appointment.status === 'Confirmed' ? (
                      <div className="flex flex-col space-y-2">
                        <div className="text-xs text-gray-500">
                          Xác nhận lúc {formatDateTime(appointment.confirmedAt)}
                        </div>
                        {/* 🆕 THÊM NÚT HỦY CHO LỊCH ĐÃ XÁC NHẬN */}
                        <button
                          onClick={() => handleCancelAppointment(appointment.appointmentId)}
                          disabled={cancellingId === appointment.appointmentId}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                        >
                          {cancellingId === appointment.appointmentId ? 'Đang hủy...' : 'Hủy lịch'}
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Đã hủy lúc {formatDateTime(appointment.cancelledAt)}
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
  );

  // ... (Các phần render khác giữ nguyên)
  const renderQueueSection = () => (
    <div className="space-y-4">
      <SearchFilter
        searchPhone={searchPhone}
        filterStatus={filterStatus}
        onSearchPhoneChange={setSearchPhone}
        onFilterStatusChange={setFilterStatus}
        onSearch={handleSearchClick}
        onClear={handleClearFilters}
        onAddPatient={handleAddPatient}
      />

      {loadingQueue ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu bệnh nhân...</div>
      ) : (
        <QueueTable
          queueList={queueList}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onStatusChange={handleQuickUpdateStatus}
          onAssignRoom={handleAssignRoom}
        />
      )}

      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={!!editPatientId}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showRoomModal && selectedPatient && (
        <RoomAssignModal
          patient={selectedPatient}
          onClose={() => {
            setShowRoomModal(false);
            setSelectedPatient(null);
          }}
          onAssign={handleRoomAssigned}
        />
      )}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );

  const renderProfileSection = () => (
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

  // ================= MAIN RENDER =================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ReceptionSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <div className="flex-1 flex flex-col">
        <ReceptionHeader onLogout={handleLogout} fullName={receptionistName} />
        <main className="flex-1 p-8 space-y-8">
          {activeMenu === 'appointments' && renderAppointmentsSection()}
          {activeMenu === 'rooms' && <ClinicRoomManagement />}
          {activeMenu === 'records' && renderQueueSection()}
          {activeMenu === 'invoices' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-gray-500">
              Tính năng quản lý hóa đơn đang được phát triển.
            </div>
          )}
          {activeMenu === 'profile' && renderProfileSection()}
          {activeMenu === 'security' && renderSecuritySection()}
        </main>
      </div>
    </div>
  );
}