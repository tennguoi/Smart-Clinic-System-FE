import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const fallbackAppointments = [
  {
    id: 'sample-1',
    patientName: 'Nguyễn Văn A',
    time: '09:30',
    date: new Date().toISOString(),
    reason: 'Khám tổng quát',
  },
  {
    id: 'sample-2',
    patientName: 'Trần Thị B',
    time: '10:15',
    date: new Date().toISOString(),
    reason: 'Tái khám định kỳ',
  },
];

export default function DoctorScheduleSection() {
  const { theme } = useTheme();
  const [appointments, setAppointments] = useState(fallbackAppointments);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  const derivedStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter((appt) => new Date(appt.date).toDateString() === today).length;
    return {
      todayAppointments,
      totalUpcoming: appointments.length,
      weekPatients: Math.max(appointments.length - 1, 0),
    };
  }, [appointments]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-lg p-6 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>Lịch hôm nay</h3>
          <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{derivedStats.todayAppointments}</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>Cuộc hẹn đang chờ khám</p>
        </div>
        <div className={`border rounded-lg p-6 ${theme === 'dark' ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'}`}>Bệnh nhân tuần này</h3>
          <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{derivedStats.weekPatients}</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>Đã hoàn thành khám</p>
        </div>
        <div className={`border rounded-lg p-6 ${theme === 'dark' ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>Lịch sắp tới</h3>
          <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>{derivedStats.totalUpcoming}</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>Cuộc hẹn trong danh sách</p>
        </div>
      </div>

      <div className={`rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Lịch khám sắp tới</h2>
          {appointmentsError && <span className="text-sm text-red-600">{appointmentsError}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Bệnh nhân</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Ngày</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Giờ</th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Lý do</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {appointmentsLoading ? (
                <tr>
                  <td colSpan="4" className={`px-6 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Đang tải dữ liệu...</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id || `${appt.patientName}-${appt.time}`} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{appt.patientName}</td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {new Date(appt.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{appt.time}</td>
                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{appt.reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
