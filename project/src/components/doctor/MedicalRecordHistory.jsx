
// src/components/doctor/MedicalRecordHistory.jsx
import { useState, useEffect } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { FileText, RefreshCw, Search } from 'lucide-react';

const MedicalRecordHistory = () => {
    
const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      // Lấy danh sách hồ sơ của bác sĩ (đã hoàn thành)
      const data = await medicalRecordApi.listMine();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Không thể tải lịch sử khám bệnh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Lắng nghe sự kiện từ màn hình khám hiện tại
    const handleRefresh = () => fetchHistory();
    window.addEventListener('medical-records:refresh', handleRefresh);

    return () => window.removeEventListener('medical-records:refresh', handleRefresh);
  }, []);

  // Lọc theo tên bệnh nhân hoặc chẩn đoán
  const filteredRecords = records.filter(
    (record) =>
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Lịch sử khám bệnh
        </h3>

        <button
          onClick={fetchHistory}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Danh sách các ca khám đã hoàn thành và lưu hồ sơ
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm tên bệnh nhân hoặc chẩn đoán..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-3">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Ngày khám</th>
              <th className="px-4 py-3 text-left">Bệnh nhân</th>
              <th className="px-4 py-3 text-left">Chẩn đoán</th>
              <th className="px-4 py-3 text-left">Ghi chú điều trị</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                  {searchTerm
                    ? 'Không tìm thấy kết quả phù hợp.'
                    : 'Chưa có lịch sử khám bệnh nào.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {record.patientName || 'Khách vãng lai'}
                  </td>
                  <td className="px-4 py-3">{record.diagnosis}</td>
                  <td className="px-4 py-3">{record.treatmentNotes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default MedicalRecordHistory;