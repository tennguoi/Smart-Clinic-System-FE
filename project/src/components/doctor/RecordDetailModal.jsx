// src/components/doctor/RecordDetailModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, FileText } from 'lucide-react';
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
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-60 ${
                isDark
                  ? 'bg-purple-700 hover:bg-purple-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              {exporting ? 'Đang xuất...' : t('doctorRecords.modal.pdfButton', 'Xuất PDF')}
            </button>

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
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {t('doctorRecords.modal.patientName', 'Tên bệnh nhân')}
                  </label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                    {record.patientName || record.patientId || '—'}
                  </p>
                </div>

                <div className={`p-5 rounded-lg border ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
                  <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                    {t('doctorRecords.modal.diagnosis', 'Chẩn đoán')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={localDiagnosis}
                    onChange={(e) => setLocalDiagnosis(e.target.value)}
                    className={`mt-2 w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder={t('doctorRecords.modal.diagnosisPlaceholder')}
                  />
                </div>
              </div>

              {/* Treatment notes */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('doctorRecords.modal.treatmentNotes', 'Ghi chú điều trị')}
                </label>
                <textarea
                  rows={5}
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  className={`mt-2 w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-gray-500 resize-y ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder={t('doctorRecords.modal.treatmentNotesPlaceholder')}
                />
              </div>

              {/* Prescription */}
              <div className={`p-5 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`}>
                <label className={`block text-xs font-bold uppercase mb-4 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  {t('doctorRecords.modal.prescriptionTitle', 'Đơn thuốc')}
                </label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('doctorRecords.modal.prescriptionDrugs', 'Toa thuốc')}
                    </label>
                    <textarea
                      rows={6}
                      value={localPrescriptionDrugs}
                      onChange={(e) => setLocalPrescriptionDrugs(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 resize-y ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder={t('doctorRecords.modal.prescriptionDrugsPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('doctorRecords.modal.prescriptionInstructions', 'Hướng dẫn sử dụng')}
                    </label>
                    <textarea
                      rows={6}
                      value={localPrescriptionInstructions}
                      onChange={(e) => setLocalPrescriptionInstructions(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 resize-y ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder={t('doctorRecords.modal.prescriptionInstructionsPlaceholder')}
                    />
                  </div>
                </div>
                {prescriptions[0]?.issuedAt && (
                  <p className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
        <div
          className={`flex justify-end gap-4 p-6 border-t ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className={`px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {t('common.cancel', 'Hủy')}
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-60 transition"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('common.saving', 'Đang lưu...')}
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                {t('doctorRecords.modal.saveButton', 'Lưu thay đổi')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;