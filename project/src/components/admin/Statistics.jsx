// src/pages/admin/StatisticsPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import axios from 'axios';
import { FaCalendarCheck, FaUserInjured, FaMoneyBillWave, FaUserMd, FaArrowUp, FaArrowDown, FaCoins, FaStethoscope, FaChartBar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatisticsPage = () => {
  const { t } = useTranslation();

  // State
  const [topServices, setTopServices] = useState([]);
  const [statType, setStatType] = useState('appointment'); // appointment | medical_record | revenue
  const [kpi, setKpi] = useState({
    totalAppointmentsToday: 0,
    appointmentsGrowth: 0,
    totalPatientsToday: 0,
    patientsGrowth: 0,
    totalRevenueMonth: 0,
    revenueGrowth: 0,
    cancelRate: 0,
    cancelRateGrowth: 0
  });
  const [appointmentTrend, setAppointmentTrend] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter
  const [rangeType, setRangeType] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());

  // Calculate startDate & endDate
  const { startDate, endDate } = useMemo(() => {
    let start = new Date(selectedDate);
    let end = new Date(selectedDate);

    if (rangeType === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (rangeType === 'month') {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (rangeType === 'custom') {
      start = new Date(customStartDate);
      end = new Date(customEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    const format = (d) => d.toISOString().split('T')[0];
    return { startDate: format(start), endDate: format(end) };
  }, [rangeType, selectedDate, customStartDate, customEndDate]);

  const datePickerConfig = useMemo(() => {
    if (rangeType === 'month') return { showMonthYearPicker: true, dateFormat: 'MM/yyyy' };
    if (rangeType === 'week') return { showWeekNumbers: true, dateFormat: "'Week' ww, yyyy" };
    return { dateFormat: 'dd/MM/yyyy' };
  }, [rangeType]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (!token) throw new Error('No token');

        const headers = { Authorization: `Bearer ${token}` };
        const params = { startDate, endDate };

        const topUrl = statType === 'revenue'
          ? 'http://localhost:8082/api/admin/dashboard/top-services-by-revenue'
          : statType === 'medical_record'
            ? 'http://localhost:8082/api/admin/dashboard/top-services-by-medical-records'
            : 'http://localhost:8082/api/admin/dashboard/top-services-by-appointments';

        const [topRes, kpiRes, apptRes, revRes] = await Promise.all([
          axios.get(topUrl, { headers, params }),
          axios.get('http://localhost:8082/api/admin/dashboard/kpi', { headers, params }),
          axios.get('http://localhost:8082/api/admin/dashboard/trend/appointments', { headers, params }),
          axios.get('http://localhost:8082/api/admin/dashboard/trend/revenue', { headers, params })
        ]);

        const formatted = topRes.data.map(item => ({
          name: item.serviceName || 'Unknown',
          usage: statType === 'revenue' ? item.totalRevenue : item.quantity,
          displayValue: statType === 'revenue'
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue)
            : `${item.quantity} ${t('admin.statistics.times')}`
        }));

        setTopServices(formatted);
        setKpi(kpiRes.data || {});
        setAppointmentTrend(apptRes.data || []);
        setRevenueTrend(revRes.data || []);
      } catch (err) {
        console.error(err);
        setError(t('admin.statistics.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, statType, t]);

  // Refresh on payment
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener('paymentCompleted', handler);
    return () => window.removeEventListener('paymentCompleted', handler);
  }, [startDate, endDate, statType]);

  // Loading & Error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-2xl font-bold text-red-600">{t('admin.statistics.errors.title')}</p>
        <p className="text-red-500 mt-4">{error}</p>
      </div>
    );
  }

  const StatCard = ({ title, value, growth, icon: Icon, color, bg }) => {
    const positive = growth >= 0;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {positive ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(growth).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">{t('admin.statistics.comparedToPrevious')}</span>
            </div>
          </div>
          <div className={`p-4 rounded-full ${bg}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartBar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500">{t('admin.statistics.reportSummary')}</p>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.statistics.pageTitle')}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-100 rounded-full p-1">
              {['day', 'week', 'month', 'custom'].map((v) => (
                <button
                  key={v}
                  onClick={() => setRangeType(v)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${rangeType === v ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                  {t(`admin.statistics.range.${v}`)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-white border rounded-full px-4 py-3 shadow-sm">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              {rangeType === 'custom' ? (
                <div className="flex items-center gap-3 text-sm">
                  <DatePicker selected={customStartDate} onChange={setCustomStartDate} dateFormat="dd/MM/yyyy" className="font-medium" />
                  <span>→</span>
                  <DatePicker selected={customEndDate} onChange={setCustomEndDate} minDate={customStartDate} dateFormat="dd/MM/yyyy" className="font-medium" />
                </div>
              ) : (
                <DatePicker selected={selectedDate} onChange={setSelectedDate} {...datePickerConfig} className="font-bold text-gray-800 bg-transparent" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('admin.statistics.kpi.appointmentsToday')} value={kpi.totalAppointmentsToday || 0} growth={kpi.appointmentsGrowth || 0} icon={FaCalendarCheck} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title={t('admin.statistics.kpi.newRecords')} value={kpi.totalPatientsToday || 0} growth={kpi.patientsGrowth || 0} icon={FaUserInjured} color="text-green-600" bg="bg-green-100" />
        <StatCard title={t('admin.statistics.kpi.monthlyRevenue')} value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpi.totalRevenueMonth || 0)} growth={kpi.revenueGrowth || 0} icon={FaMoneyBillWave} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard title={t('admin.statistics.kpi.cancelRate')} value={`${(kpi.cancelRate || 0).toFixed(1)}%`} growth={kpi.cancelRateGrowth || 0} icon={FaUserMd} color="text-red-600" bg="bg-red-100" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">{t('admin.statistics.charts.appointmentTrend')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4">{t('admin.statistics.charts.revenueTrend')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => `${v / 1e6}M`} />
              <Tooltip formatter={(v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)} />
              <Bar dataKey="value" fill="#F59E0B" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('admin.statistics.topServices.title')}</h2>
          <div className="flex bg-gray-100 rounded-full p-1">
            <button onClick={() => setStatType('appointment')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statType === 'appointment' ? 'bg-white shadow text-blue-600' : ''}`}>
              <FaCalendarCheck /> {t('admin.statistics.topServices.byAppointment')}
            </button>
            <button onClick={() => setStatType('medical_record')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statType === 'medical_record' ? 'bg-white shadow text-green-600' : ''}`}>
              <FaStethoscope /> {t('admin.statistics.topServices.byExamination')}
            </button>
            <button onClick={() => setStatType('revenue')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statType === 'revenue' ? 'bg-white shadow text-yellow-600' : ''}`}>
              <FaCoins /> {t('admin.statistics.topServices.byRevenue')}
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart layout="vertical" data={topServices}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={220} tick={{ fontSize: 14 }} />
            <Tooltip formatter={(v, n, p) => p.payload.displayValue} />
            <Bar dataKey="usage" radius={8}>
              {topServices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsPage;