import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AppointmentSearchFilter({
  searchName,
  searchPhone,
  onSearchNameChange,
  onSearchPhoneChange,
  onClear
}) {
  const handleClearAll = () => {
    onSearchNameChange('');
    onSearchPhoneChange('');
    onClear();
  };

  const hasActiveFilters = searchName || searchPhone;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name search */}
        <div className="flex flex-col">
          <label htmlFor="searchName" className="text-sm font-medium text-gray-700 mb-2">
            Tìm theo tên
          </label>
          <div className="relative">
            <input
              id="searchName"
              type="text"
              placeholder="Nhập tên bệnh nhân..."
              value={searchName}
              onChange={(e) => onSearchNameChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchName && (
              <button
                onClick={() => onSearchNameChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Phone search */}
        <div className="flex flex-col">
          <label htmlFor="searchPhone" className="text-sm font-medium text-gray-700 mb-2">
            Tìm theo số điện thoại
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={10}
            />
            {searchPhone && (
              <button
                onClick={() => onSearchPhoneChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clear button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            type="button"
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Đang lọc:</span>
          {searchName && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Tên: {searchName}
            </span>
          )}
          {searchPhone && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              SĐT: {searchPhone}
            </span>
          )}
        </div>
      )}
    </div>
  );
}