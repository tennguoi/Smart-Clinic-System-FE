import React from 'react';

/**
 * Component hiển thị badge số lượng items
 * Dùng chung cho các trang quản lý
 * 
 * @param {number} currentCount - Số lượng items hiện tại trên trang
 * @param {number} totalCount - Tổng số items
 * @param {string} label - Nhãn hiển thị (ví dụ: "tài khoản", "tin tức", "dịch vụ")
 * @param {string} className - Custom className (optional)
 */
export default function CountBadge({ currentCount, totalCount, label, className = '' }) {
  // Không hiển thị nếu không có items
  if (!totalCount || totalCount === 0) {
    return null;
  }

  return (
    <span 
      className={`text-lg font-medium text-gray-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 ${className}`}
    >
      {currentCount}/{totalCount} {label}
    </span>
  );
}

