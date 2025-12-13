import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, Plus } from 'lucide-react';
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
  
  // Track when modal opens with new data
  const lastLoadedRecordId = useRef(null);
  const lastLoadedDrugs = useRef('');
  const lastLoadedInstructions = useRef('');
  
  // Parse prescription data into paired format
  const parsePrescriptions = (drugs = '', instructions = '') => {
    const drugList = drugs.split('\n').filter(d => d.trim());
    const instructionList = instructions.split('\n').filter(i => i.trim());
    const maxLength = Math.max(drugList.length, instructionList.length);
   
    const paired = [];
    for (let i = 0; i < maxLength; i++) {
      paired.push({
        drug: drugList[i] || '',
        instruction: instructionList[i] || ''
      });
    }
    return paired.length > 0 ? paired : [];
  };

  // Initialize with current props
  const [prescriptionItems, setPrescriptionItems] = useState(() => 
    parsePrescriptions(localPrescriptionDrugs, localPrescriptionInstructions)
  );

  // Only reload data when record changes OR when props change from external source (not from our updates)
  useEffect(() => {
    const recordChanged = record?.id !== lastLoadedRecordId.current;
    const propsChanged = 
      localPrescriptionDrugs !== lastLoadedDrugs.current || 
      localPrescriptionInstructions !== lastLoadedInstructions.current;
    
    // Only parse if it's a different record OR props changed from external source
    if (recordChanged || (propsChanged && !isEditMode)) {
      const parsed = parsePrescriptions(localPrescriptionDrugs, localPrescriptionInstructions);
      setPrescriptionItems(parsed);
      
      // Update refs to track current loaded state
      lastLoadedRecordId.current = record?.id;
      lastLoadedDrugs.current = localPrescriptionDrugs;
      lastLoadedInstructions.current = localPrescriptionInstructions;
    }
  }, [record?.id, localPrescriptionDrugs, localPrescriptionInstructions, isEditMode]);

  // Auto-resize textarea function
  const autoResizeTextarea = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Update parent state
  const updateParentState = (items) => {
    const drugs = items.map(item => item.drug).join('\n');
    const instructions = items.map(item => item.instruction).join('\n');
    
    // Update refs to prevent re-parsing our own changes
    lastLoadedDrugs.current = drugs;
    lastLoadedInstructions.current = instructions;
    
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
    updateParentState(newItems);
  };

  const removePrescriptionItem = (indexToRemove) => {
    const newItems = prescriptionItems.filter((_, i) => i !== indexToRemove);
    setPrescriptionItems(newItems);
    updateParentState(newItems);
  };

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

              {/* Selected Services */}
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

              {/* Prescription Form */}
              <div className={`rounded-xl border p-6 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
              }`}>
                <div className="space-y-4">
                  {/* Tiêu đề */}
                  <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('doctorRecords.modal.prescriptionTitle', 'Đơn thuốc')}
                  </h4>

                  {/* Header bảng (ẩn trên mobile) */}
                  <div className={`hidden md:grid grid-cols-12 gap-4 font-semibold text-sm rounded-xl px-4 py-3 ${
                    isDark ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-slate-600'
                  }`}>
                    <div className="col-span-1 text-center">{t('prescriptionForm.table.stt', 'STT')}</div>
                    <div className="col-span-5">{t('prescriptionForm.table.drugName', 'Tên thuốc')}</div>
                    <div className="col-span-5">{t('prescriptionForm.table.instructions', 'Hướng dẫn sử dụng')}</div>
                    <div className="col-span-1 text-center">{t('prescriptionForm.table.delete', 'Xóa')}</div>
                  </div>

                  {/* Danh sách dòng */}
                  {prescriptionItems.length === 0 ? (
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                      isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
                    }`}>
                      {t('doctorRecords.modal.noPrescription', 'Chưa có đơn thuốc')}
                    </div>
                  ) : (
                    prescriptionItems.map((item, index) => (
                      <div key={`prescription-${index}`} className="space-y-3">
                        {/* Mobile layout */}
                        <div className={`md:hidden rounded-xl border p-3 ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                              #{index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePrescriptionItem(index)}
                              disabled={!isEditMode}
                              className={`p-2 rounded-lg transition-all ${
                                !isEditMode 
                                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                                  : isDark
                                    ? 'text-red-400 hover:bg-red-900/30'
                                    : 'text-red-500 hover:bg-red-50'
                              }`}
                              title={t('doctorRecords.modal.deleteDrug', 'Xóa')}
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <label className={`block text-xs font-semibold mb-1 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('prescriptionForm.drugNameLabel', 'Tên thuốc')}
                          </label>
                          <textarea
                            value={item.drug}
                            onChange={(e) => {
                              handleItemChange(index, 'drug', e.target.value);
                              autoResizeTextarea(e.target);
                            }}
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 text-sm transition-all resize-none overflow-hidden ${
                              isDark
                                ? `bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700 ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                : `bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                            }`}
                            placeholder={t('prescriptionForm.drugNamePlaceholder', 'Nhập tên thuốc')}
                            rows={1}
                          />

                          <label className={`block text-xs font-semibold mb-1 mt-3 ${
                            isDark ? 'text-gray-300' : 'text-slate-600'
                          }`}>
                            {t('prescriptionForm.instructionsLabel', 'Hướng dẫn sử dụng')}
                          </label>
                          <textarea
                            value={item.instruction}
                            onChange={(e) => {
                              handleItemChange(index, 'instruction', e.target.value);
                              autoResizeTextarea(e.target);
                            }}
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 text-sm transition-all resize-none overflow-hidden ${
                              isDark
                                ? `bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700 ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                : `bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                            }`}
                            placeholder={t('prescriptionForm.instructionsPlaceholder', 'Nhập hướng dẫn sử dụng')}
                            rows={1}
                          />
                        </div>

                        {/* Desktop layout */}
                        <div className={`hidden md:grid grid-cols-12 gap-4 items-start rounded-xl border px-4 py-3 ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
                        }`}>
                          <div className={`col-span-1 flex items-center justify-center pt-3 font-semibold ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="col-span-5">
                            <textarea
                              value={item.drug}
                              onChange={(e) => {
                                handleItemChange(index, 'drug', e.target.value);
                                autoResizeTextarea(e.target);
                              }}
                              disabled={!isEditMode}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-4 transition-all resize-none overflow-hidden ${
                                isDark
                                  ? `bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700 ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                  : `bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                              }`}
                              placeholder={t('prescriptionForm.drugNamePlaceholder', 'Nhập tên thuốc')}
                              rows={1}
                            />
                          </div>
                          <div className="col-span-5">
                            <textarea
                              value={item.instruction}
                              onChange={(e) => {
                                handleItemChange(index, 'instruction', e.target.value);
                                autoResizeTextarea(e.target);
                              }}
                              disabled={!isEditMode}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-4 transition-all resize-none overflow-hidden ${
                                isDark
                                  ? `bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700 ${!isEditMode ? 'opacity-70 cursor-not-allowed' : ''}`
                                  : `bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500 ${!isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`
                              }`}
                              placeholder={t('prescriptionForm.instructionsPlaceholder', 'Nhập hướng dẫn sử dụng')}
                              rows={1}
                            />
                          </div>
                          <div className="col-span-1 flex items-center justify-center pt-2">
                            <button
                              type="button"
                              onClick={() => removePrescriptionItem(index)}
                              disabled={!isEditMode}
                              className={`p-2 rounded-lg transition-all ${
                                !isEditMode 
                                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                                  : isDark
                                    ? 'text-red-400 hover:bg-red-900/30'
                                    : 'text-red-500 hover:bg-red-50'
                              }`}
                              title={t('doctorRecords.modal.deleteDrug', 'Xóa')}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Nút thêm dòng */}
                  <button
                    type="button"
                    onClick={addPrescriptionItem}
                    disabled={!isEditMode}
                    className={`w-full py-3 border-2 border-dashed rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      !isEditMode
                        ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-400'
                        : isDark
                          ? 'border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:border-blue-600'
                          : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-500'
                    }`}
                    title={t('prescriptionForm.addButton', 'Thêm dòng')}
                  >
                    <Plus size={18} />
                    {t('doctorRecords.modal.addDrug', 'Thêm thuốc')}
                  </button>

                  {prescriptions[0]?.issuedAt && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('doctorRecords.modal.prescriptionIssuedAt', 'Ngày kê đơn: {{date}}', {
                        date: new Date(prescriptions[0].issuedAt).toLocaleString('vi-VN'),
                      })}
                    </p>
                  )}
                </div>
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
              type="button"
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
              type="button"
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