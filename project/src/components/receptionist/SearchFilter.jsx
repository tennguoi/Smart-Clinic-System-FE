import React from 'react';

const statusLabels = { Waiting: 'Chờ khám', InProgress: 'Đang khám', Completed: 'Đã hoàn thành', Cancelled: 'Hủy' };

export default function SearchFilter({ 
  searchPhone, 
  filterStatus, 
  onSearchPhoneChange, 
  onFilterStatusChange, 
  onSearch, 
  onClear, 
  onAddPatient 
}) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex space-x-2">
        <input 
          type="text" 
          placeholder="Tìm theo số điện thoại" 
          value={searchPhone} 
          onChange={(e) => onSearchPhoneChange(e.target.value)} 
          className="border border-gray-300 rounded px-3 py-1" 
        />
        <select 
          value={filterStatus} 
          onChange={(e) => onFilterStatusChange(e.target.value)} 
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button 
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" 
          onClick={onSearch}
        >
          Tìm kiếm
        </button>
        <button 
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" 
          onClick={onClear}
        >
          Xóa lọc
        </button>
      </div>
      <button 
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
        onClick={onAddPatient}
      >
        Thêm bệnh nhân
      </button>
    </div>
  );
}