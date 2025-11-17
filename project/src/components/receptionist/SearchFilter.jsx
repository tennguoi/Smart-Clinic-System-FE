import React, { useEffect } from 'react';
import { Users, Plus } from 'lucide-react';

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
      {/* Header with title and Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">Danh sách bệnh nhân</h2>
        </div>
        
        <button
          onClick={onAddPatient}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm bệnh nhân
        </button>
      </div>

        {/* Search filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Phone search */}
          <div className="flex flex-col">
            <label htmlFor="searchPhone" className="text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm 
            </label>
            <input
              id="searchPhone"
              type="text"
              placeholder="Nhập số điện thoại..."
              value={searchPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                onSearchPhoneChange(value);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-col">
            <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}