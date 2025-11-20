// src/components/sidebar/AdminSidebar.jsx
import Sidebar from '../common/Sidebar';
import { TrendingUp, Stethoscope, Users, UserCheck, FileText, Pill, UserCircle, Briefcase, Newspaper, Cloud } from 'lucide-react';

const adminMenuItems = [
  { id: 'revenue', label: 'Doanh Thu', icon: TrendingUp },
  { id: 'doctors', label: 'Đội Ngũ Bác Sĩ', icon: Stethoscope },
  { id: 'services', label: 'Quản Lý Dịch Vụ', icon: Briefcase },
  { id: 'articles', label: 'Quản Lý Bài Viết', icon: Newspaper },
  { id: 'staff', label: 'Nhân Viên', icon: Users },
  { id: 'patients', label: 'Bệnh Nhân', icon: UserCheck },
  { id: 'invoices', label: 'Hóa Đơn', icon: FileText },
  { id: 'medicine', label: 'Thuốc', icon: Pill },
  { id: 'accounts', label: 'Tài Khoản', icon: UserCircle },
];

export default function AdminSidebar({ activeMenu, onMenuChange }) {
  return <Sidebar title="HealthCare Admin" menuItems={adminMenuItems} activeMenu={activeMenu} onMenuChange={onMenuChange} />;
}