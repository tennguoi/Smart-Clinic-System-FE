// src/components/queue/QueueTable.jsx
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import { Eye, Trash2 } from 'lucide-react';

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
  itemsPerPage = 10,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { t } = useTranslation();

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  const priorityLabels = {
    Normal: t('queueManagement.priority.normal'),
    Urgent: t('queueManagement.priority.urgent'),
    Emergency: t('queueManagement.priority.emergency'),
    Thường: t('queueManagement.priority.normal'),
    'Bình thường': t('queueManagement.priority.normal'),
    'Ưu tiên': t('queueManagement.priority.urgent'),
    'Khẩn cấp': t('queueManagement.priority.emergency'),
  };

  const statusLabels = {
    Waiting: t('queueManagement.status.waiting'),
    InProgress: t('queueManagement.status.inProgress'),
    Completed: t('queueManagement.status.completed'),
    Cancelled: t('queueManagement.status.cancelled'),
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {queueList.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t('queueManagement.noQueue', 'Chưa có bệnh nhân nào trong hàng đợi')}
          </div>
        ) : (
          queueList.map((q, index) => (
            <div
              key={q.queueId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    #{currentPage * itemsPerPage + index + 1} - {q.queueNumber || '—'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {q.patientName || '—'}
                  </div>
                </div>
                {onEdit && (
                  <button
                    onClick={() => onEdit(q)}
                    className="text-blue-600 dark:text-blue-400 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">NS:</span>{' '}
                  <span className="font-medium">{q.dobFormatted || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">SĐT:</span>{' '}
                  <span className="font-medium">{q.phone || '—'}</span>
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">Phòng:</span>{' '}
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {q.roomName || t('queueManagement.notAssigned', 'Chưa phân phòng')}
                  </span>
                  {q.doctorName && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">BS: {q.doctorName}</div>
                  )}
                </div>

                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ưu tiên:</span>{' '}
                  <span className={`inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(q.priority)}`}>
                    {priorityLabels[q.priority] || q.priority || '—'}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
                  <div className="mt-1">
                    <select
                      value={q.status || 'Waiting'}
                      onChange={(e) => onStatusChange?.(q.queueId, e.target.value)}
                      className={`w-full px-2 py-1 rounded text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(q.status)}`}
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">Check-in:</span>{' '}
                  <span className="font-medium">{formatDateTime(q.checkInTime)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Tablet & Desktop Table View
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
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
            {!isTablet && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t('queueManagement.table.dob')}
              </th>
            )}
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
              <td colSpan={isTablet ? 9 : 10} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                {t('queueManagement.noQueue', 'Chưa có bệnh nhân nào trong hàng đợi')}
              </td>
            </tr>
          ) : (
            queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage * itemsPerPage + index + 1}
                </td>

                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {q.queueNumber || '—'}
                </td>

                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {q.patientName || '—'}
                  </div>
                </td>

                {!isTablet && (
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {q.dobFormatted || '—'}
                  </td>
                )}

                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {q.phone || '—'}
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