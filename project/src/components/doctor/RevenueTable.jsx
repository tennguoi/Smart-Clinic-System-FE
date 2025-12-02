import { useTheme } from '../../contexts/ThemeContext';

const schedule = [
  { stt: 1, time: '08:00', patient: 'Nguyễn Văn Anh', service: 'Khám tai', room: 'P101', status: 'Đã xác nhận' },
  { stt: 2, time: '08:30', patient: 'Trần Thị Bích', service: 'Khám tai-mũi-họng', room: 'P203', status: 'Đang chờ' },
  { stt: 3, time: '09:00', patient: 'Lê Văn Công', service: 'Xét nghiệm', room: 'P305', status: 'Đã xác nhận' },
  { stt: 4, time: '09:30', patient: 'Phạm Thị Dương', service: 'Khám họng', room: 'P111', status: 'Đã khám' },
];

export default function RevenueTable() {
  const { theme } = useTheme();

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Lịch khám hôm nay</h2>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tổng số lịch: {schedule.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>STT</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Giờ</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bệnh nhân</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Dịch vụ</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phòng</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Trạng thái</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {schedule.map((row) => (
              <tr key={row.stt} className={`transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{row.stt}</td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{row.time}</td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{row.patient}</td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{row.service}</td>
                <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{row.room}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
