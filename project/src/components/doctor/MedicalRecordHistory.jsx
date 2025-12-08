import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { Search, ClipboardList, X, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';
import PatientHistoryModal from './PatientHistoryModal';

const MedicalRecordHistory = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // LẤY ROLE CHÍNH XÁC TỪ localStorage
  const getUserRoles = () => {
    try {
      const rolesStr = localStorage.getItem('user_roles');
      if (rolesStr) {
        return JSON.parse(rolesStr);
      }
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.role ? [user.role] : [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing user roles:', error);
      return [];
    }
  };

  const userRoles = getUserRoles();
  const isAdmin = userRoles.includes('ROLE_ADMIN');

  // ==================== TÌM KIẾM TỪ BACKEND (HISTORY SUMMARY) ====================
  const fetchRecords = async () => {
    setLoading(true);
    try {
      let data;

      // Sử dụng API mới để lấy danh sách nhóm theo bệnh nhân
      data = await medicalRecordApi.getHistorySummary({
        keyword: searchTerm.trim() || null,
        startDate: filterStartDate || null,
        endDate: filterEndDate || null
      });

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      toast.error(t('medicalRecords.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    fetchRecords();
  }, [searchTerm, filterStartDate, filterEndDate]);

  useEffect(() => {
    const handleRefresh = () => {
      console.log('Received medical-records:refresh event');
      fetchRecords();
    };
    window.addEventListener('medical-records:refresh', handleRefresh);
    return () => window.removeEventListener('medical-records:refresh', handleRefresh);
  }, [searchTerm, filterStartDate, filterEndDate]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStartDate('');
    setFilterEndDate('');
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filterStartDate, filterEndDate]);

  // Phân trang
  const totalPages = Math.ceil(records.length / pageSize);
  const currentPageRecords = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, currentPage, pageSize]);

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster {...toastConfig} />

      <div className="mb-6">
        <h1 className={`text-4xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          <ClipboardList className={`w-9 h-9 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <span>
            {t('medicalRecords.title')} {isAdmin && `(${t('medicalRecords.allRecords')})`}
          </span>
          <CountBadge
            currentCount={records.length}
            totalCount={records.length}
            label={t('medicalRecords.patientLabel')}
          />
        </h1>
      </div>

      {/* Bộ lọc tìm kiếm thống nhất */}
      <div className={`rounded-xl shadow-md border p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('medicalRecords.filters.searchLabelDetail')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập tên, số điện thoại, CCCD, BHYT hoặc chẩn đoán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('medicalRecords.filters.fromDate')}
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                if (filterEndDate && newStartDate > filterEndDate) {
                  toast.error(t('medicalRecords.errors.startDateAfterEnd'));
                  return;
                }
                setFilterStartDate(newStartDate);
              }}
              max={filterEndDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('medicalRecords.filters.toDate')}
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                const newEndDate = e.target.value;
                if (filterStartDate && newEndDate < filterStartDate) {
                  toast.error(t('medicalRecords.errors.endDateBeforeStart'));
                  return;
                }
                setFilterEndDate(newEndDate);
              }}
              min={filterStartDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>&nbsp;</label>
            <button
              onClick={handleClearFilters}
              className={`w-full px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              {t('medicalRecords.filters.clear')}
            </button>
          </div>
        </div>
      </div>



      {/* Bảng dữ liệu */}
      <div className={`rounded-xl shadow-md border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full">
          <thead className={`uppercase text-xs sticky top-0 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            <tr>
              <th className="px-4 py-3 text-center w-16">{t('medicalRecords.table.stt')}</th>
              <th className="px-4 py-3 text-left w-48">{t('medicalRecords.table.patient')}</th>
              <th className="px-4 py-3 text-left w-32">{t('medicalRecords.table.phone')}</th>
              <th className="px-4 py-3 text-left w-32">{t('medicalRecords.table.idNumber')}</th>
              <th className="px-4 py-3 text-left w-32">{t('medicalRecords.table.insurance')}</th>
              <th className="px-4 py-3 text-center w-24">{t('medicalRecords.table.visitCount')}</th>
              <th className="px-4 py-3 text-left w-32">{t('medicalRecords.table.lastVisit')}</th>
              <th className="px-4 py-3 text-center w-24">{t('common.actions')}</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className={`px-4 py-10 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('medicalRecords.common.loading')}
                </td>
              </tr>
            ) : currentPageRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className={`px-4 py-10 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm || filterStartDate || filterEndDate
                    ? t('medicalRecords.noResults')
                    : t('medicalRecords.noRecords')}
                </td>
              </tr>
            ) : (
              currentPageRecords.map((record, index) => (
                <tr key={index} className={`border-b transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentPage * pageSize + index + 1}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {record.patientName || t('medicalRecords.walkInPatient')}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {record.phone || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {record.idNumber || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {record.insuranceNumber || '-'}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {record.visitCount}
                  </td>
                  <td className={`px-4 py-3 text-sm whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {record.lastVisitDate
                      ? new Date(record.lastVisitDate).toLocaleDateString('vi-VN')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {record.patientId && (
                      <button
                        onClick={() => {
                          setSelectedPatient({
                            patientId: record.patientId,
                            patientName: record.patientName
                          });
                          setShowHistoryModal(true);
                        }}
                        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-600 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                        title={t('medicalRecords.viewHistory') || 'Xem lịch sử khám'}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* History Modal */}
      {
        showHistoryModal && selectedPatient && (
          <PatientHistoryModal
            patientId={selectedPatient.patientId}
            patientName={selectedPatient.patientName}
            onClose={() => {
              setShowHistoryModal(false);
              setSelectedPatient(null);
            }}
          />
        )
      }
    </div >
  );
};

export default MedicalRecordHistory;