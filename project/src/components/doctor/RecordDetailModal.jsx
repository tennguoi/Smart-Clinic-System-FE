// src/components/doctor/RecordDetailModal.jsx
import { useState } from 'react';
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
  const [exporting, setExporting] = useState(false);

  if (!record) return null;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(record.recordId);
      await downloadPdf(pdfBlob, getMedicalRecordFilename(record.recordId));
      toast.success('Xuất PDF hồ sơ thành công!');
    } catch (e) {
      toast.error('Xuất PDF thất bại: ' + (e.message || 'Vui lòng thử lại'));
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
        <div 
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
            <h3 className="text-xl font-semibold text-gray-800">
              Chỉnh sửa hồ sơ bệnh án
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exporting}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                title="Xuất PDF hồ sơ bệnh án"
              >
                <FileText className="w-4 h-4" />
                {exporting ? 'Đang xuất...' : 'PDF Hồ sơ'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-500">Đang tải thông tin...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-blue-700 uppercase mb-1">
                      Tên bệnh nhân
                    </label>
                    <p className="text-sm text-gray-800 font-medium">
                      {record.patientName || record.patientId || '—'}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <label className="block text-xs font-semibold text-purple-700 uppercase mb-1">
                      Chẩn đoán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={localDiagnosis}
                      onChange={(e) => setLocalDiagnosis(e.target.value)}
                      className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Nhập chẩn đoán..."
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                    Ghi chú điều trị
                  </label>
                  <textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    rows={4}
                    className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm resize-y"
                    placeholder="Nhập ghi chú điều trị..."
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-green-700 uppercase mb-3">
                    Đơn thuốc
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Toa thuốc
                      </label>
                      <textarea
                        value={localPrescriptionDrugs}
                        onChange={(e) => setLocalPrescriptionDrugs(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-y bg-white"
                        placeholder="Nhập danh sách thuốc (mỗi thuốc một dòng)..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Hướng dẫn sử dụng
                      </label>
                      <textarea
                        value={localPrescriptionInstructions}
                        onChange={(e) => setLocalPrescriptionInstructions(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-y bg-white"
                        placeholder="Nhập hướng dẫn sử dụng thuốc..."
                      />
                    </div>
                    {prescriptions.length > 0 && prescriptions[0]?.issuedAt && (
                      <p className="text-xs text-gray-500">
                        Ngày tạo: {new Date(prescriptions[0].issuedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {record.createdAt && (
                  <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                    Ngày tạo: {new Date(record.createdAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  Lưu thay đổi
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

