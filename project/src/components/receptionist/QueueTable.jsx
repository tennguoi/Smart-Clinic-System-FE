import React from 'react';
import { Edit, Trash2, User, DoorOpen } from 'lucide-react';

// Mapping ưu tiên & trạng thái
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
  if (p?.includes('khẩn') || p === 'emergency') return 'bg-red-100 text-red-700';
  if (p?.includes('ưu') || p === 'urgent') return 'bg-orange-100 text-orange-700';
  return 'bg-blue-100 text-blue-700';
};

const getStatusColor = (status) => {
  const s = status?.toString().toLowerCase().trim();
  if (s?.includes('đang chờ') || s === 'waiting') return 'bg-yellow-100 text-yellow-700';
  if (s?.includes('đang khám') || s === 'inprogress') return 'bg-blue-100 text-blue-700';
  if (s?.includes('hoàn tất') || s === 'completed') return 'bg-green-100 text-green-700';
  if (s?.includes('hủy') || s === 'cancelled') return 'bg-gray-100 text-gray-700';
  return 'bg-gray-100 text-gray-700';
};

export default function QueueTable({ queueList, onEdit, onDelete, onStatusChange, onAssignRoom }) {
  const canAssignRoom = (q) => {
    if (!onAssignRoom) return false;
    if (q.assignedRoomId) return false;
    const s = (q.status || '').toLowerCase();
    return s === 'waiting' || s.includes('chờ');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã hàng đợi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bệnh nhân</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ưu tiên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-in</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Thao tác</th>
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
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{q.queueNumber || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{q.patientName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{q.dob || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div>{q.phone || '—'}</div>
                  {q.email && <div className="text-xs text-blue-600">{q.email}</div>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(q.priority)}`}>
                    {priorityLabels[q.priority] || q.priority || 'Chưa xác định'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={q.status}
                    onChange={(e) => {
                      if (!q.queueId) {
                        console.error('Queue ID is missing:', q);
                        alert('Lỗi: Không tìm thấy ID hàng đợi. Vui lòng làm mới trang.');
                        return;
                      }
                      onStatusChange(q.queueId, e.target.value);
                    }}
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(q.status)}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(q.checkInTime)}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    {canAssignRoom(q) && (
                      <button
                        onClick={() => onAssignRoom(q)}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                        title="Phân phòng"
                        type="button"
                      >
                        <DoorOpen className="w-5 h-5" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(q)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Chỉnh sửa">
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(q.queueId)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Xóa">
                        <Trash2 className="w-5 h-5" />
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