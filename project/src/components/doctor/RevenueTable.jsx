const schedule = [
  { stt: 1, time: '08:00', patient: 'Nguyễn Văn Anh', service: 'Khám tai', room: 'P101', status: 'Đã xác nhận' },
  { stt: 2, time: '08:30', patient: 'Trần Thị Bích', service: 'Khám tai-mũi-họng', room: 'P203', status: 'Đang chờ' },
  { stt: 3, time: '09:00', patient: 'Lê Văn Công', service: 'Xét nghiệm', room: 'P305', status: 'Đã xác nhận' },
  { stt: 4, time: '09:30', patient: 'Phạm Thị Dương', service: 'Khám họng', room: 'P111', status: 'Đã khám' },
];

export default function RevenueTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Lịch khám hôm nay</h2>
        <p className="text-sm text-gray-600 mt-1">Tổng số lịch: {schedule.length}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Giờ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bệnh nhân</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dịch vụ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phòng</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedule.map((row) => (
              <tr key={row.stt} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.stt}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.time}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.patient}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.service}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.room}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


