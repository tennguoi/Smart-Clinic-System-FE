import Sidebar from '../common/Sidebar';
import { 
  Briefcase, Newspaper, UserCircle, Building2, BarChart3,
  ClipboardList, Receipt, Calendar, DoorOpen
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';

const adminMenuItems = [
  { id: 'statistics',       label: 'Thống kê',               icon: BarChart3 },
  { id: 'clinic',           label: 'Thông Tin Phòng Khám',  icon: Building2 },
  { id: 'accounts',         label: 'Tài Khoản',              icon: UserCircle },
  { id: 'articles',         label: 'Quản Lý Tin Tức',        icon: Newspaper },
  { id: 'services',         label: 'Quản Lý Dịch Vụ',        icon: Briefcase },
  { id: 'appointments',     label: 'Quản Lý Lịch Hẹn',       icon: Calendar },
  { id: 'rooms',            label: 'Quản Lý Phòng Khám',     icon: DoorOpen },
  { id: 'medical-records',  label: 'Lịch Sử Khám Bệnh',      icon: ClipboardList },
  { id: 'invoices',         label: 'Quản Lý Hóa Đơn',        icon: Receipt },
];

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  const currentPath = location.pathname;

  const activeMenu = propActiveMenu || 
    (currentPath.includes('/admin/statistics')        ? 'statistics' :
     currentPath.includes('/admin/doctors')           ? 'doctors' :
     currentPath.includes('/admin/services')          ? 'services' :
     currentPath.includes('/admin/articles')          ? 'articles' :
     currentPath.includes('/admin/clinic')            ? 'clinic' :
     currentPath.includes('/admin/appointments')      ? 'appointments' :
     currentPath.includes('/admin/rooms')             ? 'rooms' :
     currentPath.includes('/admin/staff')             ? 'staff' :
     currentPath.includes('/admin/patients')          ? 'patients' :
     currentPath.includes('/admin/medical-records')   ? 'medical-records' :
     currentPath.includes('/admin/invoices')          ? 'invoices' :
     currentPath.includes('/admin/medicine')          ? 'medicine' :
     currentPath.includes('/admin/accounts')          ? 'accounts' :
     currentPath === '/admin' || currentPath === '/admin/' ? 'statistics' : 'statistics');

  const handleMenuChange = (id) => {
    onMenuChange(id);

    if (id === 'statistics') {
      navigate('/admin/statistics');
    } else if (id === 'clinic') {
      navigate('/admin/clinic');
    } else if (id === 'accounts') {
      navigate('/admin/accounts');
    } else if (id === 'articles') {
      navigate('/admin/articles');
    } else if (id === 'services') {
      navigate('/admin/services');
    } else if (id === 'appointments') {
      navigate('/admin/appointments');
    } else if (id === 'rooms') {
      navigate('/admin/rooms');
    } else if (id === 'medical-records') {
      navigate('/admin/medical-records');
    } else if (id === 'invoices') {
      navigate('/admin/invoices');
    } else if (id === 'doctors') {
      navigate('/admin/doctors');
    } else if (id === 'staff') {
      navigate('/admin/staff');
    } else if (id === 'patients') {
      navigate('/admin/patients');
    } else if (id === 'medicine') {
      navigate('/admin/medicine');
    }
  };

  return (
    <Sidebar
      title={clinicInfo?.name}
      menuItems={adminMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}