// src/components/doctor/MedicalRecordsSection.jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import CreateRecordForm from './CreateRecordForm';
import RecordRow from './RecordRow';

const MedicalRecordsSection = () => {
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const patientNameMapRef = useRef(new Map());

  const fetchMyRecords = useCallback(async () => {
    setRecordsError('');
    setRecordsLoading(true);
    try {
      const list = await medicalRecordApi.listMine();
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
  }, []);

  useEffect(() => {
    fetchMyRecords();
  }, [fetchMyRecords]);

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

  const handleCreateRecord = async (formData) => {
    setFormError('');
    setFormSuccess('');
    if (!formData.diagnosis || !formData.diagnosis.trim()) {
      setFormError('Chẩn đoán (diagnosis) là bắt buộc');
      return;
    }
    setFormSubmitting(true);
    try {
      const created = await medicalRecordApi.create({
        patientId: null,
        patientName: formData.patientName?.trim() || null,
        diagnosis: formData.diagnosis.trim(),
        treatmentNotes: formData.treatmentNotes?.trim() || '',
      });
      setFormSuccess('Tạo hồ sơ khám thành công!');
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Hồ sơ khám</h2>
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowCreateForm((v) => !v);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showCreateForm ? 'Đóng' : 'Tạo hồ sơ mới'}
            </button>
          </div>

          {showCreateForm && (
            <CreateRecordForm
              onClose={() => setShowCreateForm(false)}
              onSubmit={handleCreateRecord}
              error={formError}
              success={formSuccess}
              submitting={formSubmitting}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Hồ sơ đã tạo</h2>
          {recordsLoading && <span className="text-sm text-gray-500">Đang tải...</span>}
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
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Chưa có hồ sơ.</td>
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

