import Sidebar from '../common/Sidebar';
import { 
  TrendingUp, Stethoscope, Briefcase, Newspaper, 
  Users, UserCheck, FileText, Pill, UserCircle 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const adminMenuItems = [
  { id: 'revenue',  label: 'Doanh Thu',         icon: TrendingUp },
  { id: 'accounts', label: 'Tài Khoản',         icon: UserCircle },
  { id: 'articles', label: 'Quản Lý Tin Tức',   icon: Newspaper },
  { id: 'patients', label: 'Bệnh Nhân',         icon: UserCheck },
  { id: 'services', label: 'Quản Lý Dịch Vụ',   icon: Briefcase },
  { id: 'invoices', label: 'Hóa Đơn',           icon: FileText },
];

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Lấy menu active dựa trên URL hoặc prop
  const activeMenu = propActiveMenu || 
    (currentPath.includes('/admin/services')   ? 'services' :
     currentPath.includes('/admin/articles')   ? 'articles' :
     currentPath.includes('/admin/patients')   ? 'patients' :
     currentPath.includes('/admin/invoices')   ? 'invoices' :
     currentPath.includes('/admin/accounts')   ? 'accounts' :
     currentPath === '/admin' || currentPath === '/admin/' ? 'revenue' : 'revenue');

  const handleMenuChange = (id) => {
    onMenuChange(id);

    // Điều hướng dựa trên id
    switch (id) {
      case 'revenue':
        navigate('/admin');
        break;
      case 'accounts':
        navigate('/admin/accounts');
        break;
      case 'articles':
        navigate('/admin/articles');
        break;
      case 'patients':
        navigate('/admin/patients');
        break;
      case 'services':
        navigate('/admin/services');
        break;
      case 'invoices':
        navigate('/admin/invoices');
        break;
      default:
        break;
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
