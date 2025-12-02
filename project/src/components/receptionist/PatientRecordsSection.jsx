// src/components/reception/PatientRecordsSection.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

import SearchFilter from './SearchFilter';
import QueueTable from './QueueTable';
import PatientForm from './PatientForm';
import Pagination from '../common/Pagination';
import CountBadge from '../common/CountBadge';
import { queueApi } from '../../api/receptionApi';
import { toastConfig } from '../../config/toastConfig';

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
  const { t } = useTranslation();
  
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
      const msg = error.response?.data?.message || error.message || t('patientRecords.errors.loadFailed');
      setQueueError(msg);
      toast.error(msg);
    } finally {
      setLoadingQueue(false);
    }
  }, [searchPhone, filterStatus, t]);

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
      toast.error(t('patientRecords.errors.loadPatientFailed'));
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm(t('patientRecords.confirmDelete'))) return;
    try {
      await queueApi.deletePatient(id);
      setQueueList(prev => prev.filter(p => p.queueId !== id));
      toast.success(t('patientRecords.toast.deleteSuccess'));
    } catch {
      toast.error(t('patientRecords.toast.deleteFailed'));
    }
  };

  const handleSubmitForm = async () => {
    try {
      if (patientForm.phone.length !== 10) {
        toast.error(t('patientRecords.errors.phoneInvalid'));
        return;
      }
      if (!patientForm.patientName.trim()) {
        toast.error(t('patientRecords.errors.nameRequired'));
        return;
      }
      if (!patientForm.dob) {
        toast.error(t('patientRecords.errors.dobRequired'));
        return;
      }

      if (editPatientId) {
        const res = await queueApi.updatePatient(editPatientId, patientForm);
        setQueueList(prev => sortQueueByPriority(
          prev.map(p => p.queueId === editPatientId ? { ...p, ...res, dob: formatDateOfBirth(res.dob) } : p)
        ));
        toast.success(t('patientRecords.toast.updateSuccess'));
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
          ? t('patientRecords.toast.addSuccessWithRoom', {
              room: res.roomName,
              doctor: res.doctorName ? ` - ${t('queueManagement.doctor', { name: res.doctorName })}` : ''
            })
          : t('patientRecords.toast.addSuccess');
        
        toast.success(message, {
          duration: res.roomName ? 6000 : toastConfig.toastOptions.success.duration,
        });
      }
      setShowForm(false);
    } catch (err) {
      const msg = err.response?.data?.message || t('patientRecords.errors.submitFailed');
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
      toast.success(t('patientRecords.toast.statusUpdateSuccess'));
    } catch {
      toast.error(t('patientRecords.toast.statusUpdateFailed'));
    }
  };

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="w-9 h-9 text-blue-600" />
          <span>{t('patientRecords.title')}</span>
          <CountBadge 
            currentCount={paginatedList.length} 
            totalCount={queueList.length} 
            label={t('patientRecords.label')}
          />
        </h1>
        <button 
          onClick={handleAddPatient}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('patientRecords.addButton')}
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="flex flex-wrap gap-4 mb-4">
        <CountBadge label={t('queueManagement.status.waiting')} count={statusCounts.Waiting} color="blue" />
        <CountBadge label={t('queueManagement.status.inProgress')} count={statusCounts.InProgress} color="orange" />
        <CountBadge label={t('queueManagement.status.completed')} count={statusCounts.Completed} color="green" />
        <CountBadge label={t('queueManagement.status.cancelled')} count={statusCounts.Cancelled} color="red" />
        <CountBadge label={t('patientRecords.stats.total')} count={queueList.length} color="gray" />
      </div>

      {/* Search Filter */}
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {queueError}
        </div>
      )}

      {/* BẢNG + PHÂN TRANG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loadingQueue ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">{t('patientRecords.loading')}</p>
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

            <div className="border-t border-gray-200 bg-gray-50">
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