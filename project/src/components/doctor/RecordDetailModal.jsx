// src/components/doctor/RecordDetailModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, FileText } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import toast from 'react-hot-toast';
import { downloadPdf, getMedicalRecordFilename } from '../../utils/pdfDownload';

const RecordDetailModal = ({
  record,
  prescriptions,
  loading,
  localDiagnosis,
  localNotes,
  setLocalDiagnosis,
  setLocalNotes,
  localPrescriptionDrugs,
  localPrescriptionInstructions,
  setLocalPrescriptionDrugs,
  setLocalPrescriptionInstructions,
  onSave,
  saving,
  onClose
}) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  if (!record) return null;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(record.recordId);
      await downloadPdf(pdfBlob, getMedicalRecordFilename(record.recordId));
      toast.success(t('doctorRecords.modal.pdfSuccess'));
    } catch (e) {
      toast.error(t('doctorRecords.modal.pdfFailed') + (e.message || ''));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-xl font-semibold text-gray-800">
              {t('doctorRecords.modal.title')}
            </h3>
            <div className="flex items-center gap-3">
              {/* Nút Xuất PDF */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors font-medium"
                title={t('doctorRecords.modal.pdfTitle')}
              >
                <FileText className="w-4 h-4" />
                {exporting ? t('doctorRecords.modal.pdfExporting') : t('doctorRecords.modal.pdfButton')}
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="mt-3 text-gray-600">{t('common.loading')}</p>
              </div>
            ) : (
              <>
                {/* Thông tin bệnh nhân + Chẩn đoán */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <label className="block text-xs font-semibold text-blue-700 uppercase mb-2">
                      {t('doctorRecords.modal.patientName')}
                    </label>
                    <p className="text-base font-medium text-gray-900">
                      {record.patientName || record.patientId || t('common.na')}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                    <label className="block text-xs font-semibold text-purple-700 uppercase mb-2">
                      {t('doctorRecords.modal.diagnosis')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={localDiagnosis}
                      onChange={(e) => setLocalDiagnosis(e.target.value)}
                      className="w-full mt-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={t('doctorRecords.modal.diagnosisPlaceholder')}
                    />
                  </div>
                </div>

                {/* Ghi chú điều trị */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                    {t('doctorRecords.modal.treatmentNotes')}
                  </label>
                  <textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    rows={5}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm resize-y"
                    placeholder={t('doctorRecords.modal.treatmentNotesPlaceholder')}
                  />
                </div>

                {/* Đơn thuốc */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <label className="block text-xs font-semibold text-green-700 uppercase mb-4">
                    {t('doctorRecords.modal.prescriptionTitle')}
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        {t('doctorRecords.modal.prescriptionDrugs')}
                      </label>
                      <textarea
                        value={localPrescriptionDrugs}
                        onChange={(e) => setLocalPrescriptionDrugs(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-y bg-white"
                        placeholder={t('doctorRecords.modal.prescriptionDrugsPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        {t('doctorRecords.modal.prescriptionInstructions')}
                      </label>
                      <textarea
                        value={localPrescriptionInstructions}
                        onChange={(e) => setLocalPrescriptionInstructions(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-y bg-white"
                        placeholder={t('doctorRecords.modal.prescriptionInstructionsPlaceholder')}
                      />
                    </div>
                  </div>
                  {prescriptions.length > 0 && prescriptions[0]?.issuedAt && (
                    <p className="mt-3 text-xs text-gray-500">
                      {t('doctorRecords.modal.prescriptionIssuedAt', {
                        date: new Date(prescriptions[0].issuedAt).toLocaleString('vi-VN')
                      })}
                    </p>
                  )}
                </div>

                {/* Ngày tạo hồ sơ */}
                {record.createdAt && (
                  <div className="text-center text-xs text-gray-500 pt-3 border-t border-gray-200">
                    {t('doctorRecords.modal.createdAt', {
                      date: new Date(record.createdAt).toLocaleString('vi-VN')
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Nút Hủy & Lưu */}
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-60"
            >
              {t('doctorRecords.common.cancel')}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  {t('doctorRecords.modal.saveButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;