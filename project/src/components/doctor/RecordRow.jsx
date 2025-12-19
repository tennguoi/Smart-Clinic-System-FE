// src/components/doctor/RecordRow.jsx
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Pill, Download, Eye } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import toast from 'react-hot-toast';
import RecordDetailModal from './RecordDetailModal';
import PrescriptionFormModal from './PrescriptionFormModal';
import { downloadPdf, getMedicalRecordFilename } from '../../utils/pdfDownload';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

// 🔥 Custom useMediaQuery hook (đồng bộ với MedicalRecordsSection)
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

const RecordRow = ({ index, record, onUpdated, onError, onDelete, onViewHistory, isMobile: isMobileProp }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // 🔥 Media queries đồng bộ
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  // Sử dụng prop isMobile nếu có, nếu không thì dùng hook
  const isCardView = isMobileProp !== undefined ? isMobileProp : (isMobile || isTablet);

  const [editing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localDiagnosis, setLocalDiagnosis] = useState(record.diagnosis || '');
  const [localNotes, setLocalNotes] = useState(record.treatmentNotes || '');
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [recordDetail, setRecordDetail] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [localPrescriptionDrugs, setLocalPrescriptionDrugs] = useState('');
  const [localPrescriptionInstructions, setLocalPrescriptionInstructions] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    if (!localDiagnosis?.trim()) {
      onError?.(t('doctorRecords.create.diagnosisRequired'));
      return;
    }
    setSaving(true);
    try {
      await medicalRecordApi.update(record.recordId, {
        diagnosis: localDiagnosis.trim(),
        treatmentNotes: localNotes?.trim() || '',
      });
      setEditing(false);
      toast.success(t('doctorRecords.modal.saveSuccess') || 'Cập nhật thành công!');
      onUpdated?.();
    } catch (e) {
      const msg = e.response?.data?.message || t('doctorRecords.modal.saveFailed') || 'Cập nhật thất bại';
      onError?.(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('doctorRecords.common.deleteConfirm') || 'Bạn có chắc muốn xóa hồ sơ này? Hành động này không thể hoàn tác.')) return;

    setDeleting(true);
    try {
      await medicalRecordApi.remove(record.recordId);
      toast.success(t('doctorRecords.modal.deleteSuccess') || 'Xóa hồ sơ thành công!');
      onDelete?.(record.recordId);
      onUpdated?.();
    } catch (e) {
      const msg = e.response?.data?.message || t('doctorRecords.modal.deleteFailed') || 'Xóa thất bại';
      toast.error(msg);
      onError?.(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(record.recordId);
      await downloadPdf(pdfBlob, getMedicalRecordFilename(record.recordId));
      toast.success(t('doctorRecords.modal.pdfSuccess'));
    } catch (e) {
      const msg = t('doctorRecords.modal.pdfFailed') + (e.message || '');
      toast.error(msg);
      onError?.(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetail = async (e) => {
    e.stopPropagation();
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const detail = await medicalRecordApi.getRecordDetail(record.recordId).catch(() => record);
      setRecordDetail(detail);
      const prescList = detail.prescription ? [detail.prescription] : [];
      setPrescriptions(prescList);
      setLocalDiagnosis(detail.diagnosis || '');
      setLocalNotes(detail.treatmentNotes || '');
      if (prescList[0]) {
        setLocalPrescriptionDrugs(prescList[0].drugs || '');
        setLocalPrescriptionInstructions(prescList[0].instructions || '');
      }
    } catch (err) {
      console.error(err);
      toast.error(t('common.errors.loadFailed') || 'Không thể tải chi tiết');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 🔥 Mobile/Tablet Card View
  if (isCardView) {
    return (
      <>
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {record.patientName || record.patientId || t('doctorRecords.unknownPatient')}
              </div>
              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('medicalRecords.table.diagnosis')}: {record.diagnosis?.slice(0, 50)}{record.diagnosis?.length > 50 ? '...' : ''}
              </div>
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              #{index}
            </div>
          </div>

          {/* Treatment Notes */}
          <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('medicalRecords.table.treatmentNotes')}: {record.treatmentNotes?.slice(0, 80)}{record.treatmentNotes?.length > 80 ? '...' : ''}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Xem chi tiết */}
            <button
              onClick={handleViewDetail}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Eye className="w-4 h-4" />
              {t('doctorRecords.common.view')}
            </button>

            {/* Tải PDF */}
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
            >
              <Download className="w-4 h-4" />
              {exporting ? t('doctorRecords.modal.pdfExporting') : t('doctorRecords.modal.pdfTitle')}
            </button>
          </div>
        </div>

        {/* Modals */}
        {showDetailModal && (
          <RecordDetailModal
            record={recordDetail || record}
            prescriptions={prescriptions}
            loading={loadingDetail}
            localDiagnosis={localDiagnosis}
            localNotes={localNotes}
            setLocalDiagnosis={setLocalDiagnosis}
            setLocalNotes={setLocalNotes}
            localPrescriptionDrugs={localPrescriptionDrugs}
            localPrescriptionInstructions={localPrescriptionInstructions}
            setLocalPrescriptionDrugs={setLocalPrescriptionDrugs}
            setLocalPrescriptionInstructions={setLocalPrescriptionInstructions}
            saving={saving}
            onSave={async () => {
              if (!localDiagnosis?.trim()) {
                toast.error(t('doctorRecords.create.diagnosisRequired'));
                return;
              }
              setSaving(true);
              try {
                const payload = {
                  diagnosis: localDiagnosis.trim(),
                  treatmentNotes: localNotes?.trim() || '',
                  prescription: localPrescriptionDrugs?.trim() || localPrescriptionInstructions?.trim()
                    ? { drugs: localPrescriptionDrugs.trim(), instructions: localPrescriptionInstructions.trim() }
                    : null,
                };
                await medicalRecordApi.update(record.recordId, payload);
                toast.success(t('doctorRecords.modal.saveSuccess') || 'Cập nhật thành công!');
                setShowDetailModal(false);
                onUpdated?.();
              } catch (e) {
                const msg = e.response?.data?.message || t('doctorRecords.modal.saveFailed');
                toast.error(msg);
              } finally {
                setSaving(false);
              }
            }}
            onClose={() => {
              setShowDetailModal(false);
              setRecordDetail(null);
              setPrescriptions([]);
            }}
          />
        )}

        {showPrescriptionModal && (
          <PrescriptionFormModal
            record={record}
            onClose={() => setShowPrescriptionModal(false)}
            onSuccess={() => {
              onUpdated?.();
              setShowPrescriptionModal(false);
            }}
          />
        )}
      </>
    );
  }

  // 🔥 Desktop Table Row View
  return (
    <>
      <tr className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        {/* STT */}
        <td className={`px-4 py-4 text-sm text-center align-middle ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {index}
        </td>

        {/* Tên bệnh nhân */}
        <td className={`px-6 py-4 text-sm align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
          {record.patientName || record.patientId || '—'}
        </td>

        {/* Chẩn đoán */}
        <td className={`px-6 py-4 text-sm align-middle ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
          {editing ? (
            <input
              type="text"
              value={localDiagnosis}
              onChange={(e) => setLocalDiagnosis(e.target.value)}
              className={`w-full border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              placeholder={t('modal.diagnosisPlaceholder')}
            />
          ) : (
            <div className="line-clamp-2">{record.diagnosis || '—'}</div>
          )}
        </td>

        {/* Ghi chú điều trị */}
        <td className={`px-6 py-4 text-sm align-middle ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {editing ? (
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              rows={2}
              className={`w-full border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              placeholder={t('modal.treatmentNotesPlaceholder')}
            />
          ) : (
            <div className="line-clamp-2">{record.treatmentNotes || '—'}</div>
          )}
        </td>

        {/* Thao tác */}
        <td className={`px-6 py-4 text-sm text-center align-middle ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {editing ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {saving ? t('doctorRecords.common.saving') || 'Đang lưu...' : t('doctorRecords.common.save') || 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocalDiagnosis(record.diagnosis || '');
                  setLocalNotes(record.treatmentNotes || '');
                }}
                className={`px-4 py-1.5 text-xs rounded transition ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {t('doctorRecords.common.cancel')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {/* Nút Xuất PDF */}
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="p-2.5 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded-full transition group relative disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={t('doctorRecords.modal.pdfTitle')}
              >
                <Download className="w-5 h-5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  {exporting ? t('doctorRecords.modal.pdfExporting') : t('doctorRecords.modal.pdfTitle')}
                </span>
              </button>

              {/* Nút Xem chi tiết */}
              <button
                type="button"
                onClick={handleViewDetail}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-95 transition group relative"
                aria-label={t('doctorRecords.common.view')}
              >
                <Eye className="w-4 h-4" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  {t('doctorRecords.common.view')}
                </span>
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Modal chi tiết & chỉnh sửa */}
      {showDetailModal && (
        <RecordDetailModal
          record={recordDetail || record}
          prescriptions={prescriptions}
          loading={loadingDetail}
          localDiagnosis={localDiagnosis}
          localNotes={localNotes}
          setLocalDiagnosis={setLocalDiagnosis}
          setLocalNotes={setLocalNotes}
          localPrescriptionDrugs={localPrescriptionDrugs}
          localPrescriptionInstructions={localPrescriptionInstructions}
          setLocalPrescriptionDrugs={setLocalPrescriptionDrugs}
          setLocalPrescriptionInstructions={setLocalPrescriptionInstructions}
          saving={saving}
          onSave={async () => {
            if (!localDiagnosis?.trim()) {
              toast.error(t('doctorRecords.create.diagnosisRequired'));
              return;
            }
            setSaving(true);
            try {
              const payload = {
                diagnosis: localDiagnosis.trim(),
                treatmentNotes: localNotes?.trim() || '',
                prescription: localPrescriptionDrugs?.trim() || localPrescriptionInstructions?.trim()
                  ? { drugs: localPrescriptionDrugs.trim(), instructions: localPrescriptionInstructions.trim() }
                  : null,
              };
              await medicalRecordApi.update(record.recordId, payload);
              toast.success(t('doctorRecords.modal.saveSuccess') || 'Cập nhật thành công!');
              setShowDetailModal(false);
              onUpdated?.();
            } catch (e) {
              const msg = e.response?.data?.message || t('doctorRecords.modal.saveFailed');
              toast.error(msg);
            } finally {
              setSaving(false);
            }
          }}
          onClose={() => {
            setShowDetailModal(false);
            setRecordDetail(null);
            setPrescriptions([]);
          }}
        />
      )}

      {/* Modal kê đơn */}
      {showPrescriptionModal && (
        <PrescriptionFormModal
          record={record}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            onUpdated?.();
            setShowPrescriptionModal(false);
          }}
        />
      )}
    </>
  );
};

export default RecordRow;