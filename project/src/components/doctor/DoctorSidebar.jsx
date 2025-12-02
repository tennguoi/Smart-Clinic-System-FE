// src/components/sidebar/DoctorSidebar.jsx
import Sidebar from '../common/Sidebar';
import {
  Users,
  ClipboardList,
  History,
  UserCircle,
  Shield,
  BarChart3,
  CalendarDays,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Thêm dòng này
import { useClinic } from '../../contexts/ClinicContext';

export default function DoctorSidebar({ activeMenu: propActiveMenu, onMenuChange }) {
  {
  const { t } = useTranslation(); // Hook dịch
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  // Dùng i18n để dịch các nhãn menu
  const doctorMenuItems = [
    { id: 'stats',        label: t('doctorSidebar.stats'),        icon: BarChart3 },
    { id: 'current-patient', label: t('doctorSidebar.currentPatient'), icon: Users },
    { id: 'records',      label: t('doctorSidebar.records'),      icon: ClipboardList },
    { id: 'history',      label: t('doctorSidebar.history'),      icon: History },
    { id: 'invoices',     label: t('doctorSidebar.invoices'),     icon: FileText },
    // Bạn có thể thêm các menu khác sau này ở đây
  ];

  const currentPath = location.pathname;
  const activeMenu = propActiveMenu || 
    (currentPath.includes('/current-patient') ? 'current-patient' :
     currentPath.includes('/stats') ? 'stats' :
     currentPath.includes('/records') ? 'records' :
     currentPath.includes('/history') ? 'history' :
     currentPath.includes('/invoices') ? 'invoices' : 'stats'); // mặc định về stats

  const handleMenuChange = (id) => {
    onMenuChange?.(id);
    const routes = {
      'current-patient': '/doctor/current-patient',
      'records': '/doctor/records',
      'history': '/doctor/history',
      'invoices': '/doctor/invoices',
      'stats': '/doctor/stats',
    };
    navigate(routes[id] || '/doctor');
  };

  return (
    <Sidebar
      title={clinicInfo?.name || t('header.defaultName')}
      menuItems={doctorMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}
}