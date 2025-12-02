// src/components/doctor/RecordRow.jsx
import { useState } from 'react';
import { Pencil, Trash2, Pill, Download, FileText } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import toast from 'react-hot-toast';
import RecordDetailModal from './RecordDetailModal';
import PrescriptionFormModal from './PrescriptionFormModal';
import { downloadPdf, getMedicalRecordFilename } from '../../utils/pdfDownload';
import { useTheme } from '../../contexts/ThemeContext';

const RecordRow = ({ index, record, onUpdated, onError, onDelete }) => {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
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
    if (!localDiagnosis || !localDiagnosis.trim()) {
      onError && onError('Chẩn đoán là bắt buộc');
      return;
    }
    setSaving(true);
    try {
      await medicalRecordApi.update(record.recordId, {
        diagnosis: localDiagnosis.trim(),
        treatmentNotes: localNotes?.trim() || '',
      });
      setEditing(false);
      onUpdated && onUpdated();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Cập nhật hồ sơ thất bại';
      onError && onError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này? Hành động này không thể hoàn tác.')) return;
    setDeleting(true);
    try {
      await medicalRecordApi.remove(record.recordId);
      
      toast.success('Xóa hồ sơ bệnh án thành công!', {
        duration: 3000,
        position: 'top-right',
      });
      
      onDelete && onDelete(record.recordId);
      onUpdated && onUpdated();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Xóa hồ sơ thất bại';
      toast.error(msg, {
        duration: 4000,
        position: 'top-right',
      });
      onError && onError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const pdfBlob = await medicalRecordApi.exportAsPdf(record.recordId);
      await downloadPdf(pdfBlob, getMedicalRecordFilename(record.recordId));
      
      toast.success('Xuất PDF hồ sơ thành công!', {
        duration: 3000,
        position: 'top-right',
      });
    } catch (e) {
      const msg = e.message || 'Xuất PDF thất bại';
      toast.error(msg, {
        duration: 4000,
        position: 'top-right',
      });
      onError && onError(msg);
    } finally {
      setExporting(false);
    }
  };


  return (
    <>
      <tr className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{index}</td>
        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{record.patientName || record.patientId || '—'}</td>
        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
          {editing ? (
            <input
              type="text"
              value={localDiagnosis}
              onChange={(e) => setLocalDiagnosis(e.target.value)}
              className={`w-full border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          ) : (
            record.diagnosis
          )}
        </td>
        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {editing ? (
            <input
              type="text"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              className={`w-full border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
            />
          ) : (
            record.treatmentNotes || '—'
          )}
        </td>
        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {editing ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocalDiagnosis(record.diagnosis || '');
                  setLocalNotes(record.treatmentNotes || '');
                }}
                className={`px-3 py-1 rounded hover:bg-opacity-80 ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Hủy
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onError(null);
                  setShowPrescriptionModal(true);
                }}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                aria-label="Tạo đơn thuốc"
                title="Tạo đơn thuốc"
              >
                <Pill className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-60 transition-colors"
                aria-label="Xuất PDF hồ sơ"
                title={exporting ? 'Đang xuất...' : 'Xuất PDF hồ sơ bệnh án'}
              >
                <FileText className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
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
                    if (prescList.length > 0 && prescList[0]) {
                      setLocalPrescriptionDrugs(prescList[0].drugs || '');
                      setLocalPrescriptionInstructions(prescList[0].instructions || '');
                    } else {
                      setLocalPrescriptionDrugs('');
                      setLocalPrescriptionInstructions('');
                    }
                  } catch (err) {
                    console.error('Error loading detail:', err);
                    setRecordDetail(record);
                    setPrescriptions([]);
                    setLocalDiagnosis(record.diagnosis || '');
                    setLocalNotes(record.treatmentNotes || '');
                    setLocalPrescriptionDrugs('');
                    setLocalPrescriptionInstructions('');
                  } finally {
                    setLoadingDetail(false);
                  }
                }}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                aria-label="Chỉnh sửa"
                title="Chỉnh sửa"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </td>
      </tr>

      {showDetailModal && (
        <RecordDetailModal
          record={recordDetail || record}
          prescriptions={prescriptions}
          loading={loadingDetail}
          localDiagnosis={localDiagnosis}
          localNotes={localNotes}
          setLocalDiagnosis={setLocalDiagnosis}
          setLocalNotes={setLocalNotes}
          onSave={async () => {
            if (!localDiagnosis || !localDiagnosis.trim()) {
              onError && onError('Chẩn đoán là bắt buộc');
              return;
            }
            setSaving(true);
            try {
              const updatePayload = {
                diagnosis: localDiagnosis.trim(),
                treatmentNotes: localNotes?.trim() || '',
                prescription: (localPrescriptionDrugs?.trim() || localPrescriptionInstructions?.trim()) ? {
                  drugs: localPrescriptionDrugs?.trim() || '',
                  instructions: localPrescriptionInstructions?.trim() || ''
                } : null
              };
              
              await medicalRecordApi.update(record.recordId, updatePayload);
              
              toast.success('Cập nhật hồ sơ bệnh án thành công!', {
                duration: 3000,
                position: 'top-right',
              });
              
              setShowDetailModal(false);
              setRecordDetail(null);
              setPrescriptions([]);
              onUpdated && onUpdated();
            } catch (e) {
              const msg = e.response?.data?.message || e.message || 'Cập nhật hồ sơ thất bại';
              toast.error(msg, {
                duration: 4000,
                position: 'top-right',
              });
              onError && onError(msg);
            } finally {
              setSaving(false);
            }
          }}
          localPrescriptionDrugs={localPrescriptionDrugs}
          localPrescriptionInstructions={localPrescriptionInstructions}
          setLocalPrescriptionDrugs={setLocalPrescriptionDrugs}
          setLocalPrescriptionInstructions={setLocalPrescriptionInstructions}
          saving={saving}
          onClose={() => {
            setShowDetailModal(false);
            setRecordDetail(null);
            setPrescriptions([]);
            setLocalDiagnosis(record.diagnosis || '');
            setLocalNotes(record.treatmentNotes || '');
            setLocalPrescriptionDrugs('');
            setLocalPrescriptionInstructions('');
          }}
        />
      )}

      {showPrescriptionModal && (
        <PrescriptionFormModal
          record={record}
          onError={onError}
          onClose={() => setShowPrescriptionModal(false)}
          onSuccess={() => {
            onUpdated();
            setShowPrescriptionModal(false);
          }}
        />
      )}
    </>
  );
};

export default RecordRow;
