import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import đầy đủ icon
import { Search, Plus, X, Phone, Check, SquarePen, Trash2, Save } from 'lucide-react';

import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/Sidebar';
import SearchFilter from '../components/receptionist/SearchFilter';
import PatientForm from '../components/receptionist/PatientForm';
import QueueTable from '../components/receptionist/QueueTable';
import RoomAssignModal from '../components/receptionist/RoomAssignModal';
import ProfileSection from '../components/admin/ProfileSection';
import SecuritySection from '../components/admin/SecuritySection';
import ClinicRoomManagement from '../components/receptionist/ClinicRoomManagement';
import { queueApi, userApi } from '../api/receptionApi';
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
  checkInTime: ''
};

// ------------------ HELPER FUNCTIONS ------------------
const persistUserData = (data) => {
  localStorage.setItem('user_info', JSON.stringify(data));
  localStorage.setItem('user', JSON.stringify(data));
};

const sortQueueByPriority = (list) => {
  const priorityOrder = { Emergency: 3, Urgent: 2, Normal: 1 };
  return list.slice().sort((a, b) => {
    const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(a.checkInTime) - new Date(b.checkInTime);
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return value;
  }
};

// ------------------ MAIN COMPONENT ------------------
export default function ReceptionPage() {
  const [activeMenu, setActiveMenu] = useState('appointments');
  const navigate = useNavigate();

  // ========== USER PROFILE STATE ==========
  const [userData, setUserData] = useState(initialUserData);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // ========== APPOINTMENTS STATE ==========
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  
  // Bộ lọc tìm kiếm Appointments
  const [apptFilters, setApptFilters] = useState({
    status: 'Pending',
    phone: '',
    patientName: ''
  });

  // Modal Thêm mới Appointments
  const [showApptModal, setShowApptModal] = useState(false);
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patientName: '',
    phone: '',
    email: '',
    appointmentTime: '',
    notes: ''
  });

  // Modal Sửa Appointments
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    appointmentId: '',
    patientName: '',
    phone: '',
    email: '',
    appointmentTime: '',
    notes: ''
  });

  // ========== QUEUE STATE ==========
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);

  // ========== ROOM ASSIGN STATE ==========
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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
        dateOfBirth: data?.dob || '',
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

  // ================= APPOINTMENTS LOGIC =================

  // 1. Lấy danh sách lịch hẹn
  const fetchAppointments = useCallback(async () => {
    if (activeMenu !== 'appointments') return;

    setLoadingAppointments(true);
    setAppointmentsError('');
    
    try {
      const params = {
        status: apptFilters.status,
        ...(apptFilters.phone && { phone: apptFilters.phone }),
        ...(apptFilters.patientName && { patientName: apptFilters.patientName }),
      };

      const response = await axiosInstance.get('/api/appointments', { params });
      setAppointments(response.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn.');
    } finally {
      setLoadingAppointments(false);
    }
  }, [activeMenu, apptFilters]);

  useEffect(() => {
    if (activeMenu !== 'appointments') return;
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 500);
    return () => clearTimeout(timer);
  }, [activeMenu, apptFilters, fetchAppointments]);

  // 2. Tạo lịch hẹn mới (CÓ VALIDATE)
  const handleCreateApptSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAppt.appointmentTime) {
      toast.error("Vui lòng chọn thời gian hẹn!");
      return;
    }
    const selectedTime = new Date(newAppt.appointmentTime);
    const now = new Date();
    if (selectedTime < now) {
      toast.error("Thời gian hẹn không được ở quá khứ!");
      return; 
    }

    setIsSubmittingAppt(true);
    try {
      const payload = {
        ...newAppt,
        appointmentTime: newAppt.appointmentTime.length === 16 
          ? newAppt.appointmentTime + ":00" 
          : newAppt.appointmentTime
      };

      await axiosInstance.post('/api/appointments', payload);
      
      toast.success('Tạo lịch hẹn mới thành công!');
      setShowApptModal(false);
      setNewAppt({ patientName: '', phone: '', email: '', appointmentTime: '', notes: '' });
      
      if (apptFilters.status !== 'Pending') {
        setApptFilters(prev => ({ ...prev, status: 'Pending' }));
      } else {
        fetchAppointments();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Tạo lịch hẹn thất bại.';
      toast.error(msg);
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  // 3. Mở Modal Sửa
  const handleEditClick = (appt) => {
    let formattedTime = '';
    if (appt.appointmentTime) {
      const date = new Date(appt.appointmentTime);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      formattedTime = date.toISOString().slice(0, 16);
    }

    setEditData({
      appointmentId: appt.appointmentId,
      patientName: appt.patientName,
      phone: appt.phone,
      email: appt.email || '',
      appointmentTime: formattedTime,
      notes: appt.notes || ''
    });
    setShowEditModal(true);
  };

  // 4. Lưu Sửa Lịch Hẹn (CÓ VALIDATE)
  const handleUpdateApptSubmit = async (e) => {
    e.preventDefault();

    const selectedTime = new Date(editData.appointmentTime);
    const now = new Date();
    if (selectedTime < now) {
      toast.error("Thời gian hẹn không được ở quá khứ!");
      return;
    }

    try {
      await axiosInstance.put(`/api/appointments/${editData.appointmentId}`, {
        patientName: editData.patientName,
        phone: editData.phone,
        email: editData.email,
        appointmentTime: editData.appointmentTime + ":00",
        notes: editData.notes
      });

      toast.success('Cập nhật lịch hẹn thành công!');
      setShowEditModal(false);
      fetchAppointments();
    } catch (error) {
      const msg = error.response?.data?.message || 'Cập nhật thất bại.';
      toast.error(msg);
    }
  };

  // 5. Xác nhận & Hủy
  const handleConfirmAppointment = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận lịch hẹn này?')) return;
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
      toast.success('Lịch hẹn đã được xác nhận!');
      if (apptFilters.status === 'Pending') fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xác nhận thất bại.');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY lịch hẹn này?')) return;
    try {
        await axiosInstance.patch(`/api/appointments/${appointmentId}/status`, null, {
            params: { status: 'Cancelled' },
        });
        toast.success('Đã hủy lịch hẹn.');
        fetchAppointments();
    } catch (error) {
        toast.error('Không thể hủy lịch hẹn.');
    }
  };

  // ================= QUEUE LOGIC =================
  const loadQueueList = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    try {
      const data = await queueApi.getWaitingQueue();
      const mappedData = (data || []).map(item => ({
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        patientName: item.patientName,
        phone: item.phone,
        email: item.email,
        dob: item.dob,
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: item.status || 'Waiting',
        checkInTime: item.checkInTime,
        assignedRoomId: item.assignedRoomId || item.assignedRoom?.roomId || null,
        assignedRoomName: item.assignedRoomName || item.assignedRoom?.roomName || null,
      }));
      setQueueList(sortQueueByPriority(mappedData));
    } catch (error) {
      setQueueError(error.response?.data?.message || 'Không thể tải danh sách chờ.');
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'records') loadQueueList();
  }, [activeMenu, loadQueueList]);

  const handleSearchQueue = async () => {
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus) params.status = filterStatus;
      const data = await queueApi.searchQueue(params);
      const mappedData = (data || []).map(item => ({
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        patientName: item.patientName,
        phone: item.phone,
        email: item.email,
        dob: item.dob,
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: item.status || 'Waiting',
        checkInTime: item.checkInTime,
        assignedRoomId: item.assignedRoomId || null,
        assignedRoomName: item.assignedRoomName || null,
      }));
      setQueueList(sortQueueByPriority(mappedData));
    } catch (error) {
      toast.error("Tìm kiếm thất bại!");
    }
  };

  const handleClearFilters = () => {
    setSearchPhone('');
    setFilterStatus('');
    loadQueueList();
  };

  const handleAddPatient = () => {
    setPatientForm({ ...emptyPatientForm, status: "Waiting" });
    setEditPatientId(null);
    setShowForm(true);
  };

  const handleEditPatient = async (patient) => {
    try {
      const full = await queueApi.getQueueDetail(patient.queueId);
      setPatientForm({
        patientName: full.patientName || '',
        phone: full.phone || '',
        email: full.email || '',
        dob: full.dob || '',
        gender: full.gender || '',
        address: full.address || '',
        priority: full.priority || 'Normal',
        checkInTime: full.checkInTime || '',
        status: full.status || 'Waiting'
      });
      setEditPatientId(full.queueId);
      setShowForm(true);
    } catch (err) {
      toast.error("Không tải được thông tin chi tiết!");
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await queueApi.deletePatient(patientId);
      setQueueList(prev => prev.filter(p => p.queueId !== patientId));
      toast.success("Đã xoá bệnh nhân!");
    } catch {
      toast.error("Không thể xoá bệnh nhân!");
    }
  };

  const handleFormChange = (field, value) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = async () => {
    try {
      if (!editPatientId) {
        if (!patientForm.checkInTime) {
          toast.error("Vui lòng nhập thời gian check-in!");
          return;
        }
        const now = new Date();
        const checkIn = new Date(patientForm.checkInTime);
        if (checkIn < now) {
          toast.error("Thời gian check-in không được ở quá khứ!");
          return;
        }
      }

      if (editPatientId) {
        const updateData = {
          patientName: patientForm.patientName,
          phone: patientForm.phone,
          email: patientForm.email || null,
          dob: patientForm.dob,
          gender: patientForm.gender,
          address: patientForm.address || null,
          priority: patientForm.priority,
          status: patientForm.status || "Waiting",
          checkInTime: patientForm.checkInTime,
        };
        const res = await queueApi.updatePatient(editPatientId, updateData);
        setQueueList(prev => sortQueueByPriority(
          prev.map(p => (p.queueId === editPatientId ? { 
            ...p, 
            ...res, 
            queueId: editPatientId
          } : p))
        ));
        toast.success("Cập nhật bệnh nhân thành công!");
      } else {
        const res = await queueApi.addPatient({
          patientName: patientForm.patientName,
          phone: patientForm.phone,
          email: patientForm.email || null,
          dob: patientForm.dob,
          gender: patientForm.gender,
          address: patientForm.address || null,
          priority: patientForm.priority,
          checkInTime: patientForm.checkInTime,
        });
        setQueueList(prev => sortQueueByPriority([...prev, res]));
        toast.success("Thêm bệnh nhân thành công!");
      }
      setShowForm(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra!";
      toast.error(errorMessage);
    }
  };

  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      const updated = await queueApi.updateStatus(queueId, status);
      setQueueList(prev => sortQueueByPriority(
        prev.map(p => p.queueId === queueId ? { ...p, ...updated } : p)
      ));
      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleAssignRoom = (patient) => {
    setSelectedPatient(patient);
    setShowRoomModal(true);
  };

  const handleRoomAssigned = async (queueId, roomId) => {
    try {
      await queueApi.updateStatus(queueId, 'InProgress');
      setQueueList(prev => sortQueueByPriority(
        prev.map(p => p.queueId === queueId ? { ...p, status: 'InProgress' } : p)
      ));
      toast.success("Phân phòng thành công!");
    } catch (error) {
      toast.error("Phân phòng thành công nhưng không thể cập nhật trạng thái!");
    }
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
      setProfileError(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
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
        setProfileError('Tải ảnh thất bại');
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
        throw new Error('Tắt 2FA thất bại');
      } else {
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', {
          email: userData.email,
        });
        if (data?.success) {
          setProfileSuccess('Đã gửi mã OTP đến email của bạn.');
          setTimeout(() => setProfileSuccess(''), 2500);
          return true;
        }
        throw new Error('Bật 2FA thất bại');
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Không thể cập nhật 2FA');
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
      setProfileError('Xác thực OTP thất bại');
      return false;
    } catch (error) {
      setProfileError('Xác thực OTP thất bại');
      return false;
    }
  };

  const receptionistName = useMemo(() => userData.fullName, [userData.fullName]);

  // ================= RENDER SECTIONS =================
  
  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      {/* Header & Nút Thêm */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">📅 Quản lý lịch hẹn</h2>
        <button 
          onClick={() => setShowApptModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition"
        >
          <Plus className="w-5 h-5" /> Thêm lịch hẹn
        </button>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Tìm tên bệnh nhân..." 
            className="w-full pl-10 pr-3 h-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={apptFilters.patientName}
            onChange={e => setApptFilters({...apptFilters, patientName: e.target.value})}
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Tìm số điện thoại..." 
            className="w-full pl-10 pr-3 h-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={apptFilters.phone}
            onChange={e => setApptFilters({...apptFilters, phone: e.target.value})}
          />
        </div>
        <div>
          <select
            value={apptFilters.status}
            onChange={(e) => setApptFilters({...apptFilters, status: e.target.value})}
            className="w-full px-3 h-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm text-gray-700"
          >
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
        <button 
          onClick={() => setApptFilters({ status: 'Pending', phone: '', patientName: '' })}
          className="w-full h-10 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      {appointmentsError && <div className="text-red-600">{appointmentsError}</div>}

      {/* Bảng Danh sách */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-12">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bệnh nhân</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ghi chú</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-32">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingAppointments ? (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-10 text-center text-gray-500">Không tìm thấy lịch hẹn nào.</td></tr>
            ) : (
              appointments.map((appt, index) => (
                <tr key={appt.appointmentId} className="hover:bg-gray-50">
                  {/* STT */}
                  <td className="px-4 py-3 text-center text-sm text-gray-500 font-medium">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{appt.patientName}</div>
                    <div className="text-xs text-gray-500">{appt.appointmentCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{appt.phone}</div>
                    <div className="text-xs text-blue-600">{appt.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {formatDateTime(appt.appointmentTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                    {appt.notes || '-'}
                  </td>

                  {/* [CẬP NHẬT] Trạng thái: Ngăn nắp trên 1 dòng */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold min-w-[120px] text-center
                      ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'}`}>
                      {appt.status === 'Pending' ? 'Chờ xác nhận' : appt.status === 'Confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                    </span>
                  </td>

                  {/* [CẬP NHẬT] Hành động: Ô hẹp hơn, khoảng cách icon gần */}
                  <td className="px-4 py-3 text-center w-32">
                    {appt.status === 'Pending' ? (
                      <div className="flex justify-center gap-2">
                        {/* Nút Xác nhận */}
                        <button 
                          onClick={() => handleConfirmAppointment(appt.appointmentId)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Xác nhận"
                        >
                          <Check className="w-5 h-5" />
                        </button>

                        {/* Nút Sửa */}
                        <button 
                          onClick={() => handleEditClick(appt)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Sửa thông tin"
                        >
                          <SquarePen className="w-5 h-5" />
                        </button>

                        {/* Nút Hủy */}
                        <button 
                          onClick={() => handleCancelAppointment(appt.appointmentId)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Hủy"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : appt.confirmedAt ? (
                      <div className="text-xs text-gray-500 italic flex flex-col items-center">
                         <span>{formatDateTime(appt.confirmedAt)}</span>
                         {appt.confirmedByName && <span className="text-gray-400">Bởi: {appt.confirmedByName}</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Mới */}
      {showApptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800">Tạo Lịch Hẹn Mới</h3>
              <button onClick={() => setShowApptModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreateApptSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh nhân *</label>
                  <input required type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAppt.patientName} onChange={e => setNewAppt({...newAppt, patientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input required type="tel" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAppt.phone} onChange={e => setNewAppt({...newAppt, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAppt.email} onChange={e => setNewAppt({...newAppt, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian hẹn *</label>
                <input required type="datetime-local" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAppt.appointmentTime} onChange={e => setNewAppt({...newAppt, appointmentTime: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows="3" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAppt.notes} onChange={e => setNewAppt({...newAppt, notes: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={isSubmittingAppt} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  {isSubmittingAppt ? 'Đang lưu...' : 'Lưu Lịch Hẹn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Lịch Hẹn */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-blue-50">
              <h3 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                <SquarePen className="w-5 h-5" /> Sửa Lịch Hẹn
              </h3>
              <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5 text-gray-500 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleUpdateApptSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh nhân *</label>
                  <input required type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editData.patientName} 
                    onChange={e => setEditData({...editData, patientName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input required type="tel" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editData.phone} 
                    onChange={e => setEditData({...editData, phone: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editData.email} 
                  onChange={e => setEditData({...editData, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian hẹn *</label>
                <input required type="datetime-local" 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editData.appointmentTime} 
                  onChange={e => setEditData({...editData, appointmentTime: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows="3" 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editData.notes} 
                  onChange={e => setEditData({...editData, notes: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button type="button" onClick={() => setShowEditModal(false)} 
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                  Hủy bỏ
                </button>
                <button type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow transition">
                  <Save className="w-4 h-4" /> Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderQueueSection = () => (
    <div className="space-y-4">
      <SearchFilter
        searchPhone={searchPhone}
        filterStatus={filterStatus}
        onSearchPhoneChange={setSearchPhone}
        onFilterStatusChange={setFilterStatus}
        onSearch={handleSearchQueue}
        onClear={handleClearFilters}
        onAddPatient={handleAddPatient}
      />
      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={!!editPatientId}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={() => setShowForm(false)}
        />
      )}
      <QueueTable
        queueList={queueList}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
        onStatusChange={handleQuickUpdateStatus}
        onAssignRoom={handleAssignRoom}
      />
      {showRoomModal && selectedPatient && (
        <RoomAssignModal
          patient={selectedPatient}
          onClose={() => { setShowRoomModal(false); setSelectedPatient(null); }}
          onAssign={handleRoomAssigned}
        />
      )}
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

      {/* --- [QUAN TRỌNG] ĐẶT Z-INDEX CAO ĐỂ NỔI LÊN TRÊN MODAL --- */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={true} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
        style={{ zIndex: 999999 }} 
      />
    </div>
  );
}