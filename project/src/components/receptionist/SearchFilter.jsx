import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, X } from 'lucide-react';

export default function SearchFilter({
  searchPhone,
  filterStatus,
  onSearchPhoneChange,
  onFilterStatusChange,
  onSearch,
  onClear,
  onAddPatient
}) {
  const { t } = useTranslation();

  // Status options with i18n
  const statusOptions = [
    { value: '', label: t('queueManagement.filters.allStatus') },
    { value: 'Waiting', label: t('queueManagement.status.waiting') },
    { value: 'InProgress', label: t('queueManagement.status.inProgress') },
    { value: 'Completed', label: t('queueManagement.status.completed') },
    { value: 'Cancelled', label: t('queueManagement.status.cancelled') }
  ];

  // Auto search when phone changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchPhone || filterStatus) {
        onSearch();
      } else {
        onClear();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchPhone]);

  // Auto search when status changes (immediate)
  useEffect(() => {
    if (filterStatus !== undefined) {
      onSearch();
    }
  }, [filterStatus]);

  const handleClearAll = () => {
    onSearchPhoneChange('');
    onFilterStatusChange('');
    onClear();
  };

  return (
    <div className="space-y-4">
      {/* Search filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mt-2 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Phone search */}
          <div className="flex flex-col">
            <label htmlFor="searchPhone" className="text-sm font-medium text-gray-700 mb-2">
              {t('queueManagement.filters.search')}
            </label>
            <div className="relative">
              <input
                id="searchPhone"
                type="text"
                placeholder={t('queueManagement.filters.searchPlaceholder')}
                value={searchPhone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  onSearchPhoneChange(value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchPhone && (
                <button
                  onClick={() => onSearchPhoneChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex flex-col">
            <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 mb-2">
              {t('queueManagement.filters.status')}
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleClearAll}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t('queueManagement.filters.clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}