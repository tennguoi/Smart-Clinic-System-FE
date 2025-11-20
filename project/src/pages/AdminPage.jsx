// src/pages/AdminPage.jsx
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminPage() {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('revenue');

  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin' || path.includes('/revenue')) setActiveMenu('revenue');
    else if (path.includes('/doctors')) setActiveMenu('doctors');
    else if (path.includes('/services')) setActiveMenu('services');
    else if (path.includes('/articles')) setActiveMenu('articles');
    else if (path.includes('/accounts')) setActiveMenu('accounts');
    else if (path.includes('/staff')) setActiveMenu('staff');
    else if (path.includes('/patients')) setActiveMenu('patients');
    else if (path.includes('/invoices')) setActiveMenu('invoices');
    else if (path.includes('/medicine')) setActiveMenu('medicine');
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />  {/* ← Ở ĐÂY SẼ HIỆN ĐÚNG COMPONENT THEO ROUTE */}
        </main>
      </div>
    </div>
  );
}