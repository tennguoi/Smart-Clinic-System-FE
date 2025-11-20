// src/components/sidebar/DoctorSidebar.jsx
import Sidebar from '../common/Sidebar';
import { CalendarDays, Users, ClipboardList, History, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const doctorMenuItems = [
  { id: 'schedule', label: 'Lịch Khám', icon: CalendarDays },
  { id: 'current-patient', label: 'Bệnh nhân', icon: Users },
  { id: 'records', label: 'Quản lý Hồ Sơ', icon: ClipboardList },
  { id: 'history', label: 'Lịch sử khám', icon: History },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
];

export default function DoctorSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const activeMenu = propActiveMenu || 
    (currentPath.includes('/current-patient') ? 'current-patient' :
     currentPath.includes('/records') ? 'records' :
     currentPath.includes('/history') ? 'history' :
     currentPath.includes('/invoices') ? 'invoices' : 'schedule');

  const handleMenuChange = (id) => {
    onMenuChange(id);
    if (id === 'current-patient') {
      navigate('/doctor/current-patient');
    } else if (id === 'records') {
      navigate('/doctor/records');
    } else if (id === 'history') {
      navigate('/doctor/history');
    } else if (id === 'invoices') {
      navigate('/doctor/invoices');
    } else {
      navigate('/doctor');
    }
  };

  return (
    <Sidebar
      title="HealthCare Doctor"
      menuItems={doctorMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}