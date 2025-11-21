// src/pages/DoctorPage.jsx
import { useEffect, useState } from 'react';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import Header from '../components/common/Header';
import MedicalRecordsSection from '../components/doctor/MedicalRecordsSection';
import MedicalRecordHistory from '../components/doctor/MedicalRecordHistory';
import DoctorScheduleSection from '../components/doctor/DoctorScheduleSection';
import PlaceholderSection from '../components/common/PlaceholderSection';
import CurrentPatientExamination from '../components/doctor/CurrentPatientExamination';
import { Toaster } from 'react-hot-toast';
import DoctorStatsDashboard from '../components/doctor/DoctorStatsDashboard';

export default function DoctorPage() {
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      return localStorage.getItem('doctor_active_menu') || 'schedule';
    } catch {
      return 'schedule';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('doctor_active_menu', activeMenu);
    } catch {}
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          
          {activeMenu === 'current-patient' && (
            <CurrentPatientExamination onNavigateToRecords={() => setActiveMenu('records')} />
          )}
          {activeMenu === 'stats' && <DoctorStatsDashboard />}
          {activeMenu === 'records' && <MedicalRecordsSection />}
          {activeMenu === 'history' && <MedicalRecordHistory />}
          {activeMenu === 'invoices' && (
            <PlaceholderSection title="Quản lý hóa đơn" message="Tính năng đang được phát triển..." />
          )}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}