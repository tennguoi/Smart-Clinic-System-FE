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
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const RANGE_OPTIONS = [
  { label: 'day', value: 'day' },
  { label: 'week', value: 'week' },
  { label: 'month', value: 'month' },
];

const formatPercentage = (value) => {
  if (value == null || value === 0) return 'N/A';
  return `${Math.round(value * 100)}%`;
};

export default function DoctorStatsDashboard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [rangeType, setRangeType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
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
      setError(t('doctorStats.error.noPermission'));
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!doctorId) {
      setError(t('doctorStats.error.noDoctorInfo'));
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
        const message = err.response?.data?.message || t('doctorStats.error.loadFailed');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [doctorId, rangeType, selectedDate, refreshKey, isForceRefresh, t]);

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
          <p className={`text-gray-600 ${theme === 'dark' ? 'text-gray-400' : ''}`}>{t('doctorStats.loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorStats.error.title')}</p>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setRefreshKey((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            {t('doctorStats.error.retry')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-3 ${theme === 'dark' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
            <LineChartIcon className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('doctorStats.header.subtitle')}</p>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorStats.header.title')}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex rounded-full p-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRangeType(option.value)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  option.value === rangeType
                    ? (theme === 'dark' ? 'bg-gray-600 text-cyan-400 shadow' : 'bg-white text-cyan-600 shadow')
                    : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                {t(`doctorStats.range.${option.label}`)}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
            <CalendarDays className={`h-5 w-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              className={`w-32 bg-transparent text-sm font-semibold focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
              calendarClassName={`rounded-xl border shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}
              {...datePickerConfig}
            />
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      {!isEmpty && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: t('doctorStats.kpi.totalVisits.title'),
              value: `${totals.visits} ${t('doctorStats.kpi.totalVisits.unit')}`,
              subtitle: t('doctorStats.kpi.totalVisits.subtitle'),
              icon: Stethoscope,
              accent: 'from-cyan-500 to-emerald-500',
            },
            {
              title: t('doctorStats.kpi.avgTime.title'),
              value: totals.avgTime > 0 ? `${totals.avgTime} ${t('doctorStats.kpi.avgTime.unit')}` : t('doctorStats.kpi.avgTime.noData'),
              subtitle: t('doctorStats.kpi.avgTime.subtitle'),
              icon: Clock3,
              accent: 'from-amber-400 to-orange-500',
            },
            {
              title: t('doctorStats.kpi.completionRate.title'),
              value: formatPercentage(totals.completion),
              subtitle: t('doctorStats.kpi.completionRate.subtitle'),
              icon: CheckCircle2,
              accent: 'from-violet-500 to-indigo-500',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className={`rounded-2xl border p-5 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{card.title}</p>
                    <p className={`mt-2 text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{card.subtitle}</p>
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isEmpty ? (
          <div className="col-span-2 flex flex-col items-center justify-center min-h-[300px] py-10 text-center">
            <Activity className="h-16 w-16 text-gray-300 mb-4" />
            <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('doctorStats.empty.title')}</p>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{t('doctorStats.empty.message')}</p>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {rangeType === 'day' 
                  ? t('doctorStats.chart.visitsByHour')
                  : t('doctorStats.chart.visitsByDay')
                }
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#fff' : '#000'
                      }} 
                    />
                    <Bar dataKey="visits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('doctorStats.chart.trend')}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        color: theme === 'dark' ? '#fff' : '#000'
                      }}
                    />
                    <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      {!isEmpty && (
        <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('doctorStats.table.title')}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}>
                <tr>
                  <th className="px-4 py-2 text-left">{t('doctorStats.table.time')}</th>
                  <th className="px-4 py-2 text-left">{t('doctorStats.table.visits')}</th>
                  <th className="px-4 py-2 text-left">{t('doctorStats.table.change')}</th>
                  <th className="px-4 py-2 text-left">{t('doctorStats.table.note')}</th>
                </tr>
              </thead>
              <tbody className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {chartData.map((row) => (
                  <tr key={row.label} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="px-4 py-2">{row.label}</td>
                    <td className="px-4 py-2">{row.visits}</td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2">{row.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}