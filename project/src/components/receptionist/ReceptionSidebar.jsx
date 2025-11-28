// src/components/receptionist/ReceptionSidebar.jsx
import Sidebar from '../common/Sidebar';
import { 
  CalendarCheck, 
  Users, 
  BedDouble, 
  FileText,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';

const receptionMenuItems = [
  { id: 'appointments', label: 'Lịch Hẹn',        icon: CalendarCheck },
  { id: 'check-in',     label: 'Check In Bệnh Nhân', icon: CalendarCheck },
  { id: 'records',      label: 'Hồ Sơ Bệnh Án',  icon: Users },
  { id: 'rooms',        label: 'Quản Lý Phòng',  icon: BedDouble },
  { id: 'invoices',     label: 'Hóa Đơn',         icon: FileText },
];

export default function ReceptionSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  // Xác định menu đang active theo URL – CỰC CHUẨN!
  const getActiveMenu = () => {
    const path = location.pathname;

    if (path.includes('/reception/check-in')) return 'check-in';
    if (path.includes('/reception/invoices')) return 'invoices';
    if (path.includes('/reception/rooms'))    return 'rooms';
    if (path.includes('/reception/records'))  return 'records';
    if (path.includes('/reception/appointments') || path === '/reception') return 'appointments';
    
    return 'appointments'; // fallback
  };

  const activeMenu = getActiveMenu();

  const handleMenuChange = (id) => {
    navigate(`/reception/${id}`);
  };

  return (
    <Sidebar
      title={clinicInfo?.name}
      menuItems={receptionMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}