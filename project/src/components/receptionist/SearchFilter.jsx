import React, { useEffect } from 'react';
import { Users, Plus, X } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Waiting', label: 'Chờ khám' },
  { value: 'InProgress', label: 'Đang khám' },
  { value: 'Completed', label: 'Đã hoàn thành' },
  { value: 'Cancelled', label: 'Hủy' }
];

export default function SearchFilter({
  searchPhone,
  filterStatus,
  onSearchPhoneChange,
  onFilterStatusChange,
  onSearch,
  onClear,
  onAddPatient
}) {
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
     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mt-2 w-full transition-colors duration-300">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Phone search */}
    <div className="flex flex-col">
      <label htmlFor="searchPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tìm kiếm
      </label>
      <div className="relative">
        <input
          id="searchPhone"
          type="text"
          placeholder="Nhập số điện thoại..."
          value={searchPhone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            onSearchPhoneChange(value);
          }}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
        />
        {searchPhone && (
          <button
            onClick={() => onSearchPhoneChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>

    {/* Status filter */}
    <div className="flex flex-col">
      <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Trạng thái
      </label>
      <select
        id="filterStatus"
        value={filterStatus}
        onChange={(e) => onFilterStatusChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Xóa bộ lọc
      </button>
    </div>
  </div>
</div>

    </div>
  );
}