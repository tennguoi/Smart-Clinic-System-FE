// src/components/AdminPage.jsx
import { useState } from 'react';
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';
import AccountManagement from '../components/admin/AccountManagement';

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('accounts');

  const renderContent = () => {
    switch (activeMenu) {
      case 'accounts':
        return <AccountManagement />;
      case 'revenue':
        return <div className="p-8"><h2 className="text-2xl font-bold">Doanh Thu</h2></div>;
      case 'doctors':
        return <div className="p-8"><h2 className="text-2xl font-bold">Bác Sĩ</h2></div>;
      case 'staff':
        return <div className="p-8"><h2 className="text-2xl font-bold">Nhân Viên</h2></div>;
      case 'patients':
        return <div className="p-8"><h2 className="text-2xl font-bold">Bệnh Nhân</h2></div>;
      case 'invoices':
        return <div className="p-8"><h2 className="text-2xl font-bold">Hóa Đơn</h2></div>;
      case 'medicine':
        return <div className="p-8"><h2 className="text-2xl font-bold">Thuốc</h2></div>;
      default:
        return <AccountManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
