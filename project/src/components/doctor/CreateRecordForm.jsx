// src/components/doctor/CreateRecordForm.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';

const CreateRecordForm = ({ 
  onClose, 
  onSubmit, 
  error, 
  success, 
  submitting 
}) => {
  const [formPatientName, setFormPatientName] = useState(() => {
    const savedPatientName = localStorage.getItem('create_record_patient_name');
    if (savedPatientName) {
      localStorage.removeItem('create_record_patient_name');
      return savedPatientName;
    }
    return '';
  });
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatmentNotes, setFormTreatmentNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation: Kiểm tra các trường bắt buộc
    if (!formDiagnosis.trim()) {
      toast.error('⚠️ Vui lòng nhập chẩn đoán');
      return;
    }
    
    if (!formTreatmentNotes.trim()) {
      toast.error('⚠️ Vui lòng nhập ghi chú điều trị');
      return;
    }
    
    onSubmit({
      patientName: formPatientName,
      diagnosis: formDiagnosis,
      treatmentNotes: formTreatmentNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-30">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Tạo hồ sơ mới</h3>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh nhân</label>
              <input
                type="text"
                value={formPatientName}
                onChange={(e) => setFormPatientName(e.target.value)}
                placeholder="Nhập tên bệnh nhân (tùy chọn)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chẩn đoán <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formDiagnosis}
                onChange={(e) => setFormDiagnosis(e.target.value)}
                required
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                  formDiagnosis.trim() 
                    ? 'border-green-300 focus:ring-green-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Nhập chẩn đoán"
              />
              {!formDiagnosis.trim() && (
                <p className="text-xs text-red-500 mt-1">Trường này không được để trống</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú điều trị <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formTreatmentNotes}
                onChange={(e) => setFormTreatmentNotes(e.target.value)}
                rows={4}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                  formTreatmentNotes.trim() 
                    ? 'border-green-300 focus:ring-green-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Phác đồ, thuốc, dặn dò..."
              />
              {!formTreatmentNotes.trim() && (
                <p className="text-xs text-red-500 mt-1">Trường này không được để trống</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !formDiagnosis.trim() || !formTreatmentNotes.trim()}
              title={!formDiagnosis.trim() || !formTreatmentNotes.trim() ? 'Vui lòng điền đầy đủ chẩn đoán và ghi chú điều trị' : ''}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecordForm;

