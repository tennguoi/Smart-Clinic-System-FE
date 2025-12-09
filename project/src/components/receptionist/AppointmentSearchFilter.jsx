// AppointmentSearchFilter.jsx
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppointmentSearchFilter({
  searchKeyword,
  searchStatus,
  onSearchKeywordChange,
  onSearchStatusChange,
  onClear,
}) {
  const { theme } = useTheme();

  const handleClearAll = () => {
    onSearchKeywordChange('');
    onSearchStatusChange('all');
    onClear?.();
  };

  const hasActiveFilters = Boolean(searchKeyword) || searchStatus !== 'all';

  return (
    <div
      className={`rounded-2xl border shadow-sm p-4 md:p-5 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Khung: 3 cột như bản gốc (Tìm kiếm / Trạng thái / Xóa bộ lọc) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tìm kiếm (name + phone) */}
        <div className="relative">
          <label
            className={`block mb-1 text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Tìm kiếm
          </label>
          <input
            value={searchKeyword}
            onChange={(e) => onSearchKeywordChange(e.target.value)}
            placeholder="Nhập tên hoặc số điện thoại"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-900/50 focus:border-blue-700'
                : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-transparent'
            }`}
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => onSearchKeywordChange('')}
              className={`absolute right-3 top-9 rounded p-1 transition ${
                theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Xóa nội dung tìm kiếm"
              title="Xóa nội dung tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Trạng thái */}
        <div>
          <label
            className={`block mb-1 text-sm font-semibold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Trạng thái
          </label>
          <select
            value={searchStatus}
            onChange={(e) => onSearchStatusChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-gray-900 border-gray-700 text-white focus:ring-blue-900/50 focus:border-blue-700'
                : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-transparent'
            }`}
          >
            <option value="all">Tất cả</option>
            <option value="checked-in">Đã thêm</option>
            <option value="upcoming">Sắp tới</option>
            <option value="past">Quá giờ</option>
            <option value="waiting">Chờ check-in</option>
          </select>
        </div>

        {/* Xóa bộ lọc */}
        <div className="flex md:items-end">
          <div className="w-full">
            <label className="sr-only">Xóa bộ lọc</label>
            <button
              type="button"
              onClick={handleClearAll}
              className={`w-full px-4 py-3 rounded-xl font-semibold transition ${
                hasActiveFilters
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Active filters indicator (giữ nguyên nội dung "Đang lọc: …") */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {searchKeyword && (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-gray-200'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              Đang lọc: Từ khóa: <strong>{searchKeyword}</strong>
              <button
                type="button"
                onClick={() => onSearchKeywordChange('')}
                className={`rounded p-1 transition ${
                  theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Bỏ từ khóa"
                title="Bỏ từ khóa"
              >
                <X size={14} />
              </button>
            </span>
          )}

          {searchStatus !== 'all' && (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-700 text-gray-200'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              Trạng thái: <strong>{searchStatus}</strong>
              <button
                type="button"
                onClick={() => onSearchStatusChange('all')}
                className={`rounded p-1 transition ${
                  theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label="Bỏ trạng thái"
                title="Bỏ trạng thái"
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