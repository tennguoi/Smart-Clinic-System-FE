import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { Users, Plus, AlertTriangle, X, UserCheck, RefreshCw } from 'lucide-react';

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

// ✅ FIX: Improved date formatting function
const formatDateOfBirth = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Format as dd/MM/yyyy for display
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return '';
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

  // State cho duplicate patient dialog
  const [duplicateDialogData, setDuplicateDialogData] = useState(null);
  const [isProcessingDuplicate, setIsProcessingDuplicate] = useState(false);

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
        dob: item.dob || '', // ✅ Keep original ISO string
        dobFormatted: formatDateOfBirth(item.dob), // ✅ Add formatted version
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
        services: full.services || [],
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
          prev.map(p => p.queueId === editPatientId ? { 
            ...p, 
            ...res, 
            dob: res.dob || '',
            dobFormatted: formatDateOfBirth(res.dob)
          } : p)
        ));
        toast.success(t('patientRecords.toast.updateSuccess'));
        setShowForm(false);
      } else {
        const res = await queueApi.addPatient(patientForm);

        if (res.existingPatientFound) {
          setDuplicateDialogData({
            existingPatient: res,
            newPatientForm: { ...patientForm }
          });
          return;
        }

        const newItem = {
          ...res,
          dob: res.dob || '',
          dobFormatted: formatDateOfBirth(res.dob),
          status: normalizeStatus(res.status),
        };
        setQueueList(prev => sortQueueByPriority([newItem, ...prev]));
        setCurrentPage(0);

        const message = res.roomName
          ? t('patientRecords.toast.addSuccessWithRoom', {
            room: res.roomName,
            doctor: res.doctorName ? ` - ${t('queueManagement.doctor', { name: res.doctorName })}` : ''
          })
          : t('patientRecords.toast.addSuccess');

        toast.success(message, {
          duration: res.roomName ? 6000 : toastConfig.toastOptions.success.duration,
        });
        setShowForm(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('patientRecords.errors.submitFailed');
      toast.error(msg);
    }
  };

  const handleDuplicateConfirm = async (useExisting) => {
    if (!duplicateDialogData) return;

    setIsProcessingDuplicate(true);
    try {
      const result = await queueApi.addPatientWithExisting(
        duplicateDialogData.newPatientForm,
        useExisting
      );

      const newItem = {
        ...result,
        dob: result.dob || '',
        dobFormatted: formatDateOfBirth(result.dob),
        status: normalizeStatus(result.status),
      };
      setQueueList(prev => sortQueueByPriority([newItem, ...prev]));
      setCurrentPage(0);

      const successMessage = useExisting
        ? t('patientRecords.duplicateDialog.successUseExisting', { name: result.patientName })
        : t('patientRecords.duplicateDialog.successUpdateNew', { name: result.patientName });

      toast.success(successMessage, { duration: 5000 });
      setShowForm(false);
      setDuplicateDialogData(null);
    } catch (err) {
      const msg = err.response?.data?.message || t('patientRecords.errors.submitFailed');
      toast.error(msg);
    } finally {
      setIsProcessingDuplicate(false);
    }
  };

  const handleCloseDuplicateDialog = () => {
    setDuplicateDialogData(null);
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
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
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
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2">
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
        <div className={`border px-4 py-3 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {queueError}
        </div>
      )}

      {/* BẢNG + PHÂN TRANG */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden transition-colors duration-300`}>
        {loadingQueue ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('patientRecords.loading')}</p>
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

      {/* Duplicate Patient Dialog Modal */}
      {duplicateDialogData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className={`flex items-center gap-3 p-5 border-b ${theme === 'dark' ? 'border-gray-700 bg-amber-900/30' : 'border-amber-200 bg-amber-50'}`}>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>
                  {t('patientRecords.duplicateDialog.title')}
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-amber-600'}`}>
                  {t(`patientRecords.duplicateDialog.duplicateFieldLabels.${duplicateDialogData.existingPatient.duplicateField}`)}:
                  <span className="font-semibold ml-1">
                    "{duplicateDialogData.newPatientForm[duplicateDialogData.existingPatient.duplicateField]}"
                  </span>
                  {' '}{t('patientRecords.duplicateDialog.subtitle')}
                </p>
              </div>
              <button
                onClick={handleCloseDuplicateDialog}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - So sánh 2 thông tin */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thông tin bệnh nhân đã có */}
              <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  <UserCheck className="w-5 h-5" />
                  {t('patientRecords.duplicateDialog.existingPatientTitle')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelName')}:</span>{' '}
                    <span className="font-semibold">{duplicateDialogData.existingPatient.patientName}</span>
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelPhone')}:</span>{' '}
                    {duplicateDialogData.existingPatient.phone || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelDob')}:</span>{' '}
                    {formatDateOfBirth(duplicateDialogData.existingPatient.dob) || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelIdNumber')}:</span>{' '}
                    {duplicateDialogData.existingPatient.idNumber || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelInsurance')}:</span>{' '}
                    {duplicateDialogData.existingPatient.insuranceNumber || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Thông tin mới nhập */}
              <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                  <RefreshCw className="w-5 h-5" />
                  {t('patientRecords.duplicateDialog.newPatientTitle')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelName')}:</span>{' '}
                    <span className="font-semibold">{duplicateDialogData.newPatientForm.patientName}</span>
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelPhone')}:</span>{' '}
                    {duplicateDialogData.newPatientForm.phone || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelDob')}:</span>{' '}
                    {formatDateOfBirth(duplicateDialogData.newPatientForm.dob) || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelIdNumber')}:</span>{' '}
                    {duplicateDialogData.newPatientForm.idNumber || 'N/A'}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    <span className="font-medium">{t('patientRecords.duplicateDialog.labelInsurance')}:</span>{' '}
                    {duplicateDialogData.newPatientForm.insuranceNumber || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className={`px-5 pb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <p className="font-medium">{t('patientRecords.duplicateDialog.question')}</p>
            </div>

            {/* Action Buttons */}
            <div className="p-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDuplicateConfirm(true)}
                disabled={isProcessingDuplicate}
                className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${isProcessingDuplicate
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-blue-600 bg-blue-900/30 hover:bg-blue-800/50 text-blue-300'
                    : 'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <UserCheck className="w-5 h-5" />
                  {t('patientRecords.duplicateDialog.useExistingBtn')}
                </div>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-600'}`}>
                  {t('patientRecords.duplicateDialog.useExistingDesc')}
                </p>
              </button>

              <button
                onClick={() => handleDuplicateConfirm(false)}
                disabled={isProcessingDuplicate}
                className={`flex-1 p-4 rounded-lg border-2 transition-all text-left ${isProcessingDuplicate
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'border-green-600 bg-green-900/30 hover:bg-green-800/50 text-green-300'
                    : 'border-green-500 bg-green-50 hover:bg-green-100 text-green-700'
                  }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <RefreshCw className="w-5 h-5" />
                  {t('patientRecords.duplicateDialog.updateNewBtn')}
                </div>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-green-200' : 'text-green-600'}`}>
                  {t('patientRecords.duplicateDialog.updateNewDesc')}
                </p>
              </button>
            </div>

            {/* Cancel button */}
            <div className={`px-5 pb-5 border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleCloseDuplicateDialog}
                disabled={isProcessingDuplicate}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${isProcessingDuplicate ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('patientRecords.duplicateDialog.cancelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}