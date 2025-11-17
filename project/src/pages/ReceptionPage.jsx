import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/Sidebar';
import SearchFilter from '../components/receptionist/SearchFilter';
import PatientForm from '../components/receptionist/PatientForm';
import QueueTable from '../components/receptionist/QueueTable';
import { queueApi, userApi } from '../api/receptionApi';
import { authService } from '../services/authService';

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
const sortQueueByPriority = (list) => {
  const priorityOrder = { Emergency: 3, Urgent: 2, Normal: 1 };
  return list.slice().sort((a, b) => {
    const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (diff !== 0) return diff;
    return new Date(a.checkInTime) - new Date(b.checkInTime);
  });
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await userApi.logout();
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
      const data = await queueApi.getWaitingQueue();
      console.log('API Response:', data); // 🔍 Debug: Xem cấu trúc data
      
      // Map data để đảm bảo có đúng field name
      const mappedData = (data || []).map(item => ({
        queueId: item.queueId || item.id || item.queue_id, // ✅ Xử lý nhiều trường hợp tên field
        queueNumber: item.queueNumber || item.queue_number,
        patientName: item.patientName || item.patient_name,
        phone: item.phone,
        email: item.email,
        dob: item.dob,
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: item.status || 'Waiting',
        checkInTime: item.checkInTime || item.check_in_time || item.checkin_time,
      }));
      
      const sorted = sortQueueByPriority(mappedData);
      setQueueList(sorted);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân đang chờ.';
      setQueueError(message);
      console.error('Load queue error:', error);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'records') loadQueueList();
  }, [activeMenu, loadQueueList]);

  // ================= SEARCH =================
  const handleSearchQueue = async () => {
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus) params.status = filterStatus;
      const data = await queueApi.searchQueue(params);
      
      // Map data giống như loadQueueList
      const mappedData = (data || []).map(item => ({
        queueId: item.queueId || item.id || item.queue_id,
        queueNumber: item.queueNumber || item.queue_number,
        patientName: item.patientName || item.patient_name,
        phone: item.phone,
        email: item.email,
        dob: item.dob,
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: item.status || 'Waiting',
        checkInTime: item.checkInTime || item.check_in_time || item.checkin_time,
      }));
      
      const sorted = sortQueueByPriority(mappedData);
      setQueueList(sorted);
    } catch (error) {
      console.error('Search error:', error);
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

  // ================= DELETE PATIENT =================
  const handleDeletePatient = async (patientId) => {
    try {
      await queueApi.deletePatient(patientId);
      setQueueList(prev => prev.filter(p => p.queueId !== patientId));
      toast.success("Đã xoá bệnh nhân!");
    } catch {
      toast.error("Không thể xoá bệnh nhân!");
    }
  };

  // ================= SUBMIT FORM =================
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
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        setQueueList(prev => sortQueueByPriority(
          prev.map(p => (p.queueId === editPatientId ? { 
            ...p, 
            ...res, 
            queueId: editPatientId // ✅ Đảm bảo giữ lại queueId
          } : p))
        ));
        toast.success("Cập nhật bệnh nhân thành công!");
      } else {
        const res = await queueApi.addPatient({
          patientName: patientForm.patientName,
          phone: patientForm.phone,
          email: patientForm.email,
          dob: patientForm.dob,
          gender: patientForm.gender,
          address: patientForm.address,
          priority: patientForm.priority,
          checkInTime: patientForm.checkInTime,
          status: "Waiting"
        });
        setQueueList(prev => sortQueueByPriority([...prev, res]));
        toast.success("Thêm bệnh nhân thành công!");
      }

      setShowForm(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  // ================= QUICK UPDATE STATUS =================
  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await queueApi.updateStatus(queueId, status);
      setQueueList(prev => sortQueueByPriority(
        prev.map(p => p.queueId === queueId ? { ...p, status } : p)
      ));
      toast.success("Cập nhật trạng thái thành công!");
    } catch {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const receptionistName = useMemo(() => userData.fullName, [userData.fullName]);

  // ================= RENDER =================
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
      />

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