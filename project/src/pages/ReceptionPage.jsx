import { useEffect, useState } from 'react';
import ReceptionHeader from '../components/receptionist/Header';
import ReceptionSidebar from '../components/receptionist/Sidebar';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import axiosInstance from '../utils/axiosConfig';

export default function ReceptionPage() {
  const [activeMenu, setActiveMenu] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa thông tin đăng nhập
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    if (activeMenu !== 'appointments') {
      return;
    }

    let ignore = false;

    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      setAppointmentsError('');

      try {
        const response = await axiosInstance.get('/api/appointments', {
          params: { status: selectedStatus },
        });

        if (!ignore) {
          setAppointments(response.data || []);
        }
      } catch (error) {
        if (!ignore) {
          console.error('Failed to fetch appointments:', error);
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          console.error('Error message:', error.message);
          console.log('Current roles:', authService.getRoles());
          console.log('Current token:', authService.getToken()?.substring(0, 50) + '...');
          setAppointmentsError(
            `Lỗi ${error.response?.status || 'không xác định'}: ${error.response?.data?.message || error.message || 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại.'}`
          );
        }
      } finally {
        if (!ignore) {
          setLoadingAppointments(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      ignore = true;
    };
  }, [activeMenu, selectedStatus]);

  const handleConfirmAppointment = async (appointmentId) => {
    setConfirmingId(appointmentId);
    setAppointmentsError('');
    setSuccessMessage('');

    try {
      await axiosInstance.patch(`/api/appointments/${appointmentId}/status`, null, {
        params: { status: 'Confirmed' },
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointmentId === appointmentId
            ? { ...appt, status: 'Confirmed', confirmedAt: new Date().toISOString() }
            : appt
        )
      );

      setSuccessMessage('Lịch hẹn đã được xác nhận và email đã gửi cho bệnh nhân.');
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      setAppointmentsError(
        error.response?.data?.message || 'Xác nhận lịch hẹn thất bại. Vui lòng thử lại.'
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return value;
    }
  };

  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">📅 Quản lý lịch hẹn</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            Trạng thái
          </label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Chờ xác nhận</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {appointmentsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {appointmentsError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã lịch
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ghi chú
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingAppointments ? (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                  Đang tải dữ liệu lịch hẹn...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                  Không có lịch hẹn nào cho trạng thái hiện tại.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{appointment.patientName}</div>
                    <div className="text-xs text-gray-500">Tạo lúc {formatDateTime(appointment.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{appointment.phone}</div>
                    <div className="text-xs text-blue-600">{appointment.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(appointment.appointmentTime)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{appointment.appointmentCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                    {appointment.notes || <span className="text-gray-400">Không có</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {appointment.status === 'Pending'
                        ? 'Chờ xác nhận'
                        : appointment.status === 'Confirmed'
                        ? 'Đã xác nhận'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {appointment.status === 'Pending' ? (
                      <button
                        onClick={() => handleConfirmAppointment(appointment.appointmentId)}
                        disabled={confirmingId === appointment.appointmentId}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                      >
                        {confirmingId === appointment.appointmentId ? 'Đang xác nhận...' : 'Xác nhận'}
                      </button>
                    ) : appointment.confirmedAt ? (
                      <div className="text-xs text-gray-500">
                        Xác nhận lúc {formatDateTime(appointment.confirmedAt)}
                        {appointment.confirmedByName && (
                          <>
                            <br />Bởi {appointment.confirmedByName}
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Không có hành động</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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
          {activeMenu === 'appointments' && renderAppointmentsSection()}
          {activeMenu === 'prescriptions' && <div>💊 Quản lý toa thuốc</div>}
        </main>
      </div>
    </div>
  );
}
