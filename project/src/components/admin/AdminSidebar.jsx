import Sidebar from '../common/Sidebar';
import { 
  TrendingUp, Stethoscope, Briefcase, Newspaper, 
  Users, UserCheck, FileText, Pill, UserCircle 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const adminMenuItems = [
  { id: 'revenue',       label: 'Doanh Thu',         icon: TrendingUp },
  { id: 'doctors',       label: 'Đội Ngũ Bác Sĩ',    icon: Stethoscope },
  { id: 'services',      label: 'Quản Lý Dịch Vụ',   icon: Briefcase },
  { id: 'articles',      label: 'Quản Lý Bài Viết',  icon: Newspaper },
  { id: 'staff',         label: 'Nhân Viên',         icon: Users },
  { id: 'patients',      label: 'Bệnh Nhân',         icon: UserCheck },
  { id: 'invoices',      label: 'Hóa Đơn',           icon: FileText },
  { id: 'medicine',      label: 'Thuốc',             icon: Pill },
  { id: 'accounts',      label: 'Tài Khoản',         icon: UserCircle },
];

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // GIỐNG HỆT DOCTOR – CHỈ ĐỔI TÊN ĐƯỜNG DẪN
  const activeMenu = propActiveMenu || 
    (currentPath.includes('/admin/doctors')       ? 'doctors' :
     currentPath.includes('/admin/services')      ? 'services' :
     currentPath.includes('/admin/articles')      ? 'articles' :
     currentPath.includes('/admin/staff')         ? 'staff' :
     currentPath.includes('/admin/patients')      ? 'patients' :
     currentPath.includes('/admin/invoices')      ? 'invoices' :
     currentPath.includes('/admin/medicine')      ? 'medicine' :
     currentPath.includes('/admin/accounts')      ? 'accounts' :
     currentPath === '/admin' || currentPath === '/admin/' ? 'revenue' : 'revenue');

  const handleMenuChange = (id) => {
    onMenuChange(id);

    // GIỐNG HỆT DOCTOR – CHỈ ĐỔI ĐƯỜNG DẪN
    if (id === 'revenue') {
      navigate('/admin');
    } else if (id === 'doctors') {
      navigate('/admin/doctors');
    } else if (id === 'services') {
      navigate('/admin/services');
    } else if (id === 'articles') {
      navigate('/admin/articles');
    } else if (id === 'staff') {
      navigate('/admin/staff');
    } else if (id === 'patients') {
      navigate('/admin/patients');
    } else if (id === 'invoices') {
      navigate('/admin/invoices');
    } else if (id === 'medicine') {
      navigate('/admin/medicine');
    } else if (id === 'accounts') {
      navigate('/admin/accounts');
    }
  };

  return (
    <Sidebar
      title="HealthCare Admin"
      menuItems={adminMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}