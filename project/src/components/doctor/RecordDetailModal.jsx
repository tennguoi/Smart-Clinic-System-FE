// src/components/doctor/RecordDetailModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, Download, Eye } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import toast from 'react-hot-toast';
import { downloadPdf, getMedicalRecordFilename } from '../../utils/pdfDownload';
import { useTheme } from '../../contexts/ThemeContext';

const RecordDetailModal = ({
  record,
  prescriptions = [],
  loading,
  localDiagnosis = '',
  localNotes = '',
  setLocalDiagnosis,
  setLocalNotes,
  localPrescriptionDrugs = '',
  localPrescriptionInstructions = '',
  setLocalPrescriptionDrugs,
  setLocalPrescriptionInstructions,
  onSave,
  saving,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  if (!record) return null;

  const isDark = theme === 'dark';

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(record.recordId);
      downloadPdf(pdfBlob, getMedicalRecordFilename(record.recordId));
      toast.success(t('doctorRecords.modal.pdfSuccess'));
    } catch {
      toast.error(t('doctorRecords.modal.pdfFailed'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Main modal */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl flex flex-col ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('doctorRecords.modal.title', 'Chỉnh sửa hồ sơ bệnh án')}
          </h3>

          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition shadow-sm ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Pencil className="w-4 h-4" />
                {t('doctorRecords.common.edit', 'Chỉnh sửa')}
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              <p className={`mt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('common.loading', 'Đang tải...')}
              </p>
            </div>
          ) : (
            <>
              {/* Patient & Diagnosis */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {t('doctorRecords.modal.patientName', 'Tên bệnh nhân')}
                  </label>
                  <div
                    className={`w-full px-3 py-2 rounded-lg border break-words ${
                      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {record.patientName || record.patientId || '—'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {t('doctorRecords.modal.diagnosis', 'Chẩn đoán')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={localDiagnosis}
                    onChange={(e) => setLocalDiagnosis(e.target.value)}
                    disabled={!isEditMode}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 break-words ${
                      isDark
                        ? `bg-gray-800 border-gray-700 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                        : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                    }`}
                    placeholder={t('doctorRecords.modal.diagnosisPlaceholder')}
                  />
                </div>
              </div>

              {/* Treatment notes */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('doctorRecords.modal.treatmentNotes', 'Ghi chú điều trị')}
                </label>
                <textarea
                  rows={3}
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y break-words whitespace-pre-wrap ${
                    isDark
                      ? `bg-gray-800 border-gray-700 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                      : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                  }`}
                  placeholder={t('doctorRecords.modal.treatmentNotesPlaceholder')}
                />
              </div>

              {/* Prescription */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {t('doctorRecords.modal.prescriptionTitle', 'Đơn thuốc')}
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('doctorRecords.modal.prescriptionDrugs', 'Toa thuốc')}
                    </label>
                    <textarea
                      rows={3}
                      value={localPrescriptionDrugs}
                      onChange={(e) => setLocalPrescriptionDrugs(e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y break-words whitespace-pre-wrap ${
                        isDark
                          ? `bg-gray-800 border-gray-700 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                          : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                      }`}
                      placeholder={t('doctorRecords.modal.prescriptionDrugsPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('doctorRecords.modal.prescriptionInstructions', 'Hướng dẫn sử dụng')}
                    </label>
                    <textarea
                      rows={3}
                      value={localPrescriptionInstructions}
                      onChange={(e) => setLocalPrescriptionInstructions(e.target.value)}
                      disabled={!isEditMode}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y break-words whitespace-pre-wrap ${
                        isDark
                          ? `bg-gray-800 border-gray-700 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                          : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                      }`}
                      placeholder={t('doctorRecords.modal.prescriptionInstructionsPlaceholder')}
                    />
                  </div>
                </div>
                {prescriptions[0]?.issuedAt && (
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('doctorRecords.modal.prescriptionIssuedAt', 'Ngày kê đơn: {{date}}', {
                      date: new Date(prescriptions[0].issuedAt).toLocaleString('vi-VN'),
                    })}
                  </p>
                )}
              </div>

              {record.createdAt && (
                <div className={`text-center text-xs pt-4 border-t ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>
                  {t('doctorRecords.modal.createdAt', 'Ngày tạo: {{date}}', {
                    date: new Date(record.createdAt).toLocaleString('vi-VN'),
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {isEditMode && (
          <div
            className={`flex justify-end gap-4 p-6 border-t ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <button
              onClick={() => setIsEditMode(false)}
              disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {t('doctorRecords.common.cancel', 'Hủy')}
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition ${
                saving ? 'bg-blue-400 text-white cursor-not-allowed opacity-70' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('doctorRecords.common.saving', 'Đang lưu...')}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  {t('doctorRecords.modal.saveButton', 'Lưu thay đổi')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordDetailModal;