import { useCallback, useEffect, useMemo, useState } from 'react';
import DoctorSidebar from '../components/doctor/Sidebar';
import DoctorHeader from '../components/doctor/Header';
import ProfileSection from '../components/admin/ProfileSection';
import SecuritySection from '../components/admin/SecuritySection';
import axiosInstance from '../utils/axiosConfig';
import { authService } from '../services/authService';

const initialUserData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  photoUrl: '',
  twoFactorEnabled: false,
};

const persistUserData = (data) => {
  localStorage.setItem('user_info', JSON.stringify(data));
  localStorage.setItem('user', JSON.stringify(data));
};

const fallbackAppointments = [
  {
    id: 'sample-1',
    patientName: 'Nguyễn Văn A',
    time: '09:30',
    date: new Date().toISOString(),
    reason: 'Khám tổng quát',
  },
  {
    id: 'sample-2',
    patientName: 'Trần Thị B',
    time: '10:15',
    date: new Date().toISOString(),
    reason: 'Tái khám định kỳ',
  },
];

export default function DoctorPage() {
  const storedInfo = authService.getUserInfo();
  const [activeMenu, setActiveMenu] = useState('schedule');
  const [userData, setUserData] = useState(() => ({
    ...initialUserData,
    fullName: storedInfo?.fullName || '',
    email: storedInfo?.email || '',
    phone: storedInfo?.phone || '',
    dateOfBirth: storedInfo?.dob || storedInfo?.dateOfBirth || '',
    gender: storedInfo?.gender || '',
    address: storedInfo?.address || '',
    photoUrl: storedInfo?.photoUrl || '',
    twoFactorEnabled: Boolean(storedInfo?.twoFactorEnabled),
  }));

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [appointments, setAppointments] = useState(fallbackAppointments);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');





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

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    try {
      const payload = {
        fullName: userData.fullName,
        phone: userData.phone,
        dob: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
      };
      const { data } = await axiosInstance.post('/api/auth/update-profile', payload);
      if (data?.success) {
        setProfileSuccess('Cập nhật hồ sơ thành công!');
        persistUserData(userData);
        setTimeout(() => setProfileSuccess(''), 2500);
      } else {
        throw new Error(data?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật hồ sơ';
      setProfileError(message);
    }
  };

  const handlePhotoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('photo', file);

      setProfileError('');
      setProfileSuccess('');
      try {
        const { data } = await axiosInstance.post('/api/auth/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data?.success) {
          setUserData((prev) => {
            const updated = { ...prev, photoUrl: data.data };
            persistUserData(updated);
            return updated;
          });
          setProfileSuccess('Tải ảnh lên thành công!');
          setTimeout(() => setProfileSuccess(''), 2500);
        } else {
          throw new Error(data?.message || 'Tải ảnh thất bại');
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Tải ảnh thất bại';
        setProfileError(message);
      }
    };
    input.click();
  };

  const handleToggle2FA = async () => {
    setProfileError('');
    setProfileSuccess('');
    try {
      if (userData.twoFactorEnabled) {
        const { data } = await axiosInstance.post('/api/auth/disable-2fa');
        if (data?.success) {
          setUserData((prev) => {
            const updated = { ...prev, twoFactorEnabled: false };
            persistUserData(updated);
            return updated;
          });
          setProfileSuccess('Đã tắt xác thực 2 yếu tố.');
          setTimeout(() => setProfileSuccess(''), 2500);
          return true;
        }
        throw new Error(data?.message || 'Tắt 2FA thất bại');
      } else {
        const { data } = await axiosInstance.post('/api/auth/enable-2fa', {
          email: userData.email,
        });
        if (data?.success) {
          setProfileSuccess('Đã gửi mã OTP đến email của bạn.');
          setTimeout(() => setProfileSuccess(''), 2500);
          return true;
        }
        throw new Error(data?.message || 'Bật 2FA thất bại');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật 2FA';
      setProfileError(message);
      return false;
    }
  };

  const handleVerify2FA = async (otpCode) => {
    setProfileError('');
    setProfileSuccess('');
    try {
      const { data } = await axiosInstance.post('/api/auth/verify-2fa-enable', {
        email: userData.email,
        otpCode,
      });
      if (data?.success) {
        setUserData((prev) => {
          const updated = { ...prev, twoFactorEnabled: true };
          persistUserData(updated);
          return updated;
        });
        setProfileSuccess('Bật xác thực 2 yếu tố thành công!');
        setTimeout(() => setProfileSuccess(''), 2500);
        return true;
      }
      setProfileError(data?.message || 'Xác thực OTP thất bại');
      return false;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xác thực OTP thất bại';
      setProfileError(message);
      return false;
    }
  };

  const derivedStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter((appt) => new Date(appt.date).toDateString() === today).length;
    return {
      todayAppointments,
      totalUpcoming: appointments.length,
      weekPatients: Math.max(appointments.length - 1, 0),
    };
  }, [appointments]);

  const renderSchedule = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Lịch hôm nay</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{derivedStats.todayAppointments}</p>
          <p className="text-sm text-blue-700 mt-1">Cuộc hẹn đang chờ khám</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Bệnh nhân tuần này</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{derivedStats.weekPatients}</p>
          <p className="text-sm text-emerald-700 mt-1">Đã hoàn thành khám</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Lịch sắp tới</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{derivedStats.totalUpcoming}</p>
          <p className="text-sm text-purple-700 mt-1">Cuộc hẹn trong danh sách</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lịch khám sắp tới</h2>
          {appointmentsError && <span className="text-sm text-red-600">{appointmentsError}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giờ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lý do</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointmentsLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id || `${appt.patientName}-${appt.time}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{appt.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(appt.date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{appt.reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title) => (
    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500">
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm">Chức năng đang được phát triển. Vui lòng quay lại sau.</p>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      {profileError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {profileError}
        </div>
      )}
      {profileSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}
      {profileLoading ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center text-gray-500">
          Đang tải hồ sơ...
        </div>
      ) : (
        <>
          <ProfileSection
            fullName={userData.fullName}
            email={userData.email}
            phone={userData.phone}
            dateOfBirth={userData.dateOfBirth}
            gender={userData.gender}
            address={userData.address}
            photoUrl={userData.photoUrl}
            onPhotoChange={handlePhotoChange}
            onChange={handleFieldChange}
          />
          <div className="flex justify-end">
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Cập nhật thông tin
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {profileError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {profileError}
        </div>
      )}
      {profileSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}
      <SecuritySection
        twoFactorEnabled={userData.twoFactorEnabled}
        onToggle2FA={handleToggle2FA}
        onVerify2FA={handleVerify2FA}
        onChangePassword={() => {}}
      />
    </div>
  );

  const doctorName = useMemo(() => userData.fullName, [userData.fullName]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DoctorSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <DoctorHeader onLogout={handleLogout} fullName={doctorName} />

        <main className="flex-1 p-8 space-y-8">
          {activeMenu === 'schedule' && renderSchedule()}
          {activeMenu === 'patients' && renderPlaceholder('Danh sách bệnh nhân')}
          {activeMenu === 'prescriptions' && renderPlaceholder('Quản lý đơn thuốc')}
          {activeMenu === 'records' && renderPlaceholder('Hồ sơ khám bệnh')}
          {activeMenu === 'invoices' && renderPlaceholder('Quản lý hóa đơn')}
          {activeMenu === 'profile' && renderProfileSection()}
          {activeMenu === 'security' && renderSecuritySection()}
        </main>
      </div>
    </div>
  );
}
