import React from 'react';
import { Edit, Trash2, User, DoorOpen } from 'lucide-react';

const priorityLabels = { 
  Normal: 'Thường', 
  Urgent: 'Ưu tiên', 
  Emergency: 'Khẩn cấp' 
};

const statusLabels = { 
  Waiting: 'Chờ khám', 
  InProgress: 'Đang khám', 
  Completed: 'Đã hoàn thành', 
  Cancelled: 'Hủy' 
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
  switch (priority) {
    case 'Emergency':
      return 'bg-red-100 text-red-700';
    case 'Urgent':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Waiting':
      return 'bg-yellow-100 text-yellow-700';
    case 'InProgress':
      return 'bg-blue-100 text-blue-700';
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function QueueTable({ queueList, onEdit, onDelete, onStatusChange, onAssignRoom }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              STT
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Mã hàng đợi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Bệnh nhân
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Liên hệ
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ưu tiên
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Check-in
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {queueList.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-4 py-10 text-center text-gray-500">
                Chưa có bệnh nhân nào trong hàng đợi
              </td>
            </tr>
          ) : (
            queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {q.queueNumber || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{q.patientName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div>{q.phone || '—'}</div>
                  {q.email && (
                    <div className="text-xs text-blue-600">{q.email}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                      q.priority
                    )}`}
                  >
                    {priorityLabels[q.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={q.status}
                    onChange={(e) => onStatusChange(q.queueId, e.target.value)}
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                      q.status
                    )}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDateTime(q.checkInTime)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    {q.status === 'Waiting' && (
                      <button
                        onClick={() => onAssignRoom(q)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Phân phòng"
                      >
                        <DoorOpen className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(q)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(q.queueId)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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