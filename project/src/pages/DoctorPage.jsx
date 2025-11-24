// src/pages/DoctorPage.jsx
import { useEffect, useState } from 'react';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import Header from '../components/common/Header';
import MedicalRecordsSection from '../components/doctor/MedicalRecordsSection';
import MedicalRecordHistory from '../components/doctor/MedicalRecordHistory';
import DoctorScheduleSection from '../components/doctor/DoctorScheduleSection';
import CurrentPatientExamination from '../components/doctor/CurrentPatientExamination';
import DoctorStatsDashboard from '../components/doctor/DoctorStatsDashboard';
import InvoicesSection from '../components/receptionist/InvoicesSection'; // THÊM DÒNG NÀY
import { Toaster } from 'react-hot-toast';

export default function DoctorPage() {
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      return localStorage.getItem('doctor_active_menu') || 'current-patient'; // đổi default cho hợp lý
    } catch {
      return 'current-patient';
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
          
          {/* ĐÃ SỬA – BÁC SĨ XEM HÓA ĐƠN ĐẸP NHƯ LỄ TÂN */}
          {activeMenu === 'invoices' && <InvoicesSection isDoctorView={true} />}

          {/* Nếu có menu khác chưa làm thì để placeholder tạm */}
          {/* {activeMenu === 'schedule' && <DoctorScheduleSection />} */}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}