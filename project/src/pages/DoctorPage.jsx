import { useCallback, useEffect, useMemo, useState } from 'react';
import DoctorSidebar from '../components/doctor/Sidebar';
import DoctorHeader from '../components/doctor/Header';
import MedicalRecordsSection from '../components/doctor/MedicalRecordsSection';
import DoctorProfileSection from '../components/doctor/DoctorProfileSection';
import DoctorSecuritySection from '../components/doctor/DoctorSecuritySection';
import DoctorScheduleSection from '../components/doctor/DoctorScheduleSection';
import PlaceholderSection from '../components/common/PlaceholderSection';
import axiosInstance from '../utils/axiosConfig';
import { authService } from '../services/authService';
import CurrentPatientExamination from '../components/doctor/CurrentPatientExamination';
import { Toaster } from 'react-hot-toast';

export default function DoctorPage() {
  const storedInfo = authService.getUserInfo();
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      return localStorage.getItem('doctor_active_menu') || 'schedule';
    } catch {
      return 'schedule';
    }
  });
  
  const [userData, setUserData] = useState(() => ({
    fullName: storedInfo?.fullName || '',
    email: storedInfo?.email || '',
    phone: storedInfo?.phone || '',
    dateOfBirth: storedInfo?.dob || storedInfo?.dateOfBirth || '',
    gender: storedInfo?.gender || '',
    address: storedInfo?.address || '',
    photoUrl: storedInfo?.photoUrl || '',
    twoFactorEnabled: Boolean(storedInfo?.twoFactorEnabled),
  }));

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.logout();
      window.location.href = '/login';
    }
  };

  const handleUserDataChange = useCallback((updatedData) => {
    setUserData(updatedData);
  }, []);

  const doctorName = useMemo(() => userData.fullName, [userData.fullName]);

  useEffect(() => {
    try {
      localStorage.setItem('doctor_active_menu', activeMenu);
    } catch {}
  }, [activeMenu]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <DoctorHeader onLogout={handleLogout} fullName={doctorName} />

        <main className="flex-1 p-8 space-y-8">
          {activeMenu === 'schedule' && <DoctorScheduleSection />}
          {activeMenu === 'current-patient' && (
            <CurrentPatientExamination 
              onNavigateToRecords={() => setActiveMenu('records')}
            />
          )}
          {activeMenu === 'records' && <MedicalRecordsSection />}
          {activeMenu === 'invoices' && <PlaceholderSection title="Quản lý hóa đơn" />}
          {activeMenu === 'profile' && <DoctorProfileSection storedInfo={storedInfo} />}
          {activeMenu === 'security' && (
            <DoctorSecuritySection 
              userData={userData}
              onUserDataChange={handleUserDataChange}
            />
          )}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}