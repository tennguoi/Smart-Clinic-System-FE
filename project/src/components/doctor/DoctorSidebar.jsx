// src/components/sidebar/DoctorSidebar.jsx
import Sidebar from '../common/Sidebar';
import { Users, ClipboardList, History, UserCircle, Shield, BarChart3,CalendarDays, FileText  } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';

const doctorMenuItems = [
  { id: 'stats', label: 'Thống kê', icon: BarChart3 },
  { id: 'current-patient', label: 'Bệnh nhân', icon: Users },
  { id: 'records', label: 'Quản lý Hồ Sơ', icon: ClipboardList },
  { id: 'history', label: 'Lịch sử khám', icon: History },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
];

export default function DoctorSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  const currentPath = location.pathname;
  const activeMenu = propActiveMenu || 
    (currentPath.includes('/current-patient') ? 'current-patient' :
     currentPath.includes('/stats') ? 'stats' :
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
    } else if (id === 'stats') {
      navigate('/doctor/stats');
    }else {
      navigate('/doctor');
    }
  };

  return (
    <Sidebar
      title={clinicInfo?.name}
      menuItems={doctorMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}