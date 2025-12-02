import React, { useEffect, useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line
} from 'recharts';
import axios from 'axios';
import { 
    FaCalendarCheck, FaUserInjured, FaMoneyBillWave, FaUserMd, 
    FaArrowUp, FaArrowDown, FaCalendar, FaChartBar, FaStethoscope, FaCoins 
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RANGE_OPTIONS = [
    { label: 'Ngày', value: 'day', en: 'Day' },
    { label: 'Tuần', value: 'week', en: 'Week' },
    { label: 'Tháng', value: 'month', en: 'Month' },
    { label: 'Tùy chỉnh', value: 'custom', en: 'Custom' },
];

const StatisticsPage = () => {
    const { t, i18n } = useTranslation();
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
                    console.warn("Không tìm thấy Token. Đang hiển thị dữ liệu mẫu.");
                    setLoading(false);
                    return;
                }

                const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
                const params = { startDate, endDate };

                let topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-appointments';
                if (statType === 'medical_record') {
                    topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-medical-records';
                } else if (statType === 'revenue') {
                    topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-revenue';
                }

                const [topServicesRes, kpiRes, apptTrendRes, revTrendRes] = await Promise.all([
                    axios.get(topServicesUrl, { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/kpi', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/appointments', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/revenue', { headers, params })
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
                console.error("Lỗi tải thống kê:", err);
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

    // Refresh khi có thanh toán thành công
    useEffect(() => {
        const handlePaymentCompleted = () => {
            setLoading(true);
            // Trigger re-fetch bằng cách gọi lại logic trong useEffect trên
            setTimeout(() => setLoading(false), 100); // hoặc gọi lại fetchData trực tiếp
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
        <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 mt-10 mx-10">
            <p className="font-bold text-lg mb-2">Error</p>
            <p>{error}</p>
        </div>
    );

    const StatCard = ({ title, value, subValue, growth, icon: Icon, color, bgColor, isReverse = false }) => {
        const isPositive = growth >= 0;
        const isGood = isReverse ? !isPositive : isPositive;

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                    <div className="flex items-center mt-2">
                        <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isPositive ? <FaArrowUp size={10} className="mr-1"/> : <FaArrowDown size={10} className="mr-1"/>}
                            {Math.abs(growth).toFixed(1)}%
                        </span>
                        <span className="text-gray-400 text-xs ml-2">
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
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                        <FaChartBar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('adminSidebar.statistics', { defaultValue: 'Thống kê' })}</p>
                        <h2 className="text-xl font-semibold text-gray-900">{t('statistics.overview', { defaultValue: 'Thống kê tổng quan' })}</h2>
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
                                        ? 'bg-white text-blue-600 shadow'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {currentLang === 'vi' ? option.label : option.en}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 shadow-sm">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        {rangeType === 'custom' ? (
                            <div className="flex items-center gap-2">
                                <DatePicker
                                    selected={customStartDate}
                                    onChange={(date) => date && setCustomStartDate(date)}
                                    className="w-24 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none text-center"
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText={t('common.fromDate', { defaultValue: 'Từ ngày' })}
                                />
                                <span className="text-gray-400">-</span>
                                <DatePicker
                                    selected={customEndDate}
                                    onChange={(date) => date && setCustomEndDate(date)}
                                    className="w-24 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none text-center"
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText={t('common.toDate', { defaultValue: 'Đến ngày' })}
                                    minDate={customStartDate}
                                />
                            </div>
                        ) : (
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                className="w-32 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none"
                                calendarClassName="rounded-xl border border-gray-200 shadow-lg"
                                {...datePickerConfig}
                            />
                        )}
                    </div>
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
                    bgColor="bg-blue-50" 
                />
                <StatCard 
                    title={t('statistics.newRecords', { defaultValue: 'Hồ Sơ Bệnh Án Mới' })} 
                    value={kpi.totalPatientsToday} 
                    growth={kpi.patientsGrowth}
                    icon={FaUserInjured} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                />
                <StatCard 
                    title={t('statistics.monthRevenue', { defaultValue: 'Doanh Thu Tháng' })} 
                    value={new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(kpi.totalRevenueMonth)} 
                    growth={kpi.revenueGrowth}
                    icon={FaMoneyBillWave} 
                    color="text-yellow-600" 
                    bgColor="bg-yellow-50" 
                />
                <StatCard 
                    title={t('statistics.cancelRate', { defaultValue: 'Tỷ Lệ Hủy Lịch' })} 
                    value={`${kpi.cancelRate.toFixed(1)}%`} 
                    growth={kpi.cancelRateGrowth}
                    icon={FaUserMd} 
                    color="text-red-600" 
                    bgColor="bg-red-50"
                    isReverse={true}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-6">
                        {t('statistics.appointmentTrend', { defaultValue: 'Xu Hướng Lịch Hẹn (7 Ngày)' })}
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={appointmentTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" name={t('common.appointments', { defaultValue: 'Lịch hẹn' })} stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-6">
                        {t('statistics.revenueTrend', { defaultValue: 'Xu Hướng Doanh Thu (7 Ngày)' })}
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{fontSize: 12}} />
                                <YAxis tick={{fontSize: 12}} tickFormatter={(v) => new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { notation: "compact" }).format(v)} />
                                <Tooltip 
                                    formatter={(v) => new Intl.NumberFormat(currentLang === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND' }).format(v)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name={t('common.revenue', { defaultValue: 'Doanh thu' })} fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Services */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {t('statistics.topServices', { defaultValue: 'Top 5 Dịch Vụ Phổ Biến' })}
                    </h2>
                    
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatType('appointment')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'appointment' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FaCalendarCheck /> {t('statistics.byAppointment', { defaultValue: 'Đặt lịch' })}
                        </button>
                        <button onClick={() => setStatType('medical_record')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'medical_record' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FaStethoscope /> {t('statistics.byExamination', { defaultValue: 'Khám thật' })}
                        </button>
                        <button onClick={() => setStatType('revenue')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${statType === 'revenue' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                            <FaCoins /> {t('statistics.byRevenue', { defaultValue: 'Doanh thu' })}
                        </button>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topServices} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={180} tick={{fontSize: 12, fill: '#4B5563', fontWeight: 500}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '8px', border: 'none seeding', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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