// src/components/queue/QueueTable.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, User } from 'lucide-react';

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
  if (s?.includes('chờ') || s === 'waiting') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (s?.includes('đang khám') || s === 'inprogress') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (s?.includes('hoàn thành') || s === 'completed') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  if (s?.includes('hủy') || s === 'cancelled') return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

export default function QueueTable({
  queueList,
  currentPage = 0,
  ITEMS_PER_PAGE = 10,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { t } = useTranslation();

  const priorityLabels = {
    Normal: t('queueManagement.priority.normal'),
    Urgent: t('queueManagement.priority.urgent'),
    Emergency: t('queueManagement.priority.emergency'),
    Thường: t('queueManagement.priority.normal'),
    'Ưu tiên': t('queueManagement.priority.urgent'),
    'Khẩn cấp': t('queueManagement.priority.emergency'),
  };

  const statusLabels = {
    Waiting: t('queueManagement.status.waiting'),
    InProgress: t('queueManagement.status.inProgress'),
    Completed: t('queueManagement.status.completed'),
    Cancelled: t('queueManagement.status.cancelled'),
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.stt')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.queueCode')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.patient')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.dob')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.contact')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.room')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.priority')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.checkIn')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('queueManagement.table.actions')}
            </th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {queueList.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                {t('queueManagement.noQueue', 'Chưa có bệnh nhân nào trong hàng đợi')}
              </td>
            </tr>
          ) : (
            queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage * ITEMS_PER_PAGE + index + 1}
                </td>

                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {q.queueNumber || '—'}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {q.patientName || '—'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {q.dob ? new Date(q.dob).toLocaleDateString('vi-VN') : '—'}
                </td>

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <div>{q.phone || '—'}</div>
                  {q.email && <div className="text-xs text-blue-600 dark:text-blue-400">{q.email}</div>}
                </td>

                <td className="px-4 py-3 text-sm">
                  {q.roomName ? (
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-400">{q.roomName}</div>
                      {q.doctorName && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          BS: {q.doctorName}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      {t('queueManagement.notAssigned', 'Chưa phân phòng')}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(q.priority)}`}>
                    {priorityLabels[q.priority] || q.priority || '—'}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <select
                    value={q.status || 'Waiting'}
                    onChange={(e) => onStatusChange?.(q.queueId, e.target.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(q.status)}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {formatDateTime(q.checkInTime)}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(q)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        title={t('queueManagement.actions.view', 'Xem / Chỉnh sửa')}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(q.queueId)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                        title={t('queueManagement.actions.delete', 'Xóa')}
                      >
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