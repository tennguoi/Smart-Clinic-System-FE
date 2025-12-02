// src/components/doctor/PrescriptionFormModal.jsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { useTheme } from '../../contexts/ThemeContext';

const PrescriptionFormModal = ({ record, onClose, onSuccess, onError }) => {
  const { theme } = useTheme();
  const [medications, setMedications] = useState([
    { id: 1, name: '', instruction: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMedication = () => {
    setMedications([...medications, { 
      id: Date.now(), 
      name: '', 
      instruction: '' 
    }]);
  };

  // Xóa thuốc
  const handleRemoveMedication = (id) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const handleUpdateMedication = (id, field, value) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    onError(null);

    const hasEmpty = medications.some(med => !med.name.trim() || !med.instruction.trim());
    if (hasEmpty) {
      setError('Vui lòng điền đầy đủ tên thuốc và hướng dẫn sử dụng cho tất cả các thuốc.');
      return;
    }

    const drugs = medications.map((med, idx) => 
      `${idx + 1}. ${med.name.trim()}`
    ).join('\n');
    
    const instructions = medications.map((med, idx) => 
      `${idx + 1}. ${med.instruction.trim()}`
    ).join('\n');

    setSubmitting(true);
    try {
      await medicalRecordApi.addPrescription({
        recordId: record.recordId,
        drugs: drugs,
        instructions: instructions,
      });

      setSuccess('Thêm toa thuốc thành công!');
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Thêm toa thuốc thất bại';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-3xl border rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Thêm Toa thuốc cho: <span className="text-blue-600">{record.diagnosis}</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className={`border px-3 py-2 rounded-md text-sm ${theme === 'dark' ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`border px-3 py-2 rounded-md text-sm ${theme === 'dark' ? 'bg-green-900/30 border-green-800 text-green-300' : 'bg-green-50 border-green-200 text-green-700'}`}>
              {success}
            </div>
          )}

          <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-3 py-2 text-left text-xs font-semibold uppercase w-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      STT
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Tên thuốc <span className="text-red-500">*</span>
                    </th>
                    <th className={`px-3 py-2 text-left text-xs font-semibold uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Hướng dẫn sử dụng <span className="text-red-500">*</span>
                    </th>
                    <th className={`px-3 py-2 text-center text-xs font-semibold uppercase w-16 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {medications.map((med, index) => (
                    <tr key={med.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-3 py-2 text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {index + 1}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleUpdateMedication(med.id, 'name', e.target.value)}
                          placeholder="VD: Paracetamol 500mg (10 viên)"
                          className={`w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                          required
                        />
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={med.instruction}
                          onChange={(e) => handleUpdateMedication(med.id, 'instruction', e.target.value)}
                          placeholder="VD: Uống 1 viên/lần, 3 lần/ngày sau ăn"
                          rows={2}
                          className={`w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                          required
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(med.id)}
                            className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                            aria-label="Xóa thuốc"
                            title="Xóa thuốc này"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddMedication}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Thêm thuốc</span>
          </button>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : 'Lưu Toa thuốc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionFormModal;
