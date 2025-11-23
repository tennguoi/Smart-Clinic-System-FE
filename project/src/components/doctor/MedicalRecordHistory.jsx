// src/components/doctor/MedicalRecordHistory.jsx
import { useState, useEffect, useMemo } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { FileText, Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const MedicalRecordHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await medicalRecordApi.listMine();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể tải lịch sử khám bệnh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchHistory();
    window.addEventListener('medical-records:refresh', handleRefresh);
    return () => window.removeEventListener('medical-records:refresh', handleRefresh);
  }, []);

  const handleDateInput = (value, setter) => {
    if (!value) {
      setter('');
      setCurrentPage(1);
      return;
    }
    const parts = value.trim().split('/');
    if (parts.length !== 3) return;
    const [d, m, y] = parts;
    if (d.length > 2 || m.length > 2 || y.length !== 4) return;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    if (!isNaN(new Date(iso).getTime())) {
      setter(iso);
      setCurrentPage(1);
    }
  };

  const filteredAndPaginatedRecords = useMemo(() => {
    let filtered = [...records];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        (r.patientName || '').toLowerCase().includes(lower) ||
        (r.patientPhone || '').toLowerCase().includes(lower) ||
        (r.diagnosis || '').toLowerCase().includes(lower)
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter(r => {
        if (!r.createdAt) return false;
        const d = new Date(r.createdAt);
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
        return true;
      });
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const startIdx = (currentPage - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);

    return { items, total };
  }, [records, searchTerm, startDate, endDate, currentPage]);

  const totalPages = Math.ceil(filteredAndPaginatedRecords.total / pageSize);
  const hasActiveFilter = searchTerm || startDate || endDate;
  const startNumber = (currentPage - 1) * pageSize + 1;

  const clearAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-5">
        <h3 className="text-xl font-bold flex items-center gap-3">
          <FileText className="w-6 h-6" />
          Lịch sử khám bệnh
        </h3>
        <p className="text-blue-100 mt-1">
          Tổng: <strong>{filteredAndPaginatedRecords.total}</strong> hồ sơ
        </p>
      </div>

      {/* Bộ lọc */}
      <div className="p-5 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="md:col-span-3 relative">
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="dd/MM/yyyy"
              value={startDate ? format(new Date(startDate), 'dd/MM/yyyy') : ''}
              onChange={(e) => handleDateInput(e.target.value, setStartDate)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <label className="absolute -top-2 left-3 bg-gray-50 px-2 text-xs text-gray-600">Từ ngày</label>
          </div>

          <div className="md:col-span-3 relative">
            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="dd/MM/yyyy"
              value={endDate ? format(new Date(endDate), 'dd/MM/yyyy') : ''}
              onChange={(e) => handleDateInput(e.target.value, setEndDate)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              type="date"
              value={endDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <label className="absolute -top-2 left-3 bg-gray-50 px-2 text-xs text-gray-600">Đến ngày</label>
          </div>

          {/* Nút Xóa bộ lọc - màu XÁM đẹp */}
          {hasActiveFilter && (
            <div className="md:col-span-2">
              <button
                onClick={clearAllFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow transition hover:shadow-md"
              >
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bảng có STT */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3 text-center w-16">STT</th>
              <th className="px-6 py-3 text-left">Ngày khám</th>
              <th className="px-6 py-3 text-left">Bệnh nhân</th>
              <th className="px-6 py-3 text-left">SĐT</th>
              <th className="px-6 py-3 text-left">Chẩn đoán</th>
              <th className="px-6 py-3 text-left">Ghi chú điều trị</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-16 text-gray-500">
                  <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredAndPaginatedRecords.items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg">
                    {hasActiveFilter ? 'Không tìm thấy hồ sơ nào phù hợp.' : 'Chưa có lịch sử khám bệnh.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredAndPaginatedRecords.items.map((record, index) => (
                <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-center font-medium text-gray-600">
                    {startNumber + index}
                  </td>
                  <td className="px-6 py-3 font-medium">
                    {record.createdAt ? format(new Date(record.createdAt), 'dd/MM/yyyy') : '—'}
                  </td>
                  <td className="px-6 py-3 font-medium text-blue-700">
                    {record.patientName || 'Khách vãng lai'}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{record.patientPhone || '—'}</td>
                  <td className="px-6 py-3">{record.diagnosis || '—'}</td>
                  <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                    {record.treatmentNotes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-center gap-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-white disabled:opacity-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            Trang <strong className="text-blue-600">{currentPage}</strong> / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-white disabled:opacity-50 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordHistory;