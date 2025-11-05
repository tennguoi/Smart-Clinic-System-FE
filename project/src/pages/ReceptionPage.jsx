import { useState } from 'react';
import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/Sidebar';
import { useNavigate } from 'react-router-dom';

export default function ReceptionPage() {
  const [activeMenu, setActiveMenu] = useState('patients');
  const navigate = useNavigate();

  const handleLogout = () => {
    // Có thể thêm logic xóa token ở đây
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <ReceptionSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ReceptionHeader onLogout={handleLogout} />

        {/* Nội dung chính */}
        <main className="flex-1 p-8">
          {activeMenu === 'patients' && <div>📋 Danh sách bệnh nhân</div>}
          {activeMenu === 'appointments' && <div>📅 Quản lý lịch hẹn</div>}
          {activeMenu === 'prescriptions' && <div>💊 Quản lý toa thuốc</div>}
        </main>
      </div>
    </div>
  );
}
