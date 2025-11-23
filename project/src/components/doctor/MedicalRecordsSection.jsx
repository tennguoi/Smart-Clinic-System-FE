// src/components/doctor/MedicalRecordsSection.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import CreateRecordForm from './CreateRecordForm';
import RecordRow from './RecordRow';
import { Plus, ClipboardList, Search, RotateCcw } from 'lucide-react';

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

  const fetchMyRecords = useCallback(async () => {
    setRecordsError('');
    setRecordsLoading(true);
    try {
      let list;
      
      const hasFilter = searchParams.keyword || searchParams.startDate || searchParams.endDate;

      if (hasFilter) {
        list = await medicalRecordApi.search(searchParams);
      } else {
        list = await medicalRecordApi.listMine();
      }

      const recordsWithNames = (Array.isArray(list) ? list : []).map((record) => {
        const storedPatientName = patientNameMapRef.current.get(record.recordId);
        return {
          ...record,
          patientName: record.patientName || storedPatientName || null,
        };
      });
      setRecords(recordsWithNames);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Không thể tải hồ sơ khám';
      setRecordsError(msg);
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMyRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    medicalRecordApi.listMine().then(list => {
        const recordsWithNames = (Array.isArray(list) ? list : []).map((record) => {
            const storedPatientName = patientNameMapRef.current.get(record.recordId);
            return { ...record, patientName: record.patientName || storedPatientName || null };
        });
        setRecords(recordsWithNames);
    });
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
      setFormSuccess('✅ Đã hoàn thành và lưu hồ sơ khám bệnh!');
      
      const patientNameValue = created.patientName || (formData.patientName && formData.patientName.trim()) || null;
      if (patientNameValue && created.recordId && !created.patientName) {
        patientNameMapRef.current.set(created.recordId, patientNameValue);
      }
      setShowCreateForm(false);
      
      setTimeout(() => {
        setFormSuccess('');
        fetchMyRecords();
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Tạo hồ sơ khám thất bại';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
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
                setShowCreateForm((v) => !v);
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
              placeholder="🔍 Tìm tên bệnh nhân, SĐT..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={searchParams.keyword}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && fetchMyRecords()}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <input 
              type="date" 
              name="startDate"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
              value={searchParams.startDate}
              onChange={handleSearchChange}
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              name="endDate"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
              value={searchParams.endDate}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={fetchMyRecords}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
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
          <h2 className="text-lg font-semibold text-gray-800">Danh sách hồ sơ đã tạo</h2>
          {recordsLoading && <span className="text-sm text-blue-500 font-medium animate-pulse">Đang tải dữ liệu...</span>}
        </div>
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
                      : (searchParams.keyword || searchParams.startDate 
                          ? '🔍 Không tìm thấy hồ sơ nào phù hợp với bộ lọc.' 
                          : 'Chưa có hồ sơ nào. Hãy nhấn "Tạo hồ sơ mới" để hoàn thành ca khám.')}
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <RecordRow
                    key={r.recordId}
                    index={idx + 1}
                    record={r}
                    onUpdated={fetchMyRecords}
                    onError={setFormError}
                    onDelete={(recordId) => {
                      patientNameMapRef.current.delete(recordId);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsSection;