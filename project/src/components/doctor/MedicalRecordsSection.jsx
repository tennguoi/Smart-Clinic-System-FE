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
    setSearchParams(prev => ({ ...prev, [name]: value }));
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
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowCreateForm(v => !v);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
            >
              {showCreateForm ? 'Đóng form' : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo hồ sơ mới
                </>
              )}
            </button>
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

      {/* KHỐI 2 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              name="keyword"
              placeholder="Tìm tên bệnh nhân, SĐT..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={searchParams.keyword}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && fetchMyRecords(1)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <input type="date" name="startDate" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all" value={searchParams.startDate} onChange={handleSearchChange} />
            <span className="text-gray-400">-</span>
            <input type="date" name="endDate" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all" value={searchParams.endDate} onChange={handleSearchChange} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => fetchMyRecords(1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-sm">
              <Search className="w-4 h-4" /> Tìm kiếm
            </button>
            <button
              onClick={handleResetSearch}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors"
              title="Xóa bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
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

                {/* BỌC TOÀN BỘ BẢNG + PHÂN TRANG ĐỂ ĐẨY XUỐNG DƯỚI */}
        <div className="min-h-96 flex flex-col justify-between">
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
          {/* PHÂN TRANG LUÔN Ở DƯỚI CÙNG, KHÔNG BAO GIỜ NHẢY */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-center">
              {renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsSection;