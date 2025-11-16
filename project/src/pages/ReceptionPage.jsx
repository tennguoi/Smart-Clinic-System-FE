// ------------------ IMPORT ------------------
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/Sidebar';
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

const priorityLabels = { Normal: 'Thường', Urgent: 'Ưu tiên', Emergency: 'Khẩn cấp' };
const statusLabels = { Waiting: 'Chờ khám', InProgress: 'Đang khám', Completed: 'Đã hoàn thành', Cancelled: 'Hủy' };

const emptyPatientForm = {
  queueNumber: '',
  patientName: '',
  phone: '',
  email: '',
  dob: '',
  gender: '',
  address: '',
  priority: 'Normal',
  status: 'Waiting',
  checkInTime: ''
};

// ------------------ MAIN COMPONENT ------------------
export default function ReceptionPage() {
  const [activeMenu, setActiveMenu] = useState('records');
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');

  const [userData, setUserData] = useState(initialUserData);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);

  const navigate = useNavigate();


  // ================= LOAD PROFILE =================
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const { data } = await axiosInstance.get('/api/auth/user');
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
      localStorage.setItem('user_info', JSON.stringify(mapped));
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

  useEffect(() => { loadProfile(); }, [loadProfile]);


  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };


  // ================= LOAD QUEUE LIST =================
  const loadQueueList = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    try {
      const { data } = await axiosInstance.get('/api/reception/queue/waiting');
      setQueueList(data || []);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân đang chờ.';
      setQueueError(message);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => { if (activeMenu === 'records') loadQueueList(); }, [activeMenu, loadQueueList]);


  // ================= SEARCH =================
  const handleSearchQueue = async () => {
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus) params.status = filterStatus;

      const { data } = await axiosInstance.get('/api/reception/queue/search', { params });
      setQueueList(data || []);
    } catch (error) {
      toast.error("Tìm kiếm thất bại!");
    }
  };

  const handleClearFilters = () => {
    setSearchPhone('');
    setFilterStatus('');
    loadQueueList();
  };


  // ================= ADD / EDIT FORM =================
  const handleFormChange = (field, value) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPatient = () => {
    setPatientForm(emptyPatientForm);
    setEditPatientId(null);
    setShowForm(true);
  };

  const handleEditPatient = async (patient) => {
    try {
      const { data: full } = await axiosInstance.get(`/api/reception/queue/${patient.queueId}`);
      setPatientForm({
        queueNumber: full.queueNumber || '',
        priority: full.priority || 'Normal',
        status: full.status || 'Waiting',
        checkInTime: full.checkInTime || '',
        patientName: full.patientName || '',
        phone: full.phone || '',
        email: full.email || '',
        dob: full.dob || '',
        gender: full.gender || '',
        address: full.address || ''
      });
      setEditPatientId(full.queueId);
      setShowForm(true);
    } catch (err) {
      toast.error("Không tải được thông tin chi tiết!");
    }
  };


  // ================= DELETE PATIENT =================
  const handleDeletePatient = async (patientId) => {
    try {
      await axiosInstance.delete(`/api/reception/queue/${patientId}`);
      setQueueList(prev => prev.filter(p => p.queueId !== patientId));
      toast.success("Đã xoá bệnh nhân!");
    } catch {
      toast.error("Không thể xoá bệnh nhân!");
    }
  };


  // ================= SUBMIT FORM (ADD / UPDATE) =================
  const handleSubmitForm = async () => {
    try {
      // Validate ngày/giờ khi thêm mới
      if (!editPatientId) {
        const now = new Date();
        const checkIn = new Date(patientForm.checkInTime);

        if (!patientForm.checkInTime) {
          toast.error("Vui lòng nhập thời gian check-in!");
          return;
        }
        if (checkIn < now) {
          toast.error("Thời gian check-in không được ở quá khứ!");
          return;
        }
      }

      // ---------- CẬP NHẬT ----------
      if (editPatientId) {
        const res = await axiosInstance.put(`/api/reception/queue/${editPatientId}`, patientForm);
        setQueueList(prev => prev.map(p =>
          p.queueId === editPatientId ? res.data : p
        ));
        toast.success("Cập nhật bệnh nhân thành công!");
      }

      // ---------- THÊM MỚI: THÊM XUỐNG CUỐI ----------
      else {
        const res = await axiosInstance.post('/api/reception/queue/add', patientForm);
        setQueueList(prev => [...prev, res.data]);  // ⬅️ ĐÚNG YÊU CẦU
        toast.success("Thêm bệnh nhân thành công!");
      }

      setShowForm(false);

    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };


  // ================= QUICK UPDATE STATUS =================
  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await axiosInstance.patch(`/api/reception/queue/${queueId}/status`, null, { params: { status } });
      setQueueList(prev => prev.map(p =>
        p.queueId === queueId ? { ...p, status } : p
      ));
      toast.success("Cập nhật trạng thái thành công!");
    } catch {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };


  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return value;
    }
  };


  const receptionistName = useMemo(() => userData.fullName, [userData.fullName]);


  // ================= RENDER QUEUE SECTION =================
  const renderQueueSection = () => (
    <div className="space-y-4">

      {/* SEARCH */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Tìm theo số điện thoại"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <button className="px-3 py-1 bg-gray-200 rounded"
            onClick={handleSearchQueue}>Tìm kiếm</button>

          <button className="px-3 py-1 bg-gray-200 rounded"
            onClick={handleClearFilters}>Xóa lọc</button>
        </div>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleAddPatient}
        >
          Thêm bệnh nhân
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-4 border rounded shadow space-y-2">
          <h3 className="font-semibold">
            {editPatientId ? 'Cập nhật bệnh nhân' : 'Thêm bệnh nhân'}
          </h3>

          <div className="grid grid-cols-2 gap-2">

            <input placeholder="Mã hàng đợi"
              value={patientForm.queueNumber}
              onChange={(e) => handleFormChange('queueNumber', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <input placeholder="Tên bệnh nhân"
              value={patientForm.patientName}
              onChange={(e) => handleFormChange('patientName', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <input placeholder="Số điện thoại"
              value={patientForm.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <input placeholder="Email"
              value={patientForm.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <input type="date" placeholder="Ngày sinh"
              value={patientForm.dob}
              onChange={(e) => handleFormChange('dob', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <select
              value={patientForm.gender}
              onChange={(e) => handleFormChange('gender', e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>

            <input placeholder="Địa chỉ"
              value={patientForm.address}
              onChange={(e) => handleFormChange('address', e.target.value)}
              className="border px-2 py-1 rounded"
            />

            <select
              value={patientForm.priority}
              onChange={(e) => handleFormChange('priority', e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {Object.entries(priorityLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={patientForm.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* ✔ RÀNG BUỘC NGÀY GIỜ KHI THÊM */}
            <input
              type="datetime-local"
              value={patientForm.checkInTime}
              onChange={(e) => handleFormChange('checkInTime', e.target.value)}
              className="border px-2 py-1 rounded"
              min={!editPatientId ? new Date().toISOString().slice(0, 16) : undefined}
            />

          </div>

          <div className="flex space-x-2 mt-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleSubmitForm}
            >
              {editPatientId ? 'Cập nhật' : 'Thêm'}
            </button>

            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Mã hàng đợi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Tên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Ưu tiên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Check-in</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Thao tác</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{q.queueNumber || '—'}</td>
                <td className="px-4 py-3">{q.patientName}</td>
                <td className="px-4 py-3">{q.phone || '—'}</td>
                <td className="px-4 py-3">{priorityLabels[q.priority]}</td>

                <td className="px-4 py-3">
                  <select
                    value={q.status}
                    onChange={(e) => handleQuickUpdateStatus(q.queueId, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">{formatDateTime(q.checkInTime)}</td>

                <td className="px-4 py-3 space-x-1">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={() => handleEditPatient(q)}
                  >
                    Sửa
                  </button>

                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => handleDeletePatient(q.queueId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ReceptionSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <ReceptionHeader onLogout={handleLogout} fullName={receptionistName} />
        <main className="flex-1 p-8 space-y-4">
          {activeMenu === 'records' && renderQueueSection()}
        </main>
      </div>
    </div>
  );
}
