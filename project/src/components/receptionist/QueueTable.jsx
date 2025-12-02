import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, User, Eye } from 'lucide-react';

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

export default function QueueTable({ 
  queueList, 
  currentPage = 0, 
  ITEMS_PER_PAGE = 10, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) {
  const { t } = useTranslation();

  // Mapping priority keys
  const priorityLabels = {
    Normal: t('queueManagement.priority.normal'),
    Urgent: t('queueManagement.priority.urgent'),
    Emergency: t('queueManagement.priority.emergency'),
    'Thường': t('queueManagement.priority.normal'),
    'Ưu tiên': t('queueManagement.priority.urgent'),
    'Khẩn cấp': t('queueManagement.priority.emergency')
  };

  // Mapping status keys
  const statusLabels = {
    Waiting: t('queueManagement.status.waiting'),
    InProgress: t('queueManagement.status.inProgress'),
    Completed: t('queueManagement.status.completed'),
    Cancelled: t('queueManagement.status.cancelled'),
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.stt')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.queueCode')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.patient')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.dob')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.contact')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.room')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.priority')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.status')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.checkIn')}
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('queueManagement.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {queueList.length === 0 ? (
            <tr>
              <td colSpan="10" className="px-4 py-10 text-center text-gray-500">
                {t('queueManagement.noQueue')}
              </td>
            </tr>
          ) : (
            queueList.map((q, index) => (
              <tr key={q.queueId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {currentPage * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {q.queueNumber || t('queueManagement.noQueueNumber')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{q.patientName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {q.dob || t('queueManagement.noQueueNumber')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div>{q.phone || t('queueManagement.noQueueNumber')}</div>
                  {q.email && <div className="text-xs text-blue-600">{q.email}</div>}
                </td>
                <td className="px-4 py-3 text-sm">
                  {q.roomName ? (
                    <div className="font-medium text-green-700">
                      {q.roomName}
                      {q.doctorName && (
                        <div className="text-xs text-gray-600">
                          {t('queueManagement.doctor', { name: q.doctorName })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">
                      {t('queueManagement.notAssigned')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(q.priority)}`}>
                    {priorityLabels[q.priority] || q.priority || t('queueManagement.unknown')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={q.status}
                    onChange={(e) => onStatusChange(q.queueId, e.target.value)}
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(q.status)}`}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {formatDateTime(q.checkInTime)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(q)} 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" 
                        title={t('queueManagement.actions.view')}
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