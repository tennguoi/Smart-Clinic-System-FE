import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import CreateRecordForm from './CreateRecordForm';
import RecordRow from './RecordRow';
import { Plus, ClipboardList, Search, RotateCcw, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  const fetchMyRecords = useCallback(async (page = 1) => {
    setRecordsError('');
    setRecordsLoading(true);
    try {
      let list = [];
      let total = 0;

      const hasFilter = searchParams.keyword || searchParams.startDate || searchParams.endDate;

      if (hasFilter) {
        const result = await medicalRecordApi.search({ ...searchParams, page, limit: ITEMS_PER_PAGE });
        list = Array.isArray(result.data) ? result.data : result;
        total = result.total ?? list.length;
      } else {
        const result = await medicalRecordApi.listMine({ page, limit: ITEMS_PER_PAGE });
        list = Array.isArray(result.data) ? result.data : result;
        total = result.total ?? list.length;
      }

      const recordsWithNames = list.map(record => {
        const storedName = patientNameMapRef.current.get(record.recordId);
        return {
          ...record,
          patientName: record.patientName || storedName || null,
        };
      });

      setRecords(recordsWithNames);
      setTotalRecords(total);
      setCurrentPage(page);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('doctorRecords.errors.loadFailed');
      setRecordsError(msg);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setRecordsLoading(false);
    }
  }, [searchParams, t]);

  useEffect(() => {
    fetchMyRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchMyRecords(1);
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
      return;
    }
    if (!formData.treatmentNotes?.trim()) {
      setFormError(t('doctorRecords.create.treatmentNotesRequired'));
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

      const patientNameValue = created.patientName || formData.patientName?.trim() || null;
      if (patientNameValue && created.recordId && !created.patientName) {
        patientNameMapRef.current.set(created.recordId, patientNameValue);
      }

      setShowCreateForm(false);
      setTimeout(() => {
        setFormSuccess('');
        fetchMyRecords(currentPage);
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t('doctorRecords.create.failed');
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Pagination UI
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-2 mt-6 pb-6">
        <button onClick={() => fetchMyRecords(1)} disabled={currentPage === 1 || recordsLoading}
          className={`w-10 h-10 rounded border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button onClick={() => fetchMyRecords(currentPage - 1)} disabled={currentPage === 1 || recordsLoading}
          className={`w-10 h-10 rounded border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => fetchMyRecords(1)} className={`w-10 h-10 rounded border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>1</button>
            {start > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => fetchMyRecords(p)}
            disabled={recordsLoading}
            className={`w-10 h-10 rounded font-medium transition-all ${
              p === currentPage 
                ? 'bg-orange-500 text-white border border-orange-500' 
                : (theme === 'dark' ? 'border border-gray-600 hover:bg-gray-700 text-gray-300' : 'border border-gray-300 hover:bg-gray-100')
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button onClick={() => fetchMyRecords(totalPages)} className={`w-10 h-10 rounded border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>
              {totalPages}
            </button>
          </>
        )}

        <button onClick={() => fetchMyRecords(currentPage + 1)} disabled={currentPage === totalPages || recordsLoading}
          className={`w-10 h-10 rounded border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={() => fetchMyRecords(totalPages)} disabled={currentPage === totalPages || recordsLoading}
          className={`w-10 h-10 rounded border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-100'}`}>
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* KHỐI 1 */}
      <div className={`rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b relative ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}/>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t('doctorRecords.title')}</h2>
            </div>
            
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${theme === 'dark' ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <Plus className="w-4 h-4" />
              {t('doctorRecords.create.newRecord')}
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div className="p-6 border-t animate-fadeIn">
            <CreateRecordForm
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleCreateRecord}
              error={formError}
              success={formSuccess}
              submitting={formSubmitting}
            />
          </div>
        )}
      </div>

      {/* KHỐI 2: BỘ LỌC */}
      <div className={`rounded-lg border shadow-sm p-5 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Keyword */}
          <div className="md:col-span-5">
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('doctorRecords.filters.keyword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="keyword"
                placeholder={t('doctorRecords.filters.keywordPlaceholder')}
                className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                value={searchParams.keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Date range */}
          <div className="md:col-span-5 flex gap-2 items-end">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('doctorRecords.filters.fromDate')}
              </label>
              <input 
                type="date" 
                name="startDate" 
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} 
                value={searchParams.startDate} 
                onChange={handleSearchChange}
                max={searchParams.endDate || today}
              />
            </div>
            <span className="text-gray-400 mb-2">-</span>
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('doctorRecords.filters.toDate')}
              </label>
              <input 
                type="date" 
                name="endDate" 
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} 
                value={searchParams.endDate} 
                onChange={handleSearchChange}
                min={searchParams.startDate}
                max={today}
              />
            </div>
          </div>

          {/* Clear button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleResetSearch}
              className={`w-full border px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
              title={t('doctorRecords.filters.clear')}
            >
              <RotateCcw className="w-4 h-4" />
              {t('doctorRecords.filters.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI 3 */}
      <div className={`rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t('doctorRecords.listTitle')} {totalRecords > 0 && `(${t('common.total')}: ${totalRecords})`}
          </h2>
          {recordsLoading && (
            <span className="text-sm text-blue-500 font-medium animate-pulse">
              {t('common.loading')}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('doctorRecords.common.stt')}</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('doctorRecords.table.patient')}</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('doctorRecords.table.diagnosis')}</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('doctorRecords.table.treatmentNotes')}</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{t('doctorRecords.common.actions')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    {recordsLoading
                      ? t('common.loading')
                      : (searchParams.keyword || searchParams.startDate || searchParams.endDate
                          ? t('doctorRecords.noResults')
                          : t('doctorRecords.noRecords')
                      )}
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <RecordRow
                    key={r.recordId}
                    index={(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    record={r}
                    onUpdated={() => fetchMyRecords(currentPage)}
                    onError={setFormError}
                    onDelete={(recordId) => patientNameMapRef.current.delete(recordId)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG - luôn ở dưới cùng */}
        <div className={`border-t px-6 py-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-center">
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsSection;