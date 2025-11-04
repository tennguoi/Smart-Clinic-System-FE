import { Download } from 'lucide-react';

const tableData = [
  { stt: 1, date: '01/12/2024', revenue: '18,500,000', patients: 45, tests: 12, prescriptions: 32 },
  { stt: 2, date: '02/12/2024', revenue: '16,200,000', patients: 38, tests: 10, prescriptions: 28 },
  { stt: 3, date: '03/12/2024', revenue: '21,800,000', patients: 52, tests: 15, prescriptions: 38 },
  { stt: 4, date: '04/12/2024', revenue: '19,400,000', patients: 41, tests: 13, prescriptions: 30 },
  { stt: 5, date: '05/12/2024', revenue: '22,600,000', patients: 48, tests: 18, prescriptions: 35 },
  { stt: 6, date: '06/12/2024', revenue: '17,900,000', patients: 43, tests: 11, prescriptions: 31 },
  { stt: 7, date: '07/12/2024', revenue: '20,100,000', patients: 46, tests: 14, prescriptions: 34 },
  { stt: 8, date: '08/12/2024', revenue: '23,500,000', patients: 55, tests: 16, prescriptions: 40 }
];

export default function RevenueTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Chi Tiết Doanh Thu</h2>
          <p className="text-sm text-gray-600 mt-1">Thống kê chi tiết theo ngày</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Download className="w-4 h-4" />
          Xuất Báo Cáo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Doanh Thu (VNĐ)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Bệnh Nhân Khám</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Phiếu Xét Nghiệm</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Đơn Thuốc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((row) => (
              <tr key={row.stt} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.stt}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{row.date}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{row.revenue}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {row.patients}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
                    {row.tests}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                    {row.prescriptions}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-600">Hiển thị 1-8 của 30 kết quả</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Trước</button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">1</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Sau</button>
        </div>
      </div>
    </div>
  );
}
