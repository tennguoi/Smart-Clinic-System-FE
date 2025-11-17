import { useState, useEffect } from 'react';
import { Search, FileText, Download, Printer, X } from 'lucide-react';
import { prescriptionApi } from '../api/prescriptionApi';
import PrescriptionPDF from './PrescriptionPDF';

export default function PrescriptionExportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      // Lấy tất cả prescriptions - có thể cần thêm filter theo ngày
      // Tạm thời lấy từ patientId cụ thể hoặc tất cả
      // Bạn có thể cần tạo API endpoint mới để lấy tất cả prescriptions
      setPrescriptions([]);
    } catch (err) {
      setError('Không thể tải danh sách toa thuốc');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Vui lòng nhập mã toa thuốc');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const prescription = await prescriptionApi.getPrescriptionByCode(searchTerm.trim());
      if (prescription) {
        setSelectedPrescription(prescription);
        setShowPDF(true);
      } else {
        setError('Không tìm thấy toa thuốc với mã: ' + searchTerm);
      }
    } catch (err) {
      setError('Không tìm thấy toa thuốc với mã: ' + searchTerm);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">📄 Xuất toa thuốc PDF</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Search by prescription code */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tìm kiếm toa thuốc</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Nhập mã toa thuốc (VD: RX12345678)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tìm...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Tìm kiếm</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 Nhập mã toa thuốc để tìm và xuất PDF. Mã toa thuốc thường có định dạng RX + 8 ký tự.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Hướng dẫn xuất toa thuốc</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Nhập mã toa thuốc vào ô tìm kiếm (mã được in trên toa thuốc)</li>
          <li>Nhấn nút "Tìm kiếm" hoặc Enter</li>
          <li>Khi tìm thấy, cửa sổ xem trước PDF sẽ hiển thị</li>
          <li>Nhấn nút "In toa thuốc" hoặc "Tải PDF" để xuất file</li>
          <li>In trực tiếp từ trình duyệt hoặc lưu file PDF</li>
        </ol>
      </div>

      {/* PDF Preview Modal */}
      {showPDF && selectedPrescription && (
        <PrescriptionPDF
          prescription={selectedPrescription}
          onClose={() => {
            setShowPDF(false);
            setSelectedPrescription(null);
          }}
        />
      )}
    </div>
  );
}

