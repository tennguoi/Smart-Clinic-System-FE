// PrescriptionForm.jsx
import { Pill, Plus, X } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrescriptionForm({
  prescriptionItems,
  onAdd,
  onRemove,
  onUpdate,
  aiAssistantOpen, // để đồng bộ padding với trạng thái AI panel
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Media queries từ react-responsive
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const isTabletOrAbove = useMediaQuery({ query: '(min-width: 768px)' });

  return (
    <div className="space-y-4">
      {/* Tiêu đề */}
      <h4
        className={`flex items-center gap-2 font-bold text-lg ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        <Pill size={22} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
        {t('prescriptionForm.title')}
      </h4>

      {/* Header bảng - chỉ hiển thị trên tablet trở lên */}
      {isTabletOrAbove && (
        <div
          className={`grid grid-cols-12 gap-4 font-semibold text-sm rounded-xl px-4 py-3 ${
            theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-slate-600'
          }`}
        >
          <div className="col-span-1 text-center">{t('prescriptionForm.table.stt')}</div>
          <div className="col-span-5">{t('prescriptionForm.table.drugName')}</div>
          <div className="col-span-5">{t('prescriptionForm.table.instructions')}</div>
          <div className="col-span-1 text-center">{t('prescriptionForm.table.delete')}</div>
        </div>
      )}

      {/* Danh sách dòng */}
      {prescriptionItems.map((item, index) => (
        <div key={index} className="space-y-3">
          {/* Mobile layout - chỉ hiển thị khi isMobile */}
          {isMobile && (
            <div
              className={`rounded-xl border p-3 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  #{index + 1}
                </span>
                <button
                  onClick={() => onRemove(index)}
                  className={`p-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'text-red-400 hover:bg-red-900/30'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                  aria-label={t('prescriptionForm.deleteButton')}
                  title={t('prescriptionForm.deleteButton')}
                >
                  <X size={18} />
                </button>
              </div>

              <label
                className={`block text-xs font-semibold mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                }`}
              >
                {t('prescriptionForm.drugNameLabel')}
              </label>
              <input
                value={item.drugName}
                onChange={(e) => onUpdate(index, 'drugName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-4 text-sm transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
                    : 'bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder={t('prescriptionForm.drugNamePlaceholder')}
              />

              <label
                className={`block text-xs font-semibold mb-1 mt-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                }`}
              >
                {t('prescriptionForm.instructionsLabel')}
              </label>
              <input
                value={item.instructions}
                onChange={(e) => onUpdate(index, 'instructions', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-4 text-sm transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
                    : 'bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
                placeholder={t('prescriptionForm.instructionsPlaceholder')}
              />
            </div>
          )}

          {/* Desktop layout - chỉ hiển thị trên tablet trở lên */}
          {isTabletOrAbove && (
            <div
              className={`grid grid-cols-12 gap-4 items-start rounded-xl border px-4 py-3 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
              }`}
            >
              <div
                className={`col-span-1 flex items-center justify-center pt-3 font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {index + 1}
              </div>
              <div className="col-span-5">
                <input
                  value={item.drugName}
                  onChange={(e) => onUpdate(index, 'drugName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-4 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
                      : 'bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder={t('prescriptionForm.drugNamePlaceholder')}
                />
              </div>
              <div className="col-span-5">
                <input
                  value={item.instructions}
                  onChange={(e) => onUpdate(index, 'instructions', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-4 transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
                      : 'bg-white border-blue-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder={t('prescriptionForm.instructionsPlaceholder')}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center pt-2">
                <button
                  onClick={() => onRemove(index)}
                  className={`p-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'text-red-400 hover:bg-red-900/30'
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                  aria-label={t('prescriptionForm.deleteButton')}
                  title={t('prescriptionForm.deleteButton')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Nút thêm dòng */}
      <button
        onClick={onAdd}
        className={`w-full py-3 border-2 border-dashed rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          theme === 'dark'
            ? 'border-blue-800 text-blue-400 hover:bg-blue-900/30 hover:border-blue-600'
            : 'border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-500'
        } ${aiAssistantOpen ? 'px-3' : 'px-4'}`}
        aria-label={t('prescriptionForm.addButton')}
        title={t('prescriptionForm.addButton')}
      >
        <Plus size={18} />
        {t('prescriptionForm.addButton')}
      </button>
    </div>
  );
}