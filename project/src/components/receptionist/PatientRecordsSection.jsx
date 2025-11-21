import { useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import SearchFilter from './SearchFilter';
import QueueTable from './QueueTable';
import PatientForm from './PatientForm';
import RoomAssignModal from './RoomAssignModal';
import { queueApi } from '../../api/receptionApi';

// ========== HELPER FUNCTIONS ==========

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

// ========== EMPTY FORM WITH 3 NEW FIELDS ==========
const emptyPatientForm = {
  patientName: '',
  phone: '',
  email: '',
  dob: '',
  gender: '',
  address: '',
  priority: 'Normal',
  checkInTime: '',
  idNumber: '',           // 🆕 Số căn cước
  insuranceNumber: '',    // 🆕 Số thẻ BHYT
  notes: '',              // 🆕 Triệu chứng
};

// ========== MAIN COMPONENT ==========
export default function PatientRecordsSection() {
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('Waiting');
  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ========== FETCH QUEUE DATA WITH 3 NEW FIELDS ==========
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
        dob: formatDateOfBirth(item.dob), // Format cho hiển thị
        gender: item.gender,
        address: item.address,
        priority: item.priority || 'Normal',
        status: normalizeStatus(item.status || item.queueStatus),
        checkInTime: item.checkInTime,
        assignedRoomId: item.assignedRoomId || item.assignedRoom?.roomId || null,
        assignedRoomName: item.assignedRoomName || item.assignedRoom?.roomName || null,
        
        // 🆕 Thêm 3 trường mới
        idNumber: item.idNumber || '',
        insuranceNumber: item.insuranceNumber || '',
        notes: item.notes || '',
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
    fetchQueueData();
  }, [fetchQueueData]);

  // ========== UPDATE LOCAL STATUS ==========
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

  // ========== FORM HANDLERS ==========
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

  // ========== EDIT PATIENT WITH 3 NEW FIELDS ==========
  const handleEditPatient = async (patient) => {
    try {
      const full = await queueApi.getQueueDetail(patient.queueId);
      
      // 🔧 Helper: Chuẩn hóa giới tính từ backend về format của form
      const normalizeGender = (genderValue) => {
        if (!genderValue) return 'Nam'; // Default
        const g = String(genderValue).trim();
        
        // Backend giờ trả về enum name: "male", "female", "other"
        if (g === 'male') return 'Nam';
        if (g === 'female') return 'Nữ';
        if (g === 'other') return 'Khác';
        
        // Fallback cho trường hợp cũ (nếu có label)
        if (g === 'Nam') return 'Nam';
        if (g === 'Nữ') return 'Nữ';
        if (g === 'Khác') return 'Khác';
        
        return 'Nam'; // Default fallback
      };
      
      // 🔧 Helper: Chuẩn hóa priority từ backend về format của form
      const normalizePriority = (priorityValue) => {
        if (!priorityValue) return 'Normal'; // Default
        const p = String(priorityValue).trim();
        // Backend có thể trả về "Khẩn cấp", "Ưu tiên", "Thường" hoặc "Emergency", "Urgent", "Normal"
        if (p === 'Khẩn cấp' || p === 'Emergency') return 'Emergency';
        if (p === 'Ưu tiên' || p === 'Urgent') return 'Urgent';
        if (p === 'Thường' || p === 'Normal') return 'Normal';
        return 'Normal'; // Fallback
      };
      
      setPatientForm({
        patientName: full.patientName || '',
        phone: full.phone || '',
        email: full.email || '',
        dob: full.dob || '', // GIỮ NGUYÊN yyyy-mm-dd cho DatePicker
        gender: normalizeGender(full.gender), // ✅ Chuẩn hóa giới tính
        address: full.address || '',
        priority: normalizePriority(full.priority), // ✅ Chuẩn hóa priority
        checkInTime: full.checkInTime || '',
        
        // 🆕 Thêm 3 trường mới
        idNumber: full.idNumber || '',
        insuranceNumber: full.insuranceNumber || '',
        notes: full.notes || '',
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

  // ========== SUBMIT FORM WITH 3 NEW FIELDS ==========
  const handleSubmitForm = async () => {
    try {
      // Tự động set checkInTime cho bệnh nhân mới
      if (!editPatientId) {
        patientForm.checkInTime = new Date().toISOString();
      }

      // Validation số điện thoại
      if (patientForm.phone.length !== 10) {
        toast.error('Số điện thoại phải đúng 10 chữ số!');
        return;
      }

      if (editPatientId) {
        // === CẬP NHẬT BỆNH NHÂN ===
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        const newStatus = normalizeStatus(res.status || patientForm.status);
        
        setQueueList((prev) => {
          // Nếu filter không match với status mới, xóa khỏi danh sách
          if (filterStatus && normalizeStatus(filterStatus) !== newStatus && filterStatus !== '') {
            return prev.filter(p => p.queueId !== editPatientId);
          }
          
          // Cập nhật thông tin bệnh nhân
          return sortQueueByPriority(
            prev.map((p) => (p.queueId === editPatientId ? { 
              ...p, 
              ...res, 
              queueId: editPatientId, 
              status: newStatus,
              dob: formatDateOfBirth(res.dob), // Format lại ngày sinh cho hiển thị
              
              // 🆕 Cập nhật 3 trường mới
              idNumber: res.idNumber || '',
              insuranceNumber: res.insuranceNumber || '',
              notes: res.notes || '',
            } : p))
          );
        });
        
        toast.success('Cập nhật bệnh nhân thành công!');
        
      } else {
        // === THÊM MỚI BỆNH NHÂN ===
        const res = await queueApi.addPatient(patientForm);
        const newStatus = normalizeStatus(res.status || 'Waiting');
        
        // Chỉ thêm vào danh sách nếu match với filter hiện tại
        if (!filterStatus || normalizeStatus(filterStatus) === newStatus) {
          const newItemFormatted = {
            ...res,
            status: newStatus,
            dob: formatDateOfBirth(res.dob), // Format ngày sinh
            
            // 🆕 Thêm 3 trường mới
            idNumber: res.idNumber || '',
            insuranceNumber: res.insuranceNumber || '',
            notes: res.notes || '',
          };
          
          setQueueList((prev) => sortQueueByPriority([...prev, newItemFormatted]));
        }
        
        toast.success('Thêm bệnh nhân thành công!');
      }

      setShowForm(false);
      
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Có lỗi xảy ra!';
      toast.error(errorMessage);
    }
  };

  // ========== QUICK STATUS UPDATE ==========
  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await queueApi.updateStatus(queueId, status);
      updateLocalQueueStatus(queueId, status);
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Cập nhật thất bại!');
    }
  };

  // ========== ROOM ASSIGNMENT ==========
  const handleAssignRoom = (patient) => {
    setSelectedPatient(patient);
    setShowRoomModal(true);
  };

  const handleRoomAssigned = async () => {
    await fetchQueueData();
    toast.success('Phân phòng thành công!');
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
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
}