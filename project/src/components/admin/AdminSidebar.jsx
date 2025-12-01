// src/components/admin/AdminSidebar.jsx
import Sidebar from '../common/Sidebar';
import { 
  BarChart3, Building2, UserCircle, Newspaper, Briefcase,
  Calendar, DoorOpen, ClipboardList, Receipt, MessageSquare
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';

const adminMenuItems = [
  { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
  { id: 'clinic', label: 'Thông Tin Phòng Khám', icon: Building2 },
  { id: 'accounts', label: 'Tài Khoản', icon: UserCircle },
  { id: 'articles', label: 'Quản Lý Tin Tức', icon: Newspaper },
  { id: 'services', label: 'Quản Lý Dịch Vụ', icon: Briefcase },
  { id: 'appointments', label: 'Quản Lý Lịch Hẹn', icon: Calendar },
  { id: 'rooms', label: 'Quản Lý Phòng Khám', icon: DoorOpen },
  { id: 'medical-records', label: 'Lịch Sử Khám Bệnh', icon: ClipboardList },
  { id: 'invoices', label: 'Quản Lý Hóa Đơn', icon: Receipt },
  { id: 'reviews', label: 'Quản Lý Đánh Giá', icon: MessageSquare }, // THÊM MỚI
];

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  const currentPath = location.pathname;

  const activeMenu = propActiveMenu || 
    (currentPath.includes('/admin/reviews') ? 'reviews' : // THÊM DÒNG NÀY
     currentPath.includes('/admin/statistics') ? 'statistics' :
     currentPath.includes('/admin/clinic') ? 'clinic' :
     currentPath.includes('/admin/accounts') ? 'accounts' :
     currentPath.includes('/admin/articles') ? 'articles' :
     currentPath.includes('/admin/services') ? 'services' :
     currentPath.includes('/admin/appointments') ? 'appointments' :
     currentPath.includes('/admin/rooms') ? 'rooms' :
     currentPath.includes('/admin/medical-records') ? 'medical-records' :
     currentPath.includes('/admin/invoices') ? 'invoices' :
     'statistics');

  const handleMenuChange = (id) => {
    onMenuChange?.(id);

    const routes = {
      statistics: '/admin/statistics',
      clinic: '/admin/clinic',
      accounts: '/admin/accounts',
      articles: '/admin/articles',
      services: '/admin/services',
      appointments: '/admin/appointments',
      rooms: '/admin/rooms',
      'medical-records': '/admin/medical-records',
      invoices: '/admin/invoices',
      reviews: '/admin/reviews', // THÊM ĐƯỜNG DẪN
    };

    navigate(routes[id] || '/admin/statistics');
  };

  return (
    <Sidebar
      title={clinicInfo?.name || "Admin"}
      menuItems={adminMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}