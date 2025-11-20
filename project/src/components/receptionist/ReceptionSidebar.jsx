// src/components/receptionist/ReceptionSidebar.jsx
import Sidebar from '../common/Sidebar';
import { 
  CalendarCheck, 
  Users, 
  BedDouble, 
  FileText,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const receptionMenuItems = [
  { id: 'appointments', label: 'Lịch Hẹn',        icon: CalendarCheck },
  { id: 'records',      label: 'Hồ Sơ Bệnh Án',  icon: Users },
  { id: 'rooms',        label: 'Quản Lý Phòng',  icon: BedDouble },
  { id: 'invoices',     label: 'Hóa Đơn',         icon: FileText },
];

export default function ReceptionSidebar({ activeMenu: propActiveMenu }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định menu đang active theo URL
  const currentPath = location.pathname;

  const activeMenu =
    propActiveMenu ||
    (currentPath.includes('/reception/records')   ? 'records' :
     currentPath.includes('/reception/rooms')     ? 'rooms' :
     currentPath.includes('/reception/invoices')  ? 'invoices' :
     'appointments');

  // Xử lý khi bấm menu
  const handleMenuChange = (id) => {
    navigate(`/reception/${id}`);
  };

  return (
    <Sidebar
      title="HealthCare Reception"
      menuItems={receptionMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}
