// src/components/reception/PatientRecordsSection.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Users , Plus} from 'lucide-react';

import SearchFilter from './SearchFilter';
import QueueTable from './QueueTable';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
import CountBadge from '../common/CountBadge';
import { queueApi } from '../../api/receptionApi';
import { toastConfig } from '../../config/toastConfig';
import { useTheme } from '../../contexts/ThemeContext';

// ====================== HELPER FUNCTIONS ======================
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
  const order = { Emergency: 3, 'Khẩn cấp': 3, Urgent: 2, 'Ưu tiên': 2, Normal: 1, 'Thường': 1 };
  return list.slice().sort((a, b) => {
    const pa = order[a.priority] || 0;
    const pb = order[b.priority] || 0;
    return pb - pa || new Date(a.checkInTime) - new Date(b.checkInTime);
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

const parseIsoToDate = (isoValue) => {
  if (!isoValue) return null;
  const date = new Date(isoValue);
  return isNaN(date.getTime()) ? null : date;
};

// ====================== CONSTANTS ======================
const emptyPatientForm = {
  patientName: '', phone: '', email: '', dob: '', gender: 'male',
  address: '', priority: 'Normal', idNumber: '', insuranceNumber: '', notes: '', dobDate: null,
};

const ITEMS_PER_PAGE = 10;

// ====================== MAIN COMPONENT ======================
export default function PatientRecordsSection() {
  const { theme } = useTheme();
  const [queueList, setQueueList] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [currentPage, setCurrentPage] = useState(0);

  // Phân trang
  const paginatedList = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return queueList.slice(start, start + ITEMS_PER_PAGE);
  }, [queueList, currentPage]);

  const totalPages = Math.max(1, Math.ceil(queueList.length / ITEMS_PER_PAGE));

  // Thống kê trạng thái
  const statusCounts = useMemo(() => {
    const counts = { Waiting: 0, InProgress: 0, Completed: 0, Cancelled: 0 };
    queueList.forEach(item => {
      if (counts.hasOwnProperty(item.status)) counts[item.status]++;
    });
    return counts;
  }, [queueList]);

  // Fetch dữ liệu
  const fetchQueueData = useCallback(async () => {
    setLoadingQueue(true);
    setQueueError('');
    setCurrentPage(0);

    try {
      const params = {};
      if (searchPhone) params.phone = searchPhone;
      if (filterStatus && filterStatus !== 'All') params.status = filterStatus;

      const data = await queueApi.searchQueue(params);
      const mapped = (data || []).map(item => ({
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        patientName: item.patientName || '',
        phone: item.phone || '',
        email: item.email || '',
        dob: formatDateOfBirth(item.dob),
        gender: item.gender || 'male',
        address: item.address || '',
        priority: item.priority || 'Normal',
        status: normalizeStatus(item.status),
        checkInTime: item.checkInTime || new Date().toISOString(),
        roomName: item.roomName || null,
        doctorName: item.doctorName || null,
        idNumber: item.idNumber || '',
        insuranceNumber: item.insuranceNumber || '',
        notes: item.notes || '',
      }));

      setQueueList(sortQueueByPriority(mapped));
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể tải danh sách bệnh nhân';
      setQueueError(msg);
      toast.error(msg);
    } finally {
      setLoadingQueue(false);
    }
  }, [searchPhone, filterStatus]);

  useEffect(() => {
    fetchQueueData();
  }, [fetchQueueData]);

  // Form handlers
  const handleFormChange = (field, value) => {
    if (field === 'phone') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setPatientForm(prev => ({ ...prev, [field]: numeric }));
    } else if (field === 'dob') {
      if (value && value instanceof Date && !isNaN(value.getTime())) {
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
        const val = String(g || '').toLowerCase();
        if (val.includes('nữ') || val === 'female') return 'female';
        if (val.includes('khác') || val === 'other') return 'other';
        return 'male';
      };

      const normalizePriority = (p) => {
        const val = String(p || '');
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
      toast.success('Đã xóa bệnh nhân thành công!');
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
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        setQueueList(prev => sortQueueByPriority(
          prev.map(p => p.queueId === editPatientId ? { ...p, ...res, dob: formatDateOfBirth(res.dob) } : p)
        ));
        toast.success('Cập nhật bệnh nhân thành công!');
      } else {
        const res = await queueApi.addPatient(patientForm);
        const newItem = {
          ...res,
          dob: formatDateOfBirth(res.dob),
          status: normalizeStatus(res.status),
        };
        setQueueList(prev => sortQueueByPriority([newItem, ...prev]));
        setCurrentPage(0);
        
        // Toast với thời gian tùy chỉnh cho thông báo phòng khám
        const message = res.roomName
          ? `Đã thêm bệnh nhân!\nPhòng: ${res.roomName}${res.doctorName ? ` - BS. ${res.doctorName}` : ''}`
          : 'Đã thêm bệnh nhân thành công!';
        
        toast.success(message, {
          duration: res.roomName ? 6000 : toastConfig.toastOptions.success.duration,
        });
      }
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra!';
      toast.error(msg);
    }
  };

  const handleQuickUpdateStatus = async (queueId, status) => {
    try {
      await queueApi.updateStatus(queueId, status);
      setQueueList(prev => {
        const updated = prev.map(p => p.queueId === queueId ? { ...p, status: normalizeStatus(status) } : p);
        return sortQueueByPriority(updated);
      });
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Cập nhật trạng thái thất bại!');
    }
  };

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />

      {/* HEADER - KÉO XUỐNG GẦN FILTER HƠN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
          <Users className="w-9 h-9 text-blue-600" />
          <span>Quản Lý Bệnh Nhân</span>
          <CountBadge 
            currentCount={paginatedList.length} 
            totalCount={queueList.length} 
            label="bệnh nhân" 
          />
        </h1>
        <button 
          onClick={handleAddPatient}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm bệnh nhân
        </button>
      </div>

      {/* Thống kê nhanh – giảm margin */}
      <div className="flex flex-wrap gap-4 mb-4">
        <CountBadge label="Đang chờ" count={statusCounts.Waiting} color="blue" />
        <CountBadge label="Đang khám" count={statusCounts.InProgress} color="orange" />
        <CountBadge label="Hoàn tất" count={statusCounts.Completed} color="green" />
        <CountBadge label="Đã hủy" count={statusCounts.Cancelled} color="red" />
        <CountBadge label="Tổng cộng" count={queueList.length} color="gray" />
      </div>

      {/* Đưa SearchFilter lên gần hơn (chỉ cách thống kê 1 chút xíu) */}
      <div className="mb-6">
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
        />
      </div>
      {queueError && (
        <div className={`border px-4 py-3 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {queueError}
        </div>
      )}

      {/* BẢNG + PHÂN TRANG */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden transition-colors duration-300`}>
        {loadingQueue ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải danh sách bệnh nhân...</p>
          </div>
        ) : (
          <>
           <QueueTable
              queueList={paginatedList}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
              onStatusChange={handleQuickUpdateStatus}
            />

            <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <PatientForm
          patientForm={patientForm}
          isEdit={!!editPatientId}
          onChange={handleFormChange}
          onSubmit={handleSubmitForm}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}