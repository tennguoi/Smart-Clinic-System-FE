
import React, { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { FaCalendarCheck, FaUserInjured, FaMoneyBillWave, FaUserMd, FaArrowUp, FaArrowDown, FaCalendar } from 'react-icons/fa';

const StatisticsPage = () => {
    const [topServices, setTopServices] = useState([]);
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
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Bảng màu cho biểu đồ
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kiểm tra token
                const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 

                if (!token) {
                    console.warn("Không tìm thấy Token. Đang hiển thị dữ liệu mẫu (Demo Mode).");
                    // Mock data logic here if needed, or just return
                    setLoading(false);
                    return;
                }

                const headers = { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Gọi API song song với date filter
                const params = { startDate, endDate };
                const [topServicesRes, kpiRes, apptTrendRes, revTrendRes] = await Promise.all([
                    axios.get('http://localhost:8082/api/admin/dashboard/top-services', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/kpi', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/appointments', { headers, params }),
                    axios.get('http://localhost:8082/api/admin/dashboard/trend/revenue', { headers, params })
                ]);

                // Map dữ liệu Top Services
                const formattedTopServices = topServicesRes.data.map((item) => ({
                    name: item.service.name,       
                    usage: item.totalUsage,        
                    price: item.service.price,     
                    image: item.service.photoUrl   
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
    }, [startDate, endDate]);

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
        // isReverse: true means lower is better (e.g. cancel rate)
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
            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thống Kê Tổng Quan</h1>
                    <p className="text-gray-500 text-sm mt-1">Báo cáo hoạt động của phòng khám</p>
                </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <FaCalendar className="text-blue-600" size={18} />
                    <span className="text-gray-700 font-medium">Lọc theo ngày:</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Từ ngày</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Đến ngày</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() - 30);
                            setStartDate(date.toISOString().split('T')[0]);
                            setEndDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm self-end"
                    >
                        30 Ngày
                    </button>
                    <button
                        onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() - 7);
                            setStartDate(date.toISOString().split('T')[0]);
                            setEndDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm self-end"
                    >
                        7 Ngày
                    </button>
                    <button
                        onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setStartDate(today);
                            setEndDate(today);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm self-end"
                    >
                        Hôm Nay
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Top Services Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-700 mb-6">Top 5 Dịch Vụ Phổ Biến</h2>
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
                                    formatter={(value) => [`${value} lượt`, 'Số lượng']}
                                />
                                <Bar dataKey="usage" name="Lượt sử dụng" radius={[0, 4, 4, 0]} barSize={32}>
                                    {topServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ranking Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[480px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-700">Bảng Xếp Hạng</h2>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {topServices.map((item, index) => (
                            <div key={index} className="flex items-center p-4 border-b border-gray-50 last:border-0 hover:bg-blue-50 transition-colors">
                                {/* STT */}
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 flex-shrink-0
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                                      index === 1 ? 'bg-gray-200 text-gray-600' : 
                                      index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-400 border'}`}>
                                    {index + 1}
                                </div>

                                {/* Thông tin */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        <img 
                                            src={item.image || "https://via.placeholder.com/40"} 
                                            alt=""
                                            className="w-8 h-8 rounded object-cover mr-2 border bg-white flex-shrink-0"
                                            onError={(e) => {e.target.src = 'https://via.placeholder.com/40'}}
                                        />
                                        <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-10">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </p>
                                </div>

                                {/* Số lượt */}
                                <div className="text-right ml-2 flex-shrink-0">
                                    <span className="block text-lg font-bold text-blue-600">{item.usage}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
