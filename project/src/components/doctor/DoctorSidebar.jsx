// src/components/sidebar/DoctorSidebar.jsx
import Sidebar from '../common/Sidebar';
import { Users, ClipboardList, History, UserCircle, Shield, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const doctorMenuItems = [
  { id: 'stats', label: 'Thống kê', icon: BarChart3 },
  { id: 'current-patient', label: 'Bệnh nhân', icon: Users },
  { id: 'records', label: 'Quản lý Hồ Sơ', icon: ClipboardList },
  { id: 'history', label: 'Lịch sử khám', icon: History },
  { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: UserCircle },
  { id: 'security', label: 'Bảo Mật', icon: Shield },
];

export default function DoctorSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeMenu = propActiveMenu || (location.pathname.includes('/current-patient') ? 'current-patient' : 'stats');

  const handleMenuChange = (id) => {
    onMenuChange(id);
    if (id === 'current-patient') navigate('/doctor/current-patient');
    else navigate('/doctor');
  };

  return <Sidebar title="HealthCare Doctor" menuItems={doctorMenuItems} activeMenu={activeMenu} onMenuChange={handleMenuChange} />;
}