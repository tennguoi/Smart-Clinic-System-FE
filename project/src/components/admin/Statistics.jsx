import React, { useEffect, useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line
} from 'recharts';
import axios from 'axios';
import { FaCalendarCheck, FaUserInjured, FaMoneyBillWave, FaUserMd, FaArrowUp, FaArrowDown, FaCalendar, FaChartBar, FaStethoscope, FaCoins } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';

const RANGE_OPTIONS = [
    { label: 'Ngày', value: 'day' },
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

const StatisticsPage = () => {
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
    
    // Date filter states (New Logic to match DoctorStatsDashboard)
    const [rangeType, setRangeType] = useState('month'); // Default to month for better overview
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Custom range state
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());

    // Derived startDate and endDate based on rangeType and selectedDate
    const { startDate, endDate } = useMemo(() => {
        let start = new Date(selectedDate);
        let end = new Date(selectedDate);

        if (rangeType === 'day') {
            // Start and end are the same day
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (rangeType === 'week') {
            // Calculate start of week (Monday) and end of week (Sunday)
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (rangeType === 'month') {
            // Start of month and end of month
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            
            end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0); // Last day of previous month (which is current month since we added 1)
            end.setHours(23, 59, 59, 999);
        } else if (rangeType === 'custom') {
            start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            
            end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
        }

        // Format to YYYY-MM-DD for API
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
          return { showMonthYearPicker: true, dateFormat: 'MM/yyyy' };
        if (rangeType === 'week')
          return { showWeekNumbers: true, dateFormat: "'Tuần' ww, yyyy" };
        return { dateFormat: 'dd/MM/yyyy' };
    }, [rangeType]);

    // Bảng màu cho biểu đồ
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kiểm tra token
                const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 

                if (!token) {
                    console.warn("Không tìm thấy Token. Đang hiển thị dữ liệu mẫu (Demo Mode).");
                    setLoading(false);
                    return;
                }

                const headers = { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Gọi API song song với date filter
                const params = { startDate, endDate };
                
                // Determine which Top Services API to call
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

                // Map dữ liệu Top Services
                const formattedTopServices = topServicesRes.data.map((item) => ({
                    name: item.serviceName,       
                    usage: statType === 'revenue' ? item.totalRevenue : item.quantity,        
                    price: item.servicePrice,     
                    image: item.photoUrl,
                    category: item.serviceCategory,
                    displayValue: statType === 'revenue' 
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue)
                        : `${item.quantity} lượt`
                }));

                setTopServices(formattedTopServices);
                setKpi(kpiRes.data);
                setAppointmentTrend(apptTrendRes.data);
                setRevenueTrend(revTrendRes.data);

            } catch (err) {
                console.error("Lỗi tải thống kê:", err);
                if (err.response && err.response.status === 401) {
                     setError("Phiên đăng nhập hết hạn hoặc không có quyền truy cập.");
                } else {
                    setError("Không thể tải dữ liệu thống kê.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate, statType]);

    // Listen for payment completion events and refresh data
    useEffect(() => {
        const handlePaymentCompleted = (event) => {
            console.log('Payment completed event received:', event.detail);
            // Refresh the statistics data
            setLoading(true);
            
            // Trigger a re-fetch by updating the dependency
            // This will cause the fetchData useEffect to run again
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (token) {
                const headers = { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                const params = { startDate, endDate };
                
                let topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-appointments';
                if (statType === 'medical_record') {
                    topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-medical-records';
                } else if (statType === 'revenue') {
                    topServicesUrl = 'http://localhost:8082/api/admin/dashboard/top-services-by-revenue';
                }

                Promise.all([
                    axios.get(topServicesUrl, { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/kpi', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/appointments', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/revenue', { headers, params })
                ]).then(([topServicesRes, kpiRes, apptTrendRes, revTrendRes]) => {
                    const formattedTopServices = topServicesRes.data.map((item) => ({
                        name: item.serviceName,       
                        usage: statType === 'revenue' ? item.totalRevenue : item.quantity,        
                        price: item.servicePrice,     
                        image: item.photoUrl,
                        category: item.serviceCategory,
                        displayValue: statType === 'revenue' 
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalRevenue)
                            : `${item.quantity} lượt`
                    }));

                    setTopServices(formattedTopServices);
                    setKpi(kpiRes.data);
                    setAppointmentTrend(apptTrendRes.data);
                    setRevenueTrend(revTrendRes.data);
                    setLoading(false);
                }).catch(err => {
                    console.error("Lỗi tải lại thống kê:", err);
                    setLoading(false);
                });
            }
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
            <p className="font-bold text-lg mb-2">⚠️ Đã xảy ra lỗi</p>
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
                        <span className="text-gray-400 text-xs ml-2">vs kỳ trước</span>
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
        {/* Header - Giống DoctorStatsDashboard */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                    <FaChartBar className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Báo cáo tổng hợp</p>
                    <h2 className="text-xl font-semibold text-gray-900">Thống kê tổng quan</h2>
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
                            {option.label}
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
                                placeholderText="Từ ngày"
                            />
                            <span className="text-gray-400">-</span>
                            <DatePicker
                                selected={customEndDate}
                                onChange={(date) => date && setCustomEndDate(date)}
                                className="w-24 bg-transparent text-sm font-semibold text-gray-800 focus:outline-none text-center"
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Đến ngày"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <StatCard 
                title="Lịch Hẹn Hôm Nay" 
                value={kpi.totalAppointmentsToday} 
                growth={kpi.appointmentsGrowth}
                icon={FaCalendarCheck} 
                color="text-blue-600" 
                bgColor="bg-blue-50" 
            />
            <StatCard 
                title="Hồ Sơ Bệnh Án Mới" 
                value={kpi.totalPatientsToday} 
                growth={kpi.patientsGrowth}
                icon={FaUserInjured} 
                color="text-green-600" 
                bgColor="bg-green-50" 
            />
            <StatCard 
                title="Doanh Thu Tháng" 
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpi.totalRevenueMonth)} 
                growth={kpi.revenueGrowth}
                icon={FaMoneyBillWave} 
                color="text-yellow-600" 
                bgColor="bg-yellow-50" 
            />
            <StatCard 
                title="Tỷ Lệ Hủy Lịch" 
                value={`${kpi.cancelRate.toFixed(1)}%`} 
                growth={kpi.cancelRateGrowth}
                icon={FaUserMd} 
                color="text-red-600" 
                bgColor="bg-red-50"
                isReverse={true}
            />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Appointment Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-700 mb-6">Xu Hướng Lịch Hẹn (7 Ngày)</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={appointmentTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line type="monotone" dataKey="value" name="Lịch hẹn" stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-700 mb-6">Xu Hướng Doanh Thu (7 Ngày)</h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(value)} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                            />
                            <Bar dataKey="value" name="Doanh thu" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Top Services Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-700">Top 5 Dịch Vụ Phổ Biến</h2>
                
                {/* Selector for Stat Type */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setStatType('appointment')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1
                            ${statType === 'appointment' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaCalendarCheck /> Đặt lịch
                    </button>
                    <button
                        onClick={() => setStatType('medical_record')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1
                            ${statType === 'medical_record' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaStethoscope /> Khám thật
                    </button>
                    <button
                        onClick={() => setStatType('revenue')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1
                            ${statType === 'revenue' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FaCoins /> Doanh thu
                    </button>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={topServices}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={180} 
                            tick={{fontSize: 12, fill: '#4B5563', fontWeight: 500}} 
                        />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            formatter={(value, name, props) => [
                                props.payload.displayValue, 
                                statType === 'revenue' ? 'Doanh thu' : 'Số lượng'
                            ]}
                        />
                        <Bar dataKey="usage" name="Giá trị" radius={[0, 4, 4, 0]} barSize={32}>
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