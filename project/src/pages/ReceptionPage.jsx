// src/pages/ReceptionPage.jsx
import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header'; // ← CHUNG
import ReceptionSidebar from '../components/receptionist/ReceptionSidebar';
import { authService } from '../services/authService';

export default function ReceptionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/reception' || location.pathname === '/reception/') {
      navigate('/reception/appointments', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      <ReceptionSidebar />
      
      <div className="flex-1 flex flex-col">
        <Header /> {/* ← DÙNG CHUNG */}
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}