// src/pages/AdminPage.jsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/common/Header';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('statistics');

  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin' || path === '/admin/') {
      navigate('/admin/statistics', { replace: true });
      setActiveMenu('statistics');
      return;
    }

    // Cập nhật active menu theo đường dẫn
    if (path.includes('/statistics')) setActiveMenu('statistics');
    else if (path.includes('/doctors')) setActiveMenu('doctors');
    else if (path.includes('/services')) setActiveMenu('services');
    else if (path.includes('/articles')) setActiveMenu('articles');
    else if (path.includes('/accounts')) setActiveMenu('accounts');
    else if (path.includes('/clinic')) setActiveMenu('clinic');
    else if (path.includes('/appointments')) setActiveMenu('appointments');
    else if (path.includes('/rooms')) setActiveMenu('rooms');
    else if (path.includes('/medical-records')) setActiveMenu('medical-records');
    else if (path.includes('/invoices')) setActiveMenu('invoices');
    else if (path.includes('/reviews')) setActiveMenu('reviews');
    else if (path.includes('/email-templates')) setActiveMenu('email-templates');
    else setActiveMenu('statistics');
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      <AdminSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}