import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AppointmentSearchFilter({
  searchKeyword,
  searchStatus,
  onSearchKeywordChange,
  onSearchStatusChange,
  onClear
}) {
  const handleClearAll = () => {
    onSearchKeywordChange('');
    onSearchStatusChange('all');
    onClear();
  };

  const hasActiveFilters = searchKeyword || searchStatus !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Combined search for name and phone */}
        <div className="flex flex-col">
          <label htmlFor="searchKeyword" className="text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              id="searchKeyword"
              type="text"
              placeholder="Nhập tên hoặc số điện thoại..."
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchKeyword && (
              <button
                onClick={() => onSearchKeywordChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-col">
          <label htmlFor="searchStatus" className="text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            id="searchStatus"
            value={searchStatus}
            onChange={(e) => onSearchStatusChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="checked-in">Đã thêm</option>
            <option value="upcoming">Sắp tới</option>
            <option value="past">Quá giờ</option>
            <option value="waiting">Chờ check-in</option>
          </select>
        </div>

        {/* Clear button */}
        <div className="flex items-end">
  <button
    onClick={handleClearAll}
    disabled={!hasActiveFilters}
    className="w-full px-4 py-3 rounded-xl font-medium transition-colors
      bg-gray-300 text-gray-700 
      hover:bg-gray-400"
  >
    Xóa bộ lọc
  </button>
</div>
      </div>

      {/* Active filters indicator */}
      {searchKeyword && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <span className="font-medium">Đang lọc:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Từ khóa: {searchKeyword}
          </span>
        </div>
      )}
    </div>
  );
}