// src/components/doctor/MedicalRecordsSection.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import CreateRecordForm from './CreateRecordForm';
import RecordRow from './RecordRow';
import { Plus, ClipboardList, Search, RotateCcw, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const MedicalRecordsSection = () => {
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    startDate: '',
    endDate: ''
  });
  const patientNameMapRef = useRef(new Map());

  // Lấy ngày hiện tại định dạng YYYY-MM-DD để làm mốc giới hạn
  const today = new Date().toISOString().split('T')[0];

  // PHẦN MỚI: Phân trang
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

      const startIdx = (page - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;
      const paginatedList = list.slice(startIdx, endIdx);

      const recordsWithNames = paginatedList.map((record) => {
        const storedPatientName = patientNameMapRef.current.get(record.recordId);
        return {
          ...record,
          patientName: record.patientName || storedPatientName || null,
        };
      });

      setRecords(recordsWithNames);
      setTotalRecords(total);
      setCurrentPage(page);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể tải hồ sơ khám';
      setRecordsError(msg);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setRecordsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMyRecords(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchMyRecords(1);
  }, [searchParams]);

  const [showCreateForm, setShowCreateForm] = useState(() => {
    const savedPatientName = localStorage.getItem('create_record_patient_name');
    if (savedPatientName) {
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
    setSearchParams(prev => {
      const newParams = { ...prev, [name]: value };
      
      // Logic tự động sửa nếu người dùng cố tình nhập tay sai (validation logic)
      // Tuy nhiên với input type="date" có min/max thì UI đã chặn phần lớn rồi
      if (name === 'startDate' && newParams.endDate && value > newParams.endDate) {
         // Nếu chọn ngày bắt đầu lớn hơn ngày kết thúc -> Reset ngày kết thúc hoặc set bằng ngày bắt đầu
         // Ở đây mình giữ nguyên để input min/max lo liệu việc hiển thị đỏ/cảnh báo
      }
      return newParams;
    });
  };

  const handleResetSearch = () => {
    setSearchParams({ keyword: '', startDate: '', endDate: '' });
  };

  const handleCreateRecord = async (formData) => {
    setFormError('');
    setFormSuccess('');

    if (!formData.diagnosis || !formData.diagnosis.trim()) {
      setFormError('Chẩn đoán là bắt buộc');
      return;
    }

    if (!formData.treatmentNotes || !formData.treatmentNotes.trim()) {
      setFormError('Ghi chú điều trị là bắt buộc');
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
      setFormSuccess('Đã hoàn thành và lưu hồ sơ khám bệnh!');

      const patientNameValue = created.patientName || (formData.patientName && formData.patientName.trim()) || null;
      if (patientNameValue && created.recordId && !created.patientName) {
        patientNameMapRef.current.set(created.recordId, patientNameValue);
      }
      setShowCreateForm(false);

      setTimeout(() => {
        setFormSuccess('');
        fetchMyRecords(currentPage);
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Tạo hồ sơ khám thất bại';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // UI Phân trang
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
          className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <ChevronsLeft className="w-5 h-5" />
        </button>

        <button onClick={() => fetchMyRecords(currentPage - 1)} disabled={currentPage === 1 || recordsLoading}
          className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>

        {start > 1 && (
          <>
            <button onClick={() => fetchMyRecords(1)} className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100">1</button>
            {start > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => fetchMyRecords(p)}
            disabled={recordsLoading}
            className={`w-10 h-10 rounded font-medium transition-all ${p === currentPage ? 'bg-orange-500 text-white border border-orange-500' : 'border border-gray-300 hover:bg-gray-100'}`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button onClick={() => fetchMyRecords(totalPages)} className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100">
              {totalPages}
            </button>
          </>
        )}

        <button onClick={() => fetchMyRecords(currentPage + 1)} disabled={currentPage === totalPages || recordsLoading}
          className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>

        <button onClick={() => fetchMyRecords(totalPages)} disabled={currentPage === totalPages || recordsLoading}
          className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* KHỐI 1 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-600"/>
              <h2 className="text-lg font-semibold text-gray-800">Quản lý Hồ sơ & Hoàn thành khám</h2>
            </div>
            
          </div>
          {showCreateForm && (
            <div className="mt-4 animate-fadeIn">
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
      </div>

      {/* KHỐI 2: BỘ LỌC ĐÃ ĐƯỢC CÂN LẠI */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Cột 1: Tìm kiếm từ khóa (Chiếm 5 phần) */}
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ khóa tìm kiếm
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="keyword"
                placeholder="Nhập tên bệnh nhân, SĐT..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={searchParams.keyword}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Cột 2: Lọc theo ngày (Chiếm 5 phần) */}
          <div className="md:col-span-5 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input 
                type="date" 
                name="startDate" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                value={searchParams.startDate} 
                onChange={handleSearchChange}
                max={searchParams.endDate || today} // Không lớn hơn ngày tới (hoặc hôm nay)
              />
            </div>
            <span className="text-gray-400 mb-2">-</span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input 
                type="date" 
                name="endDate" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all" 
                value={searchParams.endDate} 
                onChange={handleSearchChange}
                min={searchParams.startDate} // Không nhỏ hơn ngày từ
                max={today} // Không được chọn tương lai
              />
            </div>
          </div>

          {/* Cột 3: Nút xóa bộ lọc (Chiếm 2 phần) - Căn phải hoặc fill */}
          {/* ĐÃ SỬA: Nút màu xám */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleResetSearch}
              className="w-full bg-gray-100 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 font-medium transition-colors"
              title="Đặt lại điều kiện lọc"
            >
              <RotateCcw className="w-4 h-4" />
              Xóa bộ lọc
            </button>
          </div>

        </div>
      </div>

      {/* KHỐI 3 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Danh sách hồ sơ đã tạo {totalRecords > 0 && `(Tổng: ${totalRecords})`}
          </h2>
          {recordsLoading && <span className="text-sm text-blue-500 font-medium animate-pulse">Đang tải dữ liệu...</span>}
        </div>

        {/* Bảng dữ liệu - Để tự nhiên, không fix chiều cao */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chẩn đoán</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    {recordsLoading
                      ? 'Đang tìm kiếm...'
                      : (searchParams.keyword || searchParams.startDate || searchParams.endDate
                          ? 'Không tìm thấy hồ sơ nào phù hợp với bộ lọc.'
                          : 'Chưa có hồ sơ nào. Hãy nhấn "Tạo hồ sơ mới" để hoàn thành ca khám.')}
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
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-center">
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsSection;