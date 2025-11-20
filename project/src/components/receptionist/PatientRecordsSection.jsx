import { useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import SearchFilter from './SearchFilter';
import QueueTable from './QueueTable';
import PatientForm from './PatientForm';
import RoomAssignModal from './RoomAssignModal';
import { queueApi } from '../../api/receptionApi';

const normalizeStatus = (status) => {
  if (!status) return 'Waiting';
  const s = String(status).toLowerCase().trim();
  if (s.includes('đang khám') || s.includes('inprogress')) return 'InProgress';
  if (s.includes('hoàn tất') || s.includes('completed')) return 'Completed';
  if (s.includes('hủy') || s.includes('cancelled')) return 'Cancelled';
  if (s.includes('đang chờ') || s.includes('waiting')) return 'Waiting';
  return 'Waiting';
};

const sortQueueByPriority = (list) => {
  const order = { 'Emergency': 3, 'Khẩn cấp': 3, 'Urgent': 2, 'Ưu tiên': 2, 'Normal': 1, 'Thường': 1 };
  return list.slice().sort((a, b) => {
    const diff = (order[b.priority] || 0) - (order[a.priority] || 0);
    return diff !== 0 ? diff : new Date(a.checkInTime) - new Date(b.checkInTime);
  });
};

const formatDateOfBirth = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};

const emptyPatientForm = {
  patientName: '', phone: '', email: '', dob: '', gender: '', address: '', priority: 'Normal', checkInTime: ''
};

export default function PatientRecordsSection() {
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchQueueData = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus && filterStatus !== '' && filterStatus !== 'All') params.status = filterStatus;

      const data = await queueApi.searchQueue(params);
      const mapped = (data || []).map(item => ({
        ...item,
        dob: formatDateOfBirth(item.dob),
        status: normalizeStatus(item.status || item.queueStatus),
        assignedRoomId: item.assignedRoomId || item.assignedRoom?.roomId || null,
        assignedRoomName: item.assignedRoomName || item.assignedRoom?.roomName || null,
      }));
      setQueueList(sortQueueByPriority(mapped));
    } catch (error) {
      setQueueError('Không thể tải danh sách bệnh nhân');
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoadingQueue(false);
    }
  }, [searchPhone, filterStatus]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  const updateLocalQueueStatus = (queueId, newStatus) => {
    const std = normalizeStatus(newStatus);
    setQueueList(prev => {
      if (filterStatus && normalizeStatus(filterStatus) !== std && filterStatus !== '') {
        return prev.filter(p => p.queueId !== queueId);
      }
      return sortQueueByPriority(prev.map(p => p.queueId === queueId ? { ...p, status: std } : p));
    });
  };

  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setPatientForm(prev => ({ ...prev, [field]: numeric }));
    } else {
      setPatientForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddPatient = () => {
    setPatientForm({ ...emptyPatientForm });
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
      });
      setEditPatientId(full.queueId);
      setShowForm(true);
    } catch {
      toast.error('Không tải được thông tin chi tiết!');
    }
  };

  const handleDeletePatient = async (id) => {
    try {
      await queueApi.deletePatient(id);
      setQueueList(prev => prev.filter(p => p.queueId !== id));
      toast.success('Đã xóa bệnh nhân!');
    } catch {
      toast.error('Không thể xóa bệnh nhân!');
    }
  };

  const handleSubmitForm = async () => {
    try {
      if (!editPatientId && patientForm.phone.length !== 10) {
        toast.error('Số điện thoại phải đúng 10 số!');
        return;
      }

      if (!editPatientId) patientForm.checkInTime = new Date().toISOString();

      let res;
      if (editPatientId) {
        res = await queueApi.updatePatient(editPatientId, patientForm);
        toast.success('Cập nhật thành công!');
      } else {
        res = await queueApi.addPatient(patientForm);
        toast.success('Thêm bệnh nhân thành công!');
      }

      const newItem = {
        ...res,
        dob: formatDateOfBirth(res.dob),
        status: normalizeStatus(res.status || 'Waiting'),
      };

      setQueueList(prev => {
        if (editPatientId) {
          return sortQueueByPriority(prev.map(p => p.queueId === editPatientId ? newItem : p));
        } else {
          return sortQueueByPriority([...prev, newItem]);
        }
      });

      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu!');
    }
  };

  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await queueApi.updateStatus(queueId, status);
      updateLocalQueueStatus(queueId, status);
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  const handleAssignRoom = (patient) => {
    setSelectedPatient(patient);
    setShowRoomModal(true);
  };

  const handleRoomAssigned = async () => {
    await fetchQueueData();
    toast.success('Phân phòng thành công!');
  };

  return (
    <div className="space-y-4">
      <SearchFilter
        searchPhone={searchPhone}
        filterStatus={filterStatus}
        onSearchPhoneChange={setSearchPhone}
        onFilterStatusChange={setFilterStatus}
        onSearch={fetchQueueData}
        onClear={() => { setSearchPhone(''); setFilterStatus(''); fetchQueueData(); }}
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
          onClose={() => { setShowRoomModal(false); setSelectedPatient(null); }}
          onAssign={handleRoomAssigned}
        />
      )}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}