import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LineChartIcon,
  Stethoscope,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getDoctorStats } from '../../api/doctorApi';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const RANGE_OPTIONS = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
];

const formatPercentage = (value) => {
  if (value == null || value === 0) return 'N/A';
  return `${Math.round(value * 100)}%`;
};

export default function DoctorStatsDashboard() {
  const [rangeType, setRangeType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isForceRefresh, setIsForceRefresh] = useState(false);

  const doctorId = useMemo(() => {
    const userInfo = authService.getUserInfo();
    const id = userInfo?.userId || userInfo?.id || userInfo?.doctorId;
    return id ? String(id) : null;
  }, []);

  useEffect(() => {
    const roles = authService.getRoles();
    const isDoctor = roles.includes('ROLE_BAC_SI') || roles.includes('ROLE_ADMIN');
    if (!isDoctor) {
      setError('Bạn không có quyền xem thống kê. Chỉ bác sĩ mới được phép.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setError('Không tìm thấy thông tin bác sĩ');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDoctorStats(doctorId, rangeType, selectedDate, isForceRefresh);
        setStatsData(data);
        if (isForceRefresh) setIsForceRefresh(false);
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || 'Không thể tải dữ liệu thống kê';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [doctorId, rangeType, selectedDate, refreshKey, isForceRefresh]);

  const chartData = useMemo(() => {
    if (!statsData?.series) return [];
    return statsData.series.map((item) => ({
      label: item.label,
      visits: item.visits || 0,
      avgTime: item.avgTime ?? 0,
      completion: item.completion ?? 0,
      note: item.note,
    }));
  }, [statsData]);

  const totals = useMemo(() => {
    if (!statsData?.kpis) return { visits: 0, avgTime: 0, completion: 0 };
    return {
      visits: statsData.kpis.totalVisits || 0,
      avgTime: statsData.kpis.averageDurationMinutes ?? 0,
      completion: statsData.kpis.completionRate ?? 0,
    };
  }, [statsData]);

  const isEmpty = !loading && statsData && (!statsData.series || statsData.series.length === 0);

  const datePickerConfig = useMemo(() => {
    if (rangeType === 'month')
      return { showMonthYearPicker: true, dateFormat: 'MM/yyyy' };
    if (rangeType === 'week')
      return { showWeekNumbers: true, dateFormat: "'Tuần' ww, yyyy" };
    return { dateFormat: 'dd/MM/yyyy' };
  }, [rangeType]);

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</p>
          <p className="text-gray-600 mb-4">{error}</p>

          <button
            onClick={() => {
              setError(null);
              setRefreshKey((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">

      {/* ALWAYS SHOW HEADER  */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-50 p-3 text-cyan-600">
            <LineChartIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Thống kê hiệu suất</p>
            <h2 className="text-xl font-semibold text-gray-900">Bác sĩ – Báo cáo ca khám</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-full bg-gray-100 p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRangeType(option.value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  option.value === rangeType
                    ? 'bg-white text-cyan-600 shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 shadow-sm">
            <CalendarDays className="h-5 w-5 text-cyan-600" />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              className="w-32 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
              calendarClassName="rounded-xl border border-gray-200 shadow-lg"
              {...datePickerConfig}
            />
          </div>
        </div>
      </header>

      {/* KPI */}
      {!isEmpty && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[{
            title: 'Tổng số ca khám',
            value: `${totals.visits} ca`,
            subtitle: 'Số ca đã xử lý',
            icon: Stethoscope,
            accent: 'from-cyan-500 to-emerald-500',
          }, {
            title: 'Thời gian khám trung bình',
            value: totals.avgTime > 0 ? `${totals.avgTime} phút/ca` : 'Chưa có dữ liệu',
            subtitle: 'Tính theo dữ liệu thực tế',
            icon: Clock3,
            accent: 'from-amber-400 to-orange-500',
          }, {
            title: 'Tỉ lệ hoàn thành',
            value: formatPercentage(totals.completion),
            subtitle: 'So với lịch khám',
            icon: CheckCircle2,
            accent: 'from-violet-500 to-indigo-500',
          }].map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className={`rounded-full bg-gradient-to-br ${card.accent} p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isEmpty ? (
          <div className="col-span-2 flex flex-col items-center justify-center min-h-[300px] py-10 text-center">
            <Activity className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900">Không có dữ liệu</p>
            <p className="text-gray-600">Không có thống kê cho khoảng thời gian đã chọn.</p>
          </div>
        ) : (
          <>
            {/* BAR CHART */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Số ca khám theo {rangeType === 'day' ? 'giờ' : 'ngày'}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINE CHART */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xu hướng số ca khám
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      {/* TABLE */}
      {!isEmpty && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bảng thống kê theo khung giờ
          </h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Thời gian</th>
                <th className="px-4 py-2 text-left">Số ca</th>
                <th className="px-4 py-2 text-left">% thay đổi</th>
                <th className="px-4 py-2 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.label} className="border-b">
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2">{row.visits}</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">{row.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  );
}
