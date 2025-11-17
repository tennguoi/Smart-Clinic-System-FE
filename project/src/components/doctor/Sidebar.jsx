// src/components/doctor/Sidebar.jsx
import { CalendarDays, Users, FileText, ClipboardList, UserCircle, Shield, Cloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { id: 'schedule', label: 'Lịch Khám', icon: CalendarDays },
  { id: 'current-patient', label: 'Bệnh nhân', icon: Users },
  { id: 'records', label: 'Hồ Sơ Khám', icon: ClipboardList },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: UserCircle },
  { id: 'security', label: 'Bảo Mật', icon: Shield },
];

export default function Sidebar({ activeMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentActive = activeMenu || 
    (location.pathname.includes('/current-patient') ? 'current-patient' : 'schedule');

  const handleClick = (id) => {
    onMenuChange(id);
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
          const isActive = currentActive === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 text-lg ${
                isActive
                  ? 'bg-blue-600 border-r-4 border-white font-bold shadow-lg'
                  : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}