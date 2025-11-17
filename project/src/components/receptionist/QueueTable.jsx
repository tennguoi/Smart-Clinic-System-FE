import React from 'react';

const priorityLabels = { Normal: 'Thường', Urgent: 'Ưu tiên', Emergency: 'Khẩn cấp' };
const statusLabels = { Waiting: 'Chờ khám', InProgress: 'Đang khám', Completed: 'Đã hoàn thành', Cancelled: 'Hủy' };

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return value;
  }
};

export default function QueueTable({ queueList, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold">STT</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Mã hàng đợi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Tên</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Liên hệ</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Ưu tiên</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Trạng thái</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Check-in</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {queueList.map((q, index) => (
            <tr key={q.queueId} className="hover:bg-gray-50">
              <td className="px-4 py-3">{index + 1}</td>
              <td className="px-4 py-3">{q.queueNumber || '—'}</td>
              <td className="px-4 py-3">{q.patientName}</td>
              <td className="px-4 py-3">{q.phone || '—'}</td>
              <td className="px-4 py-3">{priorityLabels[q.priority]}</td>
              <td className="px-4 py-3">
                <select 
                  value={q.status} 
                  onChange={(e) => onStatusChange(q.queueId, e.target.value)} 
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">{formatDateTime(q.checkInTime)}</td>
              <td className="px-4 py-3 space-x-1">
                <button 
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs" 
                  onClick={() => onEdit(q)}
                >
                  Sửa
                </button>
                <button 
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs" 
                  onClick={() => onDelete(q.queueId)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}