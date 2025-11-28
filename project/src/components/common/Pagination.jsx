import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Component phân trang tái sử dụng
 * Dùng chung cho các trang quản lý
 * 
 * @param {number} currentPage - Trang hiện tại (0-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Callback khi chuyển trang
 * @param {string} className - Custom className (optional)
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  // Không hiển thị nếu chỉ có 1 trang hoặc ít hơn
  if (totalPages <= 1) return null;

  const maxVisible = 5; // Số trang hiển thị tối đa
  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  // Điều chỉnh nếu không đủ trang hiển thị
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(0, endPage - maxVisible + 1);
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 mt-8 py-4 border-t border-gray-200 ${className}`}>
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Trang đầu"
      >
        <ChevronsLeft className="w-5 h-5" />
      </button>

      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Trang trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2.5 rounded-lg border font-medium transition ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
          title={`Trang ${page + 1}`}
        >
          {page + 1}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Trang sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Trang cuối"
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
}

