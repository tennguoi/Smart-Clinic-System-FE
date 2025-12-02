import React from 'react';
import { Edit, Trash2, User, Eye } from 'lucide-react';

const priorityLabels = {
  Normal: 'Thường', Urgent: 'Ưu tiên', Emergency: 'Khẩn cấp',
  'Thường': 'Thường', 'Ưu tiên': 'Ưu tiên', 'Khẩn cấp': 'Khẩn cấp'
};

const statusLabels = {
  Waiting: 'Chờ khám',
  InProgress: 'Đang khám',
  Completed: 'Đã hoàn thành',
  Cancelled: 'Hủy',
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const getPriorityColor = (priority) => {
  const p = priority?.toString().toLowerCase().trim();
  if (p?.includes('khẩn') || p === 'emergency') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  if (p?.includes('ưu') || p === 'urgent') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
};

const getStatusColor = (status) => {
  const s = status?.toString().toLowerCase().trim();
  if (s?.includes('đang chờ') || s === 'waiting') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (s?.includes('đang khám') || s === 'inprogress') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (s?.includes('hoàn tất') || s === 'completed') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (s?.includes('hủy') || s === 'cancelled') return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

export default function QueueTable({ queueList, currentPage = 0,  ITEMS_PER_PAGE= 10, onEdit, onDelete, onStatusChange  }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">STT</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mã hàng đợi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bệnh nhân</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ngày sinh</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Liên hệ</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phòng khám</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ưu tiên</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Check-in</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {queueList.length === 0 ? (
            <tr>
              <td colSpan="10" className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                Chưa có bệnh nhân nào trong hàng đợi
              </td>
            </tr>
          ) : (
            queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{currentPage * ITEMS_PER_PAGE + index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{q.queueNumber || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{q.patientName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{q.dob || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>{q.phone || '—'}</div>
                  {q.email && <div className="text-xs text-blue-600 dark:text-blue-400">{q.email}</div>}
                </td>
                <td className="px-4 py-3 text-sm">
                  {q.roomName ? (
                    <div className="font-medium text-green-700 dark:text-green-400">
                      {q.roomName}
                      {q.doctorName && <div className="text-xs text-gray-600 dark:text-gray-400">BS: {q.doctorName}</div>}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Đang phân phòng...</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(q.priority)}`}>
                    {priorityLabels[q.priority] || q.priority || 'Chưa xác định'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={q.status}
                    onChange={(e) => onStatusChange(q.queueId, e.target.value)}
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${getStatusColor(q.status)}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(q.checkInTime)}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(q)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Chỉnh sửa">
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                  
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}