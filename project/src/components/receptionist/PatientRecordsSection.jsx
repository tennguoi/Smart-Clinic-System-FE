import { useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchFilter from './SearchFilter';
import QueueTable from './QueueTable';
import PatientForm from './PatientForm';
import { queueApi } from '../../api/receptionApi';

// Helper functions
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
  const order = { 
    'Emergency': 3, 'Khẩn cấp': 3, 
    'Urgent': 2, 'Ưu tiên': 2, 
    'Normal': 1, 'Thường': 1 
  };
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
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

const parseIsoToDate = (isoValue) => {
  if (!isoValue) return null;
  const date = new Date(isoValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Empty form
const emptyPatientForm = {
  patientName: '',
  phone: '',
  email: '',
  dob: '',
  gender: 'male',
  address: '',
  priority: 'Normal',
  checkInTime: '',
  idNumber: '',
  insuranceNumber: '',
  notes: '',
  dobDate: null,
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

  // Fetch queue data
  const fetchQueueData = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus && filterStatus !== 'All') params.status = filterStatus;

      const data = await queueApi.searchQueue(params);

      const mappedData = (data || []).map((item) => ({
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        patientName: item.patientName,
        phone: item.phone,
        email: item.email,
        dob: formatDateOfBirth(item.dob),
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: normalizeStatus(item.status),
        checkInTime: item.checkInTime,
        roomName: item.roomName || null,
        doctorName: item.doctorName || null,
        idNumber: item.idNumber || '',
        insuranceNumber: item.insuranceNumber || '',
        notes: item.notes || '',
      }));

      setQueueList(sortQueueByPriority(mappedData)); // Áp dụng sắp xếp theo ưu tiên
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân.';
      setQueueError(message);
    } finally {
      setLoadingQueue(false);
    }
  }, [searchPhone, filterStatus]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Update local status
  const updateLocalQueueStatus = (queueId, newStatus) => {
    const std = normalizeStatus(newStatus);
    setQueueList(prev => {
      if (filterStatus && normalizeStatus(filterStatus) !== std && filterStatus !== '') {
        return prev.filter(p => p.queueId !== queueId);
      }
      return sortQueueByPriority(
        prev.map(p => p.queueId === queueId ? { ...p, status: std } : p)
      );
    });
  };

  // Form handlers
  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setPatientForm(prev => ({ ...prev, [field]: numeric }));
    } else if (field === 'dob') {
      if (value && value instanceof Date && !Number.isNaN(value.getTime())) {
        const isoValue = value.toISOString().split('T')[0];
        setPatientForm(prev => ({ ...prev, dobDate: value, dob: isoValue }));
      } else {
        setPatientForm(prev => ({ ...prev, dobDate: null, dob: '' }));
      }
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

      const normalizeGender = (g) => {
        if (!g) return 'male';
        const val = String(g).toLowerCase();
        if (val.includes('nữ') || val === 'female') return 'female';
        if (val.includes('khác') || val === 'other') return 'other';
        return 'male';
      };

      const normalizePriority = (p) => {
        if (!p) return 'Normal';
        const val = String(p);
        if (val.includes('Khẩn cấp') || val.includes('Emergency')) return 'Emergency';
        if (val.includes('Ưu tiên') || val.includes('Urgent')) return 'Urgent';
        return 'Normal';
      };

      setPatientForm({
        patientName: full.patientName || '',
        phone: full.phone || '',
        email: full.email || '',
        dob: full.dob || '',
        dobDate: parseIsoToDate(full.dob),
        gender: normalizeGender(full.gender),
        address: full.address || '',
        priority: normalizePriority(full.priority),
        idNumber: full.idNumber || '',
        insuranceNumber: full.insuranceNumber || '',
        notes: full.notes || '',
      });
      setEditPatientId(full.queueId);
      setShowForm(true);
    } catch {
      toast.error('Không tải được thông tin bệnh nhân!');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) return;
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
      if (patientForm.phone.length !== 10) {
        toast.error('Số điện thoại phải đúng 10 chữ số!');
        return;
      }

      if (!patientForm.patientName.trim()) {
        toast.error('Vui lòng nhập tên bệnh nhân!');
        return;
      }

      if (!patientForm.dob) {
        toast.error('Vui lòng chọn ngày sinh!');
        return;
      }

      if (editPatientId) {
        // CẬP NHẬT
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        setQueueList(prev => sortQueueByPriority(
          prev.map(p => p.queueId === editPatientId ? {
            ...p,
            ...res,
            dob: formatDateOfBirth(res.dob),
            roomName: res.roomName || p.roomName,
            doctorName: res.doctorName || p.doctorName,
          } : p)
        ));
        toast.success('Cập nhật thành công!');
      } else {
        // THÊM MỚI - Backend tự động phân phòng
        const res = await queueApi.addPatient(patientForm);
        const newItem = {
          ...res,
          dob: formatDateOfBirth(res.dob),
          status: normalizeStatus(res.status),
        };
        setQueueList(prev => sortQueueByPriority([...prev, newItem]));

        // Thông báo đã phân phòng tự động
        if (res.roomName) {
          toast.success(
            ` Đã thêm bệnh nhân thành công!\n Tự động phân vào: ${res.roomName}${res.doctorName ? `\n Bác sĩ: ${res.doctorName}` : ''}`,
            { autoClose: 5000 }
          );
        } else {
          toast.success(' Đã thêm bệnh nhân! Đang chờ phân phòng tự động...');
        }
      }

      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra!';
      toast.error(msg);
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

  return (
    <div className="space-y-6">
      <SearchFilter
        searchPhone={searchPhone}
        filterStatus={filterStatus}
        onSearchPhoneChange={setSearchPhone}
        onFilterStatusChange={setFilterStatus}
        onSearch={fetchQueueData}
        onClear={() => {
          setSearchPhone('');
          setFilterStatus('');
          fetchQueueData();
        }}
        onAddPatient={handleAddPatient}
      />

      {queueError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {queueError}
        </div>
      )}

      {loadingQueue ? (
        <div className="text-center py-10 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <QueueTable
          queueList={queueList}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onStatusChange={handleQuickUpdateStatus}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
