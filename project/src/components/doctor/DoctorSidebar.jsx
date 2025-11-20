// src/components/sidebar/DoctorSidebar.jsx
import Sidebar from '../common/Sidebar';
import { CalendarDays, Users, ClipboardList, History, FileText, UserCircle, Shield, Cloud } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const doctorMenuItems = [
  { id: 'schedule', label: 'Lịch Khám', icon: CalendarDays },
  { id: 'current-patient', label: 'Bệnh nhân', icon: Users },
  { id: 'records', label: 'Quản lý Hồ Sơ', icon: ClipboardList },
  { id: 'history', label: 'Lịch sử khám', icon: History },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: UserCircle },
  { id: 'security', label: 'Bảo Mật', icon: Shield },
];

export default function DoctorSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeMenu = propActiveMenu || (location.pathname.includes('/current-patient') ? 'current-patient' : 'schedule');

  const handleMenuChange = (id) => {
    onMenuChange(id);
    if (id === 'current-patient') navigate('/doctor/current-patient');
    else navigate('/doctor');
  };

  return <Sidebar title="HealthCare Doctor" menuItems={doctorMenuItems} activeMenu={activeMenu} onMenuChange={handleMenuChange} />;
}