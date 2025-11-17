// src/components/doctor/Sidebar.jsx
import { CalendarDays, Users, FileText, Pill, ClipboardList, UserCircle, Shield, Cloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'schedule', label: 'Lịch Khám', icon: CalendarDays },
  { id: 'current-patient', label: 'Bệnh Nhân', icon: Users },
  { id: 'prescriptions', label: 'Đơn Thuốc', icon: Pill },
  { id: 'records', label: 'Hồ Sơ Khám', icon: ClipboardList },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: UserCircle },
  { id: 'security', label: 'Bảo Mật', icon: Shield },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentMenu = location.pathname.includes('current-patient') ? 'current-patient' : 'schedule';

  const handleClick = (id) => {
    if (id === 'current-patient') {
      navigate('/doctor/current-patient');
    } else {
      navigate('/doctor');
    }
  };

  return (
    <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <Cloud className="w-8 h-8" />
        <h1 className="text-xl font-semibold">HealthCare Doctor</h1>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 border-r-4 border-white font-semibold'
                  : 'text-blue-200 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}