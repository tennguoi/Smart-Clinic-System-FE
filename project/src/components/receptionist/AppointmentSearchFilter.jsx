// AppointmentSearchFilter.jsx
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function AppointmentSearchFilter({
  searchKeyword,
  searchStatus,
  onSearchKeywordChange,
  onSearchStatusChange,
  onClear,
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';

  const handleClearAll = () => {
    onSearchKeywordChange('');
    onSearchStatusChange('all');
    onClear?.();
  };

  const hasActiveFilters = Boolean(searchKeyword) || searchStatus !== 'all';

  return (
    <div
      className={`rounded-xl shadow-md border p-6 mt-2 transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Khung: 3 cột như bản gốc (Tìm kiếm / Trạng thái / Xóa bộ lọc) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tìm kiếm (name + phone) */}
        <div className="flex flex-col">
          <label
            htmlFor="searchKeyword"
            className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {t('appointments.search')}
          </label>
          <div className="relative">
            <input
              id="searchKeyword"
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              placeholder={t('appointments.searchPlaceholder')}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => onSearchKeywordChange('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={t('appointments.clearSearch')}
                title={t('appointments.clearSearch')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trạng thái */}
        <div className="flex flex-col">
          <label
            htmlFor="searchStatus"
            className={`text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {t('appointments.status')}
          </label>
          <select
            id="searchStatus"
            value={searchStatus}
            onChange={(e) => onSearchStatusChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">{t('appointments.statusOptions.all')}</option>
            <option value="checked-in">{t('appointments.statusOptions.checkedIn')}</option>
            <option value="upcoming">{t('appointments.statusOptions.upcoming')}</option>
            <option value="past">{t('appointments.statusOptions.past')}</option>
            <option value="waiting">{t('appointments.statusOptions.waiting')}</option>
          </select>
        </div>

        {/* Xóa bộ lọc */}
        <div className="flex flex-col justify-end">
         <button
  type="button"
  onClick={handleClearAll}
  className={`w-full px-4 py-3 font-medium rounded-xl transition ${
    isDark
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
  }`}
>
            {t('appointments.clearFilters')}
          </button>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {searchKeyword && (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                isDark
                  ? 'bg-gray-900 border-gray-700 text-gray-200'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              {t('appointments.filteringBy')}: {t('appointments.keyword')}: <strong>{searchKeyword}</strong>
              <button
                type="button"
                onClick={() => onSearchKeywordChange('')}
                className={`rounded p-1 transition ${
                  isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label={t('appointments.removeKeyword')}
                title={t('appointments.removeKeyword')}
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}