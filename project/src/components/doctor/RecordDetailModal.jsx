import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, Plus, Trash2 } from 'lucide-react';
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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
 
  // Auto-resize textarea function
  const autoResizeTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };
 
  // Parse prescription data into paired format
  const parsePrescriptions = () => {
    const drugs = localPrescriptionDrugs.split('\n').filter(d => d.trim());
    const instructions = localPrescriptionInstructions.split('\n').filter(i => i.trim());
    const maxLength = Math.max(drugs.length, instructions.length);
   
    const paired = [];
    for (let i = 0; i < maxLength; i++) {
      paired.push({
        drug: drugs[i] || '',
        instruction: instructions[i] || ''
      });
    }
    return paired;
  };


  const [prescriptionItems, setPrescriptionItems] = useState(parsePrescriptions());


  // Re-parse when props change (fix for first load issue)
  useEffect(() => {
    setPrescriptionItems(parsePrescriptions());
  }, [localPrescriptionDrugs, localPrescriptionInstructions]);


  // Update parent state when items change
  const updateParentState = (items) => {
    const drugs = items.map(item => item.drug).join('\n');
    const instructions = items.map(item => item.instruction).join('\n');
    setLocalPrescriptionDrugs(drugs);
    setLocalPrescriptionInstructions(instructions);
  };


  const handleItemChange = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
    updateParentState(newItems);
  };


  const addPrescriptionItem = () => {
    const newItems = [...prescriptionItems, { drug: '', instruction: '' }];
    setPrescriptionItems(newItems);
  };


  const removePrescriptionItem = (index) => {
    const newItems = prescriptionItems.filter((_, i) => i !== index);
    setPrescriptionItems(newItems);
    updateParentState(newItems);
  };


  // Auto-resize all textareas when items change
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea[data-auto-resize]');
    textareas.forEach(autoResizeTextarea);
  }, [prescriptionItems, isEditMode]);


  if (!record) return null;


  const isDark = theme === 'dark';


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />


      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border shadow-2xl flex flex-col ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
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
                />
              </div>


              {/* ✨ Selected Services */}
              {record.services && record.services.length > 0 && (
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {t('medicalRecords.table.servicesTitle') || 'Dịch vụ đã chọn'}
                  </label>
                  <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full text-sm">
                      <thead className={`text-xs uppercase ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
                        <tr>
                          <th className="px-3 py-2 text-left">{t('medicalRecords.table.serviceName', 'Tên dịch vụ')}</th>
                          <th className="px-3 py-2 text-center w-16">{t('medicalRecords.table.quantity', 'SL')}</th>
                          <th className="px-3 py-2 text-right">{t('medicalRecords.table.unitPrice', 'Đơn giá')}</th>
                          <th className="px-3 py-2 text-right">{t('medicalRecords.table.totalPrice', 'Thành tiền')}</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {record.services.map((s, idx) => (
                          <tr key={idx} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            <td className="px-3 py-2">
                              <div className="font-medium">{s.serviceName}</div>
                              {s.note && <div className="text-xs italic text-gray-500">{s.note}</div>}
                            </td>
                            <td className="px-3 py-2 text-center">{s.quantity}</td>
                            <td className="px-3 py-2 text-right">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.totalPrice || (s.unitPrice * s.quantity))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className={`text-xs font-semibold ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
                        <tr>
                          <td colSpan="3" className="px-3 py-2 text-right uppercase">
                            {t('medicalRecords.table.total', 'Tổng cộng')}:
                          </td>
                          <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              record.services.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice * item.quantity)), 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}


             {/* Prescription - Vertical Layout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {t('doctorRecords.modal.prescriptionTitle', 'Đơn thuốc')}
                  </label>
                  {isEditMode && (
                    <button
                      onClick={addPrescriptionItem}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                    >
                      <Plus className="w-4 h-4" />
                      {t('doctorRecords.modal.addDrug', 'Thêm thuốc')}
                    </button>
                  )}
                </div>


                <div className="space-y-3">
                  {prescriptionItems.length === 0 ? (
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                      isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
                    }`}>
                      {t('doctorRecords.modal.noPrescription', 'Chưa có đơn thuốc')}
                    </div>
                  ) : (
                    prescriptionItems.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isDark ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {index + 1}
                          </div>


                          {/* Changed from grid to flex-col for vertical layout */}
                          <div className="flex-1 space-y-3">
                            {/* Drug name - Full width on top */}
                            <div className="space-y-1">
                              <label className={`block text-sm font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {t('doctorRecords.modal.prescriptionDrugs', 'Tên thuốc')}
                              </label>
                              <textarea
                                data-auto-resize
                                value={item.drug}
                                onChange={(e) => {
                                  handleItemChange(index, 'drug', e.target.value);
                                  autoResizeTextarea(e.target);
                                }}
                                disabled={!isEditMode}
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none break-words whitespace-pre-wrap overflow-hidden min-h-[80px] ${
                                  isDark
                                    ? `bg-gray-800 border-gray-600 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                    : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                                }`}
                                placeholder={t('doctorRecords.modal.prescriptionDrugsPlaceholder')}
                              />
                            </div>


                            {/* Instructions - Full width on bottom */}
                            <div className="space-y-1">
                              <label className={`block text-sm font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {t('doctorRecords.modal.prescriptionInstructions', 'Hướng dẫn sử dụng')}
                              </label>
                              <textarea
                                data-auto-resize
                                value={item.instruction}
                                onChange={(e) => {
                                  handleItemChange(index, 'instruction', e.target.value);
                                  autoResizeTextarea(e.target);
                                }}
                                disabled={!isEditMode}
                                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none break-words whitespace-pre-wrap overflow-hidden min-h-[80px] ${
                                  isDark
                                    ? `bg-gray-800 border-gray-600 text-white ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                    : `bg-white border-gray-300 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                                }`}
                                placeholder={t('doctorRecords.modal.prescriptionInstructionsPlaceholder')}
                              />
                            </div>
                          </div>


                          {isEditMode && (
                            <button
                              onClick={() => removePrescriptionItem(index)}
                              className="flex-shrink-0 p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                              title={t('doctorRecords.modal.deleteDrug', 'Xóa')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
                <div className={`text-center text-xs pt-4 border-t ${
                  isDark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'
                }`}>
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


