// src/components/doctor/CreateRecordForm.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const CreateRecordForm = ({ 
  onClose, 
  onSubmit, 
  // nhận object { patientName, diagnosis, treatmentNotes, ... }
  error, 
  success, 
  submitting 
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [formPatientName, setFormPatientName] = useState(() => {
    const saved = localStorage.getItem('create_record_patient_name');
    if (saved) {
      localStorage.removeItem('create_record_patient_name');
      return saved;
    }
    return '';
  });

  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTreatmentNotes, setFormTreatmentNotes] = useState('');

  // Optional: tự động focus vào ô chẩn đoán khi mở form
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('input[placeholder*="chẩn đoán"]')?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formDiagnosis.trim()) {
      toast.error(t('doctorRecords.create.diagnosisRequired'));
      return;
    }

    if (!formTreatmentNotes.trim()) {
      toast.error(t('doctorRecords.create.treatmentNotesRequired'));
      return;
    }

    onSubmit({
      patientName: formPatientName.trim() || null,
      diagnosis: formDiagnosis.trim(),
      treatmentNotes: formTreatmentNotes.trim(),
    });
  };

  const isDiagnosisValid = formDiagnosis.trim().length > 0;
  const isTreatmentValid = formTreatmentNotes.trim().length > 0;

  return (
    <div className="fixed inset-0 z-30">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-lg border rounded-xl shadow-2xl p-6 space-y-4 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {t('doctorRecords.create.newRecord') || 'Tạo hồ sơ mới'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md ${
                theme === 'dark'
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={t('doctorRecords.common.cancel')}
            >
              ✕
            </button>
          </div>

          {/* Server messages */}
          {error && (
            <div className={`border px-3 py-2 rounded-md text-sm ${
              theme === 'dark'
                ? 'bg-red-900/30 border-red-800 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`border px-3 py-2 rounded-md text-sm ${
              theme === 'dark'
                ? 'bg-green-900/30 border-green-800 text-green-300'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {success}
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            {/* Tên bệnh nhân (tùy chọn) */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('doctorRecords.modal.patientName')}
              </label>
              <input
                type="text"
                value={formPatientName}
                onChange={(e) => setFormPatientName(e.target.value)}
                placeholder={t('doctorRecords.modal.patientName') + " (tùy chọn)"}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
              />
            </div>

            {/* Chẩn đoán */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('doctorRecords.modal.diagnosis')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formDiagnosis}
                onChange={(e) => setFormDiagnosis(e.target.value)}
                required
                placeholder={t('doctorRecords.modal.diagnosisPlaceholder')}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                  isDiagnosisValid
                    ? theme === 'dark'
                      ? 'border-green-800 focus:ring-green-500 bg-gray-700 text-white'
                      : 'border-green-300 focus:ring-green-500'
                    : theme === 'dark'
                      ? 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {!isDiagnosisValid && (
                <p className="text-xs text-red-500 mt-1">
                  {t('doctorRecords.create.diagnosisRequired')}
                </p>
              )}
            </div>

            {/* Ghi chú điều trị */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('doctorRecords.modal.treatmentNotes')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formTreatmentNotes}
                onChange={(e) => setFormTreatmentNotes(e.target.value)}
                rows={4}
                placeholder={t('doctorRecords.modal.treatmentNotesPlaceholder')}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${
                  isTreatmentValid
                    ? theme === 'dark'
                      ? 'border-green-800 focus:ring-green-500 bg-gray-700 text-white'
                      : 'border-green-300 focus:ring-green-500'
                    : theme === 'dark'
                      ? 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {!isTreatmentValid && (
                <p className="text-xs text-red-500 mt-1">
                  {t('doctorRecords.create.treatmentNotesRequired')}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('doctorRecords.common.cancel')}
            </button>

            <button
              type="submit"
              disabled={submitting || !isDiagnosisValid || !isTreatmentValid}
              title={
                !isDiagnosisValid || !isTreatmentValid
                  ? t('doctorRecords.create.diagnosisRequired') + ' & ' + t('doctorRecords.create.treatmentNotesRequired')
                  : ''
              }
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? t('doctorExamination.processing') : t('doctorRecords.create.newRecord')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecordForm;