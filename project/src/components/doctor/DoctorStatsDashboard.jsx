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
  const [refreshKey, setRefreshKey] = useState(0); // Key để force refresh
  const [isForceRefresh, setIsForceRefresh] = useState(false); // Flag để bypass cache

  // Lấy doctorId từ userInfo (BE expect UUID format)
  const doctorId = useMemo(() => {
    const userInfo = authService.getUserInfo();
    // Ưu tiên userId (UUID), sau đó id, cuối cùng doctorId
    const id = userInfo?.userId || userInfo?.id || userInfo?.doctorId;
    // Đảm bảo là string (UUID format)
    return id ? String(id) : null;
  }, []);

  // Role validation - chỉ bác sĩ mới được xem
  useEffect(() => {
    const roles = authService.getRoles();
    const isDoctor = roles.includes('ROLE_BAC_SI') || roles.includes('ROLE_ADMIN');
    if (!isDoctor) {
      setError('Bạn không có quyền xem thống kê. Chỉ bác sĩ mới được phép.');
      setLoading(false);
    }
  }, []);

  // Fetch data từ API
  useEffect(() => {
    if (!doctorId) {
      setError('Không tìm thấy thông tin bác sĩ');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      // Validate range
      if (!['day', 'week', 'month'].includes(rangeType)) {
        setError('Range không hợp lệ. Phải là: day, week, hoặc month');
        setLoading(false);
        return;
      }
      
      // Validate date format (selectedDate should be a valid Date object)
      if (selectedDate && !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
        setError('Ngày không hợp lệ');
        setLoading(false);
        return;
      }
      
      try {
        const data = await getDoctorStats(doctorId, rangeType, selectedDate, isForceRefresh);
        setStatsData(data);
        // Reset force refresh flag sau khi fetch xong
        if (isForceRefresh) {
          setIsForceRefresh(false);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        const status = err.response?.status;
        const message = err.response?.data?.message || 'Không thể tải dữ liệu thống kê';
        
        // Xử lý các error codes khác nhau
        if (status === 401) {
          // Unauthorized - Token không hợp lệ hoặc hết hạn
          setError('Bạn cần đăng nhập để xem thống kê');
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            authService.logout();
            window.location.href = '/login';
          }, 2000);
        } else if (status === 403) {
          // Forbidden - Không có quyền
          if (message.includes('bác sĩ khác')) {
            setError('Bạn chỉ có thể xem thống kê của chính mình.');
          } else {
            setError('Bạn không có quyền xem thống kê. Chỉ bác sĩ mới được phép.');
          }
          toast.error(message);
        } else if (status === 400) {
          // Bad Request - Tham số không hợp lệ
          setError(`Tham số không hợp lệ: ${message}`);
          toast.error(message);
        } else if (status === 500) {
          // Server Error
          setError('Lỗi máy chủ. Vui lòng thử lại sau.');
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
        } else {
          // Other errors
          setError(message);
          toast.error(message);
        }
        
        if (isForceRefresh) {
          setIsForceRefresh(false);
        }
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
      // BE có thể trả về null cho avgTime và completion
      avgTime: item.avgTime ?? 0,
      completion: item.completion ?? 0,
      note: item.note,
    }));
  }, [statsData]);

  const totals = useMemo(() => {
    if (!statsData?.kpis) {
      return { visits: 0, avgTime: 0, completion: 0 };
    }

    return {
      visits: statsData.kpis.totalVisits || 0,
      // BE có thể trả về null cho averageDurationMinutes và completionRate
      avgTime: statsData.kpis.averageDurationMinutes ?? 0,
      completion: statsData.kpis.completionRate ?? 0,
    };
  }, [statsData]);

  const kpiCards = [
    {
      title: 'Tổng số ca khám',
      value: `${totals.visits} ca`,
      subtitle: 'Số ca đã xử lý',
      icon: Stethoscope,
      accent: 'from-cyan-500 to-emerald-500',
    },
    {
      title: 'Thời gian khám trung bình',
      value: totals.avgTime > 0 ? `${totals.avgTime} phút/ca` : 'Chưa có dữ liệu',
      subtitle: 'Tính theo dữ liệu thực tế',
      icon: Clock3,
      accent: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Tỉ lệ hoàn thành',
      value: formatPercentage(totals.completion),
      subtitle: 'So với lịch khám',
      icon: CheckCircle2,
      accent: 'from-violet-500 to-indigo-500',
    },
  ];

  const datePickerConfig = useMemo(() => {
    if (rangeType === 'month') {
      return {
        showMonthYearPicker: true,
        dateFormat: 'MM/yyyy',
      };
    }

    if (rangeType === 'week') {
      return {
        showWeekNumbers: true,
        dateFormat: "'Tuần' ww, yyyy",
      };
    }

    return {
      dateFormat: 'dd/MM/yyyy',
    };
  }, [rangeType]);

  const tableData = useMemo(
    () =>
      chartData.map((item, index) => ({
        id: `${rangeType}-${index}`,
        time: item.label,
        visits: item.visits,
        note: item.note ?? (item.visits > totals.visits / chartData.length ? 'Ổn định' : 'Cần cải thiện'),
        change:
          index === 0
            ? '—'
            : `${item.visits >= chartData[index - 1].visits ? '+' : '-'}${Math.abs(
                item.visits - chartData[index - 1].visits,
              )}`,
      })),
    [chartData, rangeType, totals.visits],
  );

  const totalItems = statsData?.totalItems || tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return tableData.slice(startIndex, startIndex + rowsPerPage);
  }, [tableData, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rangeType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    const isAuthError = error.includes('đăng nhập') || error.includes('quyền');
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</p>
          <p className="text-gray-600 mb-4">{error}</p>
          {!isAuthError && (
            <button
              onClick={() => {
                setError(null);
                setRefreshKey((prev) => prev + 1);
              }}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Thử lại
            </button>
          )}
        </div>
      </section>
    );
  }

  // Empty state - không có dữ liệu
  if (!loading && statsData && (!statsData.series || statsData.series.length === 0)) {
    return (
      <section className="space-y-8">
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
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">Không có dữ liệu</p>
            <p className="text-gray-600">
              Không có dữ liệu thống kê cho khoảng thời gian đã chọn.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Biểu đồ cột</p>
              <h3 className="text-lg font-semibold text-gray-900">
                Số ca khám theo {rangeType === 'day' ? 'giờ' : 'ngày'}
              </h3>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb' }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value) => [`${value} ca`, 'Số ca']}
                />
                <Bar dataKey="visits" fill="url(#visitsGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Biểu đồ đường</p>
              <h3 className="text-lg font-semibold text-gray-900">Xu hướng số ca khám</h3>
            </div>
            <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {rangeType === 'day' ? '7 khung giờ' : rangeType === 'week' ? '7 ngày' : '30 ngày'}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: '#e5e7eb' }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(value) => [`${value} ca`, 'Số ca']}
                />
                <Line
                  type="monotone"
                  dataKey="visits"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ stroke: '#0ea5e9', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-600" />
          <div>
            <p className="text-sm font-medium text-gray-500">Phân tích chi tiết</p>
            <h3 className="text-lg font-semibold text-gray-900">Bảng thống kê theo khung giờ</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Thời gian</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Số ca</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">% tăng/giảm</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.time}</td>
                  <td className="px-4 py-3 text-gray-700">{row.visits} ca</td>
                  <td className="px-4 py-3 text-gray-700">{row.change}</td>
                  <td className="px-4 py-3 text-gray-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 pt-4">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &laquo;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &lsaquo;
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md'
                        : 'border border-gray-200 text-gray-600 hover:border-cyan-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &rsaquo;
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

