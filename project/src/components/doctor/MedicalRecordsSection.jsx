import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import CreateRecordForm from './CreateRecordForm';
import RecordRow from './RecordRow';
import { Plus, ClipboardList, Search, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import PatientHistoryModal from './PatientHistoryModal';

// 🔥 Thêm import Toast vào component
import toast, { Toaster } from "react-hot-toast";
import { toastConfig } from "../../config/toastConfig";

const ITEMS_PER_PAGE = 10;

const MedicalRecordsSection = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    startDate: '',
    endDate: ''
  });

  const patientNameMapRef = useRef(new Map());
  const today = new Date().toISOString().split('T')[0];

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const paginatedRecords = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return records.slice(start, start + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));

  const fetchMyRecords = useCallback(async () => {
    setRecordsError('');
    setRecordsLoading(true);
    setCurrentPage(0);

    try {
      let list = [];
      const hasFilter = searchParams.keyword || searchParams.startDate || searchParams.endDate;

      if (hasFilter) {
        const result = await medicalRecordApi.search({ ...searchParams, page: 1, limit: 10000 });
        list = Array.isArray(result.data) ? result.data : result;
      } else {
        const result = await medicalRecordApi.listMine({ page: 1, limit: 10000 });
        list = Array.isArray(result.data) ? result.data : result;
      }

      const recordsWithNames = list.map(record => {
        const storedName = patientNameMapRef.current.get(record.recordId);
        return {
          ...record,
          patientName: record.patientName || storedName || null,
        };
      });

      setRecords(recordsWithNames);
      setTotalRecords(recordsWithNames.length);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('doctorRecords.errors.loadFailed');
      setRecordsError(msg);
      setRecords([]);
      setTotalRecords(0);
      toast.error(msg);
    } finally {
      setRecordsLoading(false);
    }
  }, [searchParams, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchParams, fetchMyRecords]);

  const [showCreateForm, setShowCreateForm] = useState(() => {
    const saved = localStorage.getItem('create_record_patient_name');
    if (saved) {
      localStorage.removeItem('create_record_patient_name');
      return true;
    }
    return false;
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleResetSearch = () => {
    setSearchParams({ keyword: '', startDate: '', endDate: '' });
  };

  const handleCreateRecord = async (formData) => {
    setFormError('');
    setFormSuccess('');

    if (!formData.diagnosis?.trim()) {
      setFormError(t('doctorRecords.create.diagnosisRequired'));
      toast.error(t('doctorRecords.create.diagnosisRequired'));
      return;
    }
    if (!formData.treatmentNotes?.trim()) {
      setFormError(t('doctorRecords.create.treatmentNotesRequired'));
      toast.error(t('doctorRecords.create.treatmentNotesRequired'));
      return;
    }

    setFormSubmitting(true);
    try {
      const created = await medicalRecordApi.create({
        patientId: null,
        patientName: formData.patientName?.trim() || null,
        diagnosis: formData.diagnosis.trim(),
        treatmentNotes: formData.treatmentNotes.trim(),
      });

      setFormSuccess(t('doctorRecords.create.success'));
      toast.success(t('doctorRecords.create.success'));

      const patientNameValue = created.patientName || formData.patientName?.trim() || null;
      if (patientNameValue && created.recordId && !created.patientName) {
        patientNameMapRef.current.set(created.recordId, patientNameValue);
      }

      setShowCreateForm(false);
      setTimeout(() => {
        setFormSuccess('');
        fetchMyRecords();
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('doctorRecords.create.failed');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleViewHistory = (patientId, patientName) => {
    if (patientId) {
      setSelectedPatient({ patientId, patientName });
      setShowHistoryModal(true);
    }
  };

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>

      {/* 🔥 Toaster đặt trực tiếp trong component */}
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
          <ClipboardList className="w-9 h-9 text-blue-600" />
          <span>{t('doctorRecords.title')}</span>
          <CountBadge
            currentCount={paginatedRecords.length}
            totalCount={records.length}
            label={t('doctorRecords.label')}
          />
        </h1>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('doctorRecords.create.newRecord')}
        </button>
      </div>

      {/* CREATE FORM */}
      {showCreateForm && (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border p-6 mb-6 transition-colors duration-300 animate-fadeIn`}>
          <CreateRecordForm
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleCreateRecord}
            error={formError}
            success={formSuccess}
            submitting={formSubmitting}
          />
        </div>
      )}
 {/* FILTERS */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border p-6 mb-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('medicalRecords.filters.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="keyword"
                placeholder={t('medicalRecords.filters.searchPlaceholder')}
                className={`w-full pl-9 pr-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                value={searchParams.keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('medicalRecords.filters.fromDate')}
            </label>
            <input
              type="date"
              name="startDate"
              className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              value={searchParams.startDate}
              onChange={handleSearchChange}
              max={searchParams.endDate || today}
            />
          </div>

          {/* End Date */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('medicalRecords.filters.toDate')}
            </label>
            <input
              type="date"
              name="endDate"
              className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              value={searchParams.endDate}
              onChange={handleSearchChange}
              min={searchParams.startDate}
              max={today}
            />
          </div>

          {/* Clear button */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>&nbsp;</label>
            <button
              onClick={handleResetSearch}
              className={`w-full px-4 py-3 rounded-xl transition font-medium whitespace-nowrap flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              <RotateCcw className="w-4 h-4" />
              {t('medicalRecords.filters.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {recordsError && (
        <div className={`rounded-xl border px-4 py-3 mb-6 ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {recordsError}
        </div>
      )}

      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md border overflow-hidden transition-colors duration-300`}>
        {recordsLoading ? (
          <div className={`p-16 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className="text-red-600 font-semibold">
              {(searchParams.keyword || searchParams.startDate || searchParams.endDate)
                ? t('doctorRecords.noResults')
                : t('doctorRecords.noRecords')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    <th className={`text-center px-4 py-3 text-xs font-bold uppercase tracking-wider w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('medicalRecords.table.stt')}
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('medicalRecords.table.patient')}
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('medicalRecords.table.diagnosis')}
                    </th>
                    <th className={`text-left px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('medicalRecords.table.treatmentNotes')}
                    </th>
                    <th className={`text-center px-6 py-3 text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('medicalRecords.common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedRecords.map((r, idx) => (
                    <RecordRow
                      key={r.recordId}
                      index={currentPage * ITEMS_PER_PAGE + idx + 1}
                      record={r}
                      onUpdated={fetchMyRecords}
                      onError={(msg) => toast.error(msg)}
                      onDelete={(recordId) => patientNameMapRef.current.delete(recordId)}
                      onViewHistory={handleViewHistory}
                    />
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* History Modal */}
      {showHistoryModal && selectedPatient && (
        <PatientHistoryModal
          patientId={selectedPatient.patientId}
          patientName={selectedPatient.patientName}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default MedicalRecordsSection;