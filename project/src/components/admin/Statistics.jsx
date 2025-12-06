import React, { useEffect, useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line
} from 'recharts';
import axiosInstance from '../../utils/axiosConfig';
import { 
    FaCalendarCheck, FaUserInjured, FaMoneyBillWave, FaUserMd, 
    FaArrowUp, FaArrowDown, FaChartBar, FaStethoscope, FaCoins, FaFileExcel
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import adminStatisticsApi from '../../api/adminStatisticsApi';

const RANGE_OPTIONS = [
    { label: 'Ngày', value: 'day', en: 'Day' },
    { label: 'Tuần', value: 'week', en: 'Week' },
    { label: 'Tháng', value: 'month', en: 'Month' },
    { label: 'Tùy chỉnh', value: 'custom', en: 'Custom' },
];

const StatisticsPage = () => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const currentLang = i18n.language;

    const [topServices, setTopServices] = useState([]);
    const [statType, setStatType] = useState('appointment'); // 'appointment', 'medical_record', 'revenue'
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
    const [exporting, setExporting] = useState(false);
    
    // Date filter states
    const [rangeType, setRangeType] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());

    // Derived startDate and endDate
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
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (rangeType === 'month') {
            start = new Date(start.getFullYear(), start.getMonth(), 1);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
        } else if (rangeType === 'custom') {
            start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
        }

        const formatDate = (date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
        };

        return {
            startDate: formatDate(start),
            endDate: formatDate(end)
        };
    }, [rangeType, selectedDate, customStartDate, customEndDate]);

    const datePickerConfig = useMemo(() => {
        if (rangeType === 'month')
            return { showMonthYearPicker: true, dateFormat: currentLang === 'vi' ? 'MM/yyyy' : 'MM/yyyy' };
        if (rangeType === 'week')
            return { showWeekNumbers: true, dateFormat: currentLang === 'vi' ? "'Tuần' ww, yyyy" : "'Week' ww, yyyy" };
        return { dateFormat: 'dd/MM/yyyy' };
    }, [rangeType, currentLang]);

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
                if (!token) {
                    console.warn(t('common.noToken'));
                    setLoading(false);
                    return;
                }

                const params = { startDate, endDate };

                let topServicesEndpoint = '/api/admin/dashboard/top-services-by-appointments';
                if (statType === 'medical_record') {
                    topServicesEndpoint = '/api/admin/dashboard/top-services-by-medical-records';
                } else if (statType === 'revenue') {
                    topServicesEndpoint = '/api/admin/dashboard/top-services-by-revenue';
                }

                const [topServicesRes, kpiRes, apptTrendRes, revTrendRes] = await Promise.all([
                    axiosInstance.get(topServicesEndpoint, { params }),
                    axiosInstance.get('/api/admin/dashboard/kpi', { params }),
                    axiosInstance.get('/api/admin/dashboard/trend/appointments', { params }),
                    axiosInstance.get('/api/admin/dashboard/trend/revenue', { params })
                ]);

                const formattedTopServices = topServicesRes.data.map((item) => ({
                    name: item.serviceName,
                    usage: statType === 'revenue' ? item.totalRevenue : item.quantity,
                    price: item.servicePrice,
                    image: item.photoUrl,
                    category: item.serviceCategory,
                    displayValue: statType === 'revenue'
                        ? new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(item.totalRevenue)
                        : `${item.quantity} ${t('common.times', { defaultValue: 'lượt' })}`
                }));

                setTopServices(formattedTopServices);
                setKpi(kpiRes.data);
                setAppointmentTrend(apptTrendRes.data);
                setRevenueTrend(revTrendRes.data);

            } catch (err) {
                console.error(t('common.loadError'), err);
                setError(err.response?.status === 401
                    ? t('common.sessionExpired', { defaultValue: 'Phiên đăng nhập hết hạn' })
                    : t('common.loadError', { defaultValue: 'Không thể tải dữ liệu thống kê' })
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, statType, currentLang, t]);

    // Export Excel function
    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const params = {
                period: rangeType === 'custom' ? undefined : (rangeType === 'day' ? 'day' : rangeType === 'week' ? 'week' : 'month'),
                date: rangeType === 'custom' ? undefined : startDate,
                startDate: rangeType === 'custom' ? startDate : undefined,
                endDate: rangeType === 'custom' ? endDate : undefined,
            };

            // Remove undefined values
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

            const blob = await adminStatisticsApi.exportStatisticsToExcel(params);

            // Tạo URL từ blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Tạo tên file dựa trên khoảng thời gian
            let fileName = 'ThongKe.xlsx';
            if (rangeType === 'custom') {
                fileName = `ThongKe_${startDate}_${endDate}.xlsx`;
            } else if (rangeType === 'day') {
                fileName = `ThongKe_Ngay_${startDate.replace(/-/g, '')}.xlsx`;
            } else if (rangeType === 'week') {
                fileName = `ThongKe_Tuan_${startDate.replace(/-/g, '')}.xlsx`;
            } else if (rangeType === 'month') {
                fileName = `ThongKe_Thang_${startDate.substring(0, 7).replace(/-/g, '')}.xlsx`;
            }

            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Giải phóng URL
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success(t('statistics.exportSuccess', { defaultValue: 'Xuất file Excel thành công!' }));
        } catch (error) {
            console.error('Lỗi khi xuất file Excel:', error);
            const errorMessage = error.response?.data?.message || error.message || 
                t('statistics.exportError', { defaultValue: 'Không thể xuất file Excel. Vui lòng thử lại.' });
            toast.error(errorMessage);
        } finally {
            setExporting(false);
        }
    };

    // Refresh khi có thanh toán thành công
    useEffect(() => {
        const handlePaymentCompleted = () => {
            setLoading(true);
            setTimeout(() => setLoading(false), 100);
        };
        window.addEventListener('paymentCompleted', handlePaymentCompleted);
        return () => window.removeEventListener('paymentCompleted', handlePaymentCompleted);
    }, [startDate, endDate, statType]);

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className={`p-6 text-center ${theme === 'dark' ? 'text-red-400 bg-red-900/30 border-red-800' : 'text-red-500 bg-red-50 border-red-200'} rounded-lg border mt-10 mx-10`}>
            <p className="font-bold text-lg mb-2">⚠️ {t('common.error')}</p>
            <p>{error}</p>
        </div>
    );

    const StatCard = ({ title, value, subValue, growth, icon: Icon, color, bgColor, isReverse = false }) => {
        const isPositive = growth >= 0;
        const isGood = isReverse ? !isPositive : isPositive;

        return (
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-xl shadow-sm border flex items-center justify-between transition-colors duration-300`}>
                <div>
                    <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                    <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
                    <div className="flex items-center mt-2">
                        <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isGood ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {isPositive ? <FaArrowUp size={10} className="mr-1"/> : <FaArrowDown size={10} className="mr-1"/>}
                            {Math.abs(growth).toFixed(1)}%
                        </span>
                        <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                            {t('common.vsPrevious', { defaultValue: 'vs kỳ trước' })}
                        </span>
                    </div>
                </div>
                <div className={`p-4 rounded-full ${bgColor} ${color}`}>
                    <Icon size={24} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <header className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-4 shadow-sm transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <div className={`rounded-full p-3 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <FaChartBar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('adminSidebar.statistics', { defaultValue: 'Thống kê' })}
                        </p>
                        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {t('statistics.overview', { defaultValue: 'Thống kê tổng quan' })}
                        </h2>
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
                                        ? `${theme === 'dark' ? 'bg-gray-600 text-blue-300' : 'bg-white text-blue-600'} shadow`
                                        : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                                }`}
                            >
                                {currentLang === 'vi' ? option.label : option.en}
                            </button>
                        ))}
                    </div>

                    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        {rangeType === 'custom' ? (
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selected={customStartDate}
                                    onChange={(date) => date && setCustomStartDate(date)}
                                    className={`w-24 bg-transparent text-sm font-semibold focus:outline-none text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText={t('common.fromDate', { defaultValue: 'Từ ngày' })}
                                />
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                                <DatePicker
                                    selected={customEndDate}
                                    onChange={(date) => date && setCustomEndDate(date)}
                                    className={`w-24 bg-transparent text-sm font-semibold focus:outline-none text-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText={t('common.toDate', { defaultValue: 'Đến ngày' })}
                                    minDate={customStartDate}
                                />
                            </div>
                        ) : (
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                className={`w-32 bg-transparent text-sm font-semibold focus:outline-none ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                                calendarClassName={`rounded-xl border shadow-lg ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white'}`}
                                {...datePickerConfig}
                            />
                        )}
                    </div>

                    {/* Export Excel Button */}
                    <button
                        onClick={handleExportExcel}
                        disabled={exporting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all shadow-sm ${
                            exporting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 active:scale-95'
                        }`}
                        title={t('statistics.exportExcel', { defaultValue: 'Xuất file Excel' })}
                    >
                        <FaFileExcel className="h-5 w-5" />
                        <span className="hidden sm:inline">
                            {exporting 
                                ? t('statistics.exporting', { defaultValue: 'Đang xuất...' })
                                : t('statistics.export', { defaultValue: 'Xuất Excel' })
                            }
                        </span>
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <StatCard 
                    title={t('statistics.todayAppointments', { defaultValue: 'Lịch Hẹn Hôm Nay' })} 
                    value={kpi.totalAppointmentsToday} 
                    growth={kpi.appointmentsGrowth}
                    icon={FaCalendarCheck} 
                    color="text-blue-600" 
                    bgColor={theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} 
                />
                <StatCard 
                    title={t('statistics.newRecords', { defaultValue: 'Hồ Sơ Bệnh Án Mới' })} 
                    value={kpi.totalPatientsToday} 
                    growth={kpi.patientsGrowth}
                    icon={FaUserInjured} 
                    color="text-green-600" 
                    bgColor={theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} 
                />
                <StatCard 
                    title={t('statistics.monthRevenue', { defaultValue: 'Doanh Thu Tháng' })} 
                    value={new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(kpi.totalRevenueMonth)} 
                    growth={kpi.revenueGrowth}
                    icon={FaMoneyBillWave} 
                    color="text-yellow-600" 
                    bgColor={theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'} 
                />
                <StatCard 
                    title={t('statistics.cancelRate', { defaultValue: 'Tỷ Lệ Hủy Lịch' })} 
                    value={`${kpi.cancelRate.toFixed(1)}%`} 
                    growth={kpi.cancelRateGrowth}
                    icon={FaUserMd} 
                    color="text-red-600" 
                    bgColor={theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}
                    isReverse={true}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} transition-colors duration-300`}>
                    <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('statistics.appointmentTrend', { defaultValue: 'Xu Hướng Lịch Hẹn (7 Ngày)' })}
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={appointmentTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                <YAxis tick={{fontSize: 12}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                                        color: theme === 'dark' ? 'white' : '#1f2937'
                                    }} 
                                />
                                <Line type="monotone" dataKey="value" name={t('common.appointments', { defaultValue: 'Lịch hẹn' })} stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} transition-colors duration-300`}>
                    <h2 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('statistics.revenueTrend', { defaultValue: 'Xu Hướng Doanh Thu (7 Ngày)' })}
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                <YAxis 
                                    tick={{fontSize: 12}} 
                                    stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                                    tickFormatter={(v) => new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { notation: "compact" }).format(v)} 
                                />
                                <Tooltip 
                                    formatter={(v) => new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(v)}
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                                        color: theme === 'dark' ? 'white' : '#1f2937'
                                    }}
                                />
                                <Bar dataKey="value" name={t('common.revenue', { defaultValue: 'Doanh thu' })} fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Services */}
            <div className={`p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} mt-6 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        {t('statistics.topServices', { defaultValue: 'Top 5 Dịch Vụ Phổ Biến' })}
                    </h2>
                    
                    <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <button onClick={() => setStatType('appointment')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'appointment' ? `${theme === 'dark' ? 'bg-gray-600 text-blue-300' : 'bg-white text-blue-600'} shadow-sm` : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}>
                            <FaCalendarCheck /> {t('statistics.byAppointment', { defaultValue: 'Đặt lịch' })}
                        </button>
                        <button onClick={() => setStatType('medical_record')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'medical_record' ? `${theme === 'dark' ? 'bg-gray-600 text-green-300' : 'bg-white text-green-600'} shadow-sm` : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}>
                            <FaStethoscope /> {t('statistics.byExamination', { defaultValue: 'Khám thật' })}
                        </button>
                        <button onClick={() => setStatType('revenue')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'revenue' ? `${theme === 'dark' ? 'bg-gray-600 text-yellow-300' : 'bg-white text-yellow-600'} shadow-sm` : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}>
                            <FaCoins /> {t('statistics.byRevenue', { defaultValue: 'Doanh thu' })}
                        </button>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topServices} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={180} 
                                tick={{
                                    fontSize: 12, 
                                    fill: theme === 'dark' ? '#d1d5db' : '#4B5563', 
                                    fontWeight: 500
                                }} 
                            />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
                                    color: theme === 'dark' ? 'white' : '#1f2937'
                                }}
                                formatter={(value, name, props) => [props.payload.displayValue, statType === 'revenue' ? t('common.revenue') : t('common.quantity')]}
                            />
                            <Bar dataKey="usage" radius={[0, 4, 4, 0]} barSize={32}>
                                {topServices.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;