import { useState, useMemo } from 'react';

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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Lịch hôm nay</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{derivedStats.todayAppointments}</p>
          <p className="text-sm text-blue-700 mt-1">Cuộc hẹn đang chờ khám</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Bệnh nhân tuần này</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{derivedStats.weekPatients}</p>
          <p className="text-sm text-emerald-700 mt-1">Đã hoàn thành khám</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Lịch sắp tới</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{derivedStats.totalUpcoming}</p>
          <p className="text-sm text-purple-700 mt-1">Cuộc hẹn trong danh sách</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lịch khám sắp tới</h2>
          {appointmentsError && <span className="text-sm text-red-600">{appointmentsError}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giờ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lý do</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointmentsLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id || `${appt.patientName}-${appt.time}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{appt.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(appt.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.reason || '—'}</td>
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

