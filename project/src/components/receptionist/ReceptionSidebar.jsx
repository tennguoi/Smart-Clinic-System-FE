// src/components/receptionist/ReceptionSidebar.jsx
import { useTranslation } from 'react-i18next';
import Sidebar from '../common/Sidebar';
import { 
  CalendarCheck, 
  Users, 
  BedDouble, 
  FileText,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClinic } from '../../contexts/ClinicContext';

export default function ReceptionSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { clinicInfo } = useClinic();

  // Menu items với i18n
  const receptionMenuItems = [
    { id: 'appointments', label: t('receptionSidebar.appointments'), icon: CalendarCheck },
    { id: 'records',      label: t('receptionSidebar.records'),      icon: Users },
    { id: 'rooms',        label: t('receptionSidebar.rooms'),        icon: BedDouble },
    { id: 'invoices',     label: t('receptionSidebar.invoices'),     icon: FileText },
  ];

  // Xác định menu đang active theo URL
  const getActiveMenu = () => {
    const path = location.pathname;

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
      title={clinicInfo?.name || t('header.defaultName')}
      menuItems={receptionMenuItems}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
    />
  );
}