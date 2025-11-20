// src/components/sidebar/ReceptionSidebar.jsx
import Sidebar from '../common/Sidebar';
import { CalendarDays, Users, Building2, FileText, UserCircle, Shield, Cloud } from 'lucide-react';

const receptionMenuItems = [
  { id: 'appointments', label: 'Quản lý lịch hẹn', icon: CalendarDays },
  { id: 'records', label: 'Danh sách bệnh nhân', icon: Users },
  { id: 'rooms', label: 'Quản lý phòng khám', icon: Building2 },
  { id: 'invoices', label: 'Hóa đơn', icon: FileText },
  { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
  { id: 'security', label: 'Bảo mật', icon: Shield },
];

export default function ReceptionSidebar({ activeMenu, onMenuChange }) {
  return <Sidebar title="Reception Panel" menuItems={receptionMenuItems} activeMenu={activeMenu} onMenuChange={onMenuChange} />;
}