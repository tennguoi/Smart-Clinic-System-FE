// src/components/admin/AdminSidebar.jsx
import Sidebar from '../common/Sidebar';
import { 
  TrendingUp, Stethoscope, Briefcase, Newspaper, 
  Users, UserCheck, FileText, Pill, UserCircle, Building2, BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Thêm i18n

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Dịch menu items động từ i18n
  const menuItems = [
    { id: 'statistics', label: t('adminSidebar.statistics'), icon: BarChart3 },
    // { id: 'revenue',     label: t('adminSidebar.revenue'),     icon: TrendingUp },
    { id: 'clinic',      label: t('adminSidebar.clinic'),      icon: Building2 },
    { id: 'accounts',    label: t('adminSidebar.accounts'),    icon: UserCircle },
    { id: 'articles',    label: t('adminSidebar.articles'),    icon: Newspaper },
    { id: 'services',    label: t('adminSidebar.services'),    icon: Briefcase },
    // Thêm sau nếu cần:
    // { id: 'doctors',     label: t('adminSidebar.doctors'),     icon: Stethoscope },
    // { id: 'patients',    label: t('adminSidebar.patients'),    icon: UserCheck },
  ];

  const currentPath = location.pathname;

  const activeMenu = propActiveMenu || 
    (currentPath.includes('/admin/statistics') ? 'statistics' :
     currentPath.includes('/admin/clinic')     ? 'clinic' :
     currentPath.includes('/admin/accounts')   ? 'accounts' :
     currentPath.includes('/admin/articles')   ? 'articles' :
     currentPath.includes('/admin/services')   ? 'services' :
     currentPath === '/admin' || currentPath === '/admin/' ? 'statistics' : 'statistics'); // mặc định là statistics

  const handleMenuChange = (id) => {
    onMenuChange?.(id);

    const routes = {
      statistics: '/admin/statistics',
      clinic: '/admin/clinic',
      accounts: '/admin/accounts',
      articles: '/admin/articles',
      services: '/admin/services',
      // doctors: '/admin/doctors',
      // patients: '/admin/patients',
      // invoices: '/admin/invoices',
      // medicine: '/admin/medicine',
    };

    navigate(routes[id] || '/admin');
  };

  return (
    <Sidebar
      title={t('adminSidebar.title')}  // Dịch tiêu đề sidebar
      menuItems={menuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}