// src/components/doctor/MedicalRecordHistory.jsx
import { useState, useEffect, useMemo } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { Search, ClipboardList, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTheme } from '../../contexts/ThemeContext';

const MedicalRecordHistory = () => {
  const { theme } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // LẤY ROLE CHÍNH XÁC TỪ localStorage (dựa đúng dữ liệu bạn đang lưu)
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

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let data;

      if (isAdmin) {
        // ADMIN → LẤY TOÀN BỘ HỒ SƠ
        data = await medicalRecordApi.getAllForAdmin();
      } else {
        // BÁC SĨ → chỉ lấy hồ sơ của mình
        data = await medicalRecordApi.listMine();
      }

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      toast.error('Không thể tải lịch sử khám bệnh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      console.log('Received medical-records:refresh event');
      fetchHistory();
    };
    window.addEventListener('medical-records:refresh', handleRefresh);
    return () => window.removeEventListener('medical-records:refresh', handleRefresh);
  }, []);

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

  // Lọc dữ liệu theo tên bệnh nhân, chẩn đoán và ngày tạo (createdAt)
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = 
        (record.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (record.diagnosis?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (filterStartDate || filterEndDate) {
        const recordDate = record.createdAt 
          ? new Date(record.createdAt).toISOString().split('T')[0] 
          : null;
        
        if (recordDate) {
          if (filterStartDate && recordDate < filterStartDate) matchesDate = false;
          if (filterEndDate && recordDate > filterEndDate) matchesDate = false;
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesDate;
    });
  }, [records, searchTerm, filterStartDate, filterEndDate]);

  // Phân trang
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const currentPageRecords = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div className={`px-4 sm:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster {...toastConfig} />
      
      <div className="mb-6">
        <h1 className={`text-4xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          <ClipboardList className={`w-9 h-9 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <span>Lịch Sử Khám Bệnh {isAdmin && '(Tất cả)'}</span>
          <CountBadge 
            currentCount={filteredRecords.length} 
            totalCount={records.length} 
            label="hồ sơ" 
          />
        </h1>
      </div>

      {/* Bộ lọc */}
      <div className={`rounded-xl shadow-md border p-6 mb-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên bệnh nhân hoặc chẩn đoán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-10 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
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
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Từ ngày</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                if (filterEndDate && newStartDate > filterEndDate) {
                  toast.error('Từ ngày phải nhỏ hơn hoặc bằng Đến ngày');
                  return;
                }
                setFilterStartDate(newStartDate);
              }}
              max={filterEndDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div className="lg:col-span-3">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Đến ngày</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                const newEndDate = e.target.value;
                if (filterStartDate && newEndDate < filterStartDate) {
                  toast.error('Đến ngày phải lớn hơn hoặc bằng Từ ngày');
                  return;
                }
                setFilterEndDate(newEndDate);
              }}
              min={filterStartDate || undefined}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          </div>

          <div className="lg:col-span-1">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>&nbsp;</label>
            <button
              onClick={handleClearFilters}
              className={`w-full px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${theme === 'dark' ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className={`rounded-xl shadow-md border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full">
          <thead className={`uppercase text-xs sticky top-0 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            <tr>
              <th className="px-4 py-3 text-center w-16">STT</th>
              <th className="px-4 py-3 text-left w-32">Ngày khám</th>
              <th className="px-4 py-3 text-left w-48">Bệnh nhân</th>
              <th className="px-4 py-3 text-left">Chẩn đoán</th>
              <th className="px-4 py-3 text-left">Ghi chú điều trị</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className={`px-4 py-10 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : currentPageRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className={`px-4 py-10 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm || filterStartDate || filterEndDate
                    ? 'Không tìm thấy kết quả phù hợp.'
                    : 'Chưa có lịch sử khám bệnh nào.'}
                </td>
              </tr>
            ) : (
              currentPageRecords.map((record, index) => (
                <tr key={record.recordId || record.id} className={`border-b transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentPage * pageSize + index + 1}
                  </td>
                  <td className={`px-4 py-3 text-sm whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {record.patientName || 'Khách vãng lai'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {record.diagnosis || '-'}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.treatmentNotes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};

export default MedicalRecordHistory;