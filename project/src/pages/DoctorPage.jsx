import { useCallback, useMemo, useState } from 'react';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorHeader from '../components/doctor/Header';
import MedicalRecordsSection from '../components/doctor/MedicalRecordsSection';
import MedicalRecordHistory from '../components/doctor/MedicalRecordHistory';
import DoctorProfileSection from '../components/doctor/DoctorProfileSection';
import DoctorSecuritySection from '../components/doctor/DoctorSecuritySection';
import DoctorStatsDashboard from '../components/doctor/DoctorStatsDashboard';
import axiosInstance from '../utils/axiosConfig';
import { authService } from '../services/authService';
import CurrentPatientExamination from '../components/doctor/CurrentPatientExamination';
import { Toaster } from 'react-hot-toast';

export default function DoctorPage() {
  const storedInfo = authService.getUserInfo();
  const [activeMenu, setActiveMenu] = useState('stats');
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <DoctorHeader onLogout={handleLogout} fullName={doctorName} />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {activeMenu === 'current-patient' && (
            <CurrentPatientExamination 
              onNavigateToRecords={() => setActiveMenu('records')}
            />
          )}
          
          {activeMenu === 'records' && <MedicalRecordsSection />}
          {activeMenu === 'history' && <MedicalRecordHistory />}
          {activeMenu === 'stats' && <DoctorStatsDashboard />}
          
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