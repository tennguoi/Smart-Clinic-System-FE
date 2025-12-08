import { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { downloadPdf, getMedicalRecordFilename } from '../../utils/pdfDownload';
import toast from 'react-hot-toast';

const PatientHistoryModal = ({ patientId, patientName, onClose }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await medicalRecordApi.listByPatient(patientId);
      setHistoryRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      toast.error(t('doctorRecords.errors.historyLoadFailed') || 'Không thể tải lịch sử khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async (recordId) => {
    setExportingId(recordId);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(recordId);
      await downloadPdf(pdfBlob, getMedicalRecordFilename(recordId));
      toast.success(t('doctorRecords.modal.pdfSuccess'));
    } catch (e) {
      console.error(e);
      toast.error(t('doctorRecords.modal.pdfFailed') || 'Xuất PDF thất bại');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors duration-300`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('medicalRecords.historyTitle') || 'Lịch sử khám bệnh'}
            </h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('medicalRecords.patient') || 'Bệnh nhân'}: <span className="font-semibold text-blue-600">{patientName}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{t('common.loading')}</p>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {t('medicalRecords.noHistory') || 'Chưa có lịch sử khám bệnh nào'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyRecords.map((record) => (
                <div 
                  key={record.recordId} 
                  className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(record.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <User className="w-4 h-4" />
                          <span>{t('medicalRecords.doctor') || 'Bác sĩ'}: <span className="font-medium">{record.doctorName || 'N/A'}</span></span>
                        </div>
                      </div>

                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {t('medicalRecords.diagnosis') || 'Chẩn đoán'}
                        </span>
                        <p className={`mt-1 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{record.diagnosis}</p>
                      </div>

                      {record.treatmentNotes && (
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {t('medicalRecords.treatmentNotes') || 'Ghi chú điều trị'}
                          </span>
                          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{record.treatmentNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start">
                      <button
                        onClick={() => handleExportPdf(record.recordId)}
                        disabled={exportingId === record.recordId}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {exportingId === record.recordId ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>{t('common.exportPdf') || 'Xuất PDF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('common.close') || 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
