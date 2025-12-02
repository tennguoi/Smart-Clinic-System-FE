// src/components/admin/AdminSidebar.jsx
import Sidebar from '../common/Sidebar';
import {
  Briefcase, Newspaper, UserCircle, Building2, BarChart3,
  ClipboardList, Receipt, Calendar, DoorOpen
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  // Danh sách menu đã được dịch qua i18next
  const adminMenuItems = [
    { id: 'statistics',      label: t('adminSidebar.statistics'),      icon: BarChart3 },
    { id: 'clinic',          label: t('adminSidebar.clinic'),          icon: Building2 },
    { id: 'accounts',        label: t('adminSidebar.accounts'),        icon: UserCircle },
    { id: 'articles',        label: t('adminSidebar.articles'),        icon: Newspaper },
    { id: 'services',        label: t('adminSidebar.services'),        icon: Briefcase },
    { id: 'appointments',    label: t('adminSidebar.appointments'),    icon: Calendar },
    { id: 'rooms',           label: t('adminSidebar.rooms'),           icon: DoorOpen },
    { id: 'medical-records', label: t('adminSidebar.medicalRecords'),  icon: ClipboardList },
    { id: 'invoices',        label: t('adminSidebar.invoices'),        icon: Receipt },
  ];

  const currentPath = location.pathname;

  const activeMenu = propActiveMenu ||
    (currentPath.includes('/admin/statistics')        ? 'statistics' :
     currentPath.includes('/admin/clinic')            ? 'clinic' :
     currentPath.includes('/admin/accounts')          ? 'accounts' :
     currentPath.includes('/admin/articles')          ? 'articles' :
     currentPath.includes('/admin/services')          ? 'services' :
     currentPath.includes('/admin/appointments')      ? 'appointments' :
     currentPath.includes('/admin/rooms')             ? 'rooms' :
     currentPath.includes('/admin/medical-records')   ? 'medical-records' :
     currentPath.includes('/admin/invoices')          ? 'invoices' :
     currentPath === '/admin' || currentPath === '/admin/' ? 'statistics' : 'statistics');

  const handleMenuChange = (id) => {
    onMenuChange?.(id);

    const routes = {
      statistics:      '/admin/statistics',
      clinic:          '/admin/clinic',
      accounts:        '/admin/accounts',
      articles:        '/admin/articles',
      services:        '/admin/services',
      appointments:    '/admin/appointments',
      rooms:           '/admin/rooms',
      'medical-records': '/admin/medical-records',
      invoices:        '/admin/invoices',
    };

    navigate(routes[id] || '/admin');
  };

  return (
    <Sidebar
      title={clinicInfo?.name || t('header.defaultName')}
      menuItems={adminMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}