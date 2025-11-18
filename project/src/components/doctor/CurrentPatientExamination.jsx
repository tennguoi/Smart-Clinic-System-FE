import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, PhoneCall, CheckCircle, Search, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getMyQueue, getCurrentPatient, callPatient as callPatientApi, completeExamination } from '../../api/doctorApi';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CurrentPatientExamination({ onNavigateToRecords }) {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previousQueueLengthRef = useRef(0);
  const previousCurrentPatientRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    patient: null,
  });

  const doctorInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const doctorName = doctorInfo.fullName || 'Bác sĩ';

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [queueData, currentPatientData] = await Promise.all([ 
        getMyQueue().catch(() => []), 
        getCurrentPatient().catch(() => null) 
      ]);

      const mappedQueue = (queueData || []).map(item => ({
        id: item.queueId,
        queueId: item.queueId,
        queueNumber: item.queueNumber,
        fullName: item.patientName || item.fullName,
        phone: item.phone,
        priority: item.priority || 'Normal',
        status: item.status || 'Waiting',
        checkInTime: item.checkInTime,
        symptoms: item.symptoms || item.reason,
      }));

      const waiting = mappedQueue.filter(p => p.status === 'Waiting');

      const newCurrentPatient = currentPatientData ? {
        id: currentPatientData.queueId,
        queueId: currentPatientData.queueId,
        queueNumber: currentPatientData.queueNumber,
        fullName: currentPatientData.fullName,
        phone: currentPatientData.phone,
        dob: currentPatientData.dob,
        gender: currentPatientData.gender,
        priority: currentPatientData.priority,
        checkInTime: currentPatientData.checkInTime,
        startTime: currentPatientData.startTime,
        symptoms: null,
      } : null;

      // if (newCurrentPatient && (!previousCurrentPatientRef.current || 
      //   previousCurrentPatientRef.current.queueId !== newCurrentPatient.queueId)) {

      //   toast.success(`Bệnh nhân ${newCurrentPatient.queueNumber} - ${newCurrentPatient.fullName} đã được phân vào phòng!`, {
      //     duration: 3000,
      //     icon: '👨‍⚕️',
      //   });
      // }

      previousQueueLengthRef.current = waiting.length;
      previousCurrentPatientRef.current = newCurrentPatient;

      setCurrentPatient(newCurrentPatient);
      setQueue(waiting);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Không thể tải danh sách bệnh nhân';
      setError(message);
      toast.error(message);
      console.error('Error loading queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();  // Chỉ gọi 1 lần khi component mount
    return () => {
      toast.dismiss();  // Dismiss all toasts when leaving this page/component
    };
  }, [loadQueue]);

  const handleCallPatient = async (patient) => {
    if (currentPatient) {
      toast.error('Đang khám bệnh nhân khác!');
      return;
    }

    try {
      await callPatientApi(patient.queueId);
      toast.success(`Đã gọi ${patient.queueNumber} - ${patient.fullName}`, {
        duration: 3000,
      });
      await loadQueue();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Gọi bệnh nhân thất bại';
      toast.error(message);
      console.error('Error calling patient:', err);
    }
  };

  const openCompleteDialog = (patient) => {
    setConfirmDialog({
      isOpen: true,
      patient,
    });
  };

  const handleConfirmComplete = async () => {
    const patient = confirmDialog.patient;
    try {
      await completeExamination(patient.queueId);
      toast.success(`Đã hoàn thành khám cho ${patient.queueNumber} - ${patient.fullName}!`, {
        duration: 4000,
      });
      setCurrentPatient(null);
      setConfirmDialog({ isOpen: false, patient: null });
      await loadQueue();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Hoàn thành khám thất bạq';
      toast.error(message);
      console.error('Error completing examination:', err);
    }
  };

  const waitingPatients = queue.filter(p => p.status === 'Waiting');
  const filtered = waitingPatients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.queueNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg font-semibold text-blue-600 animate-pulse">Đang tải bảng điều khiển...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="bg-gradient-to-r from-white-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 text-">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bảng Danh Sách Bệnh Nhân</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Danh sách bệnh nhân hôm nay
                </h2>
                {error && (
                  <span className="text-xs bg-red-500 px-2 py-1 rounded">{error}</span>
                )}
              </div>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc số thứ tự..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Số TT</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-center">Ưu tiên</th>
                    <th className="px-4 py-3 text-center">Check-in</th>
                    {/* <th className="px-4 py-3 text-center">Thao tác</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-gray-500 text-base font-medium">
                        Không có bệnh nhân nào đang chờ
                      </td>
                    </tr>
                  ) : (
                    filtered.map((patient) => (
                      <tr key={patient.id} className="hover:bg-blue-50 transition border-b">
                        <td className="px-4 py-4">
                          <span className="text-xl font-bold text-blue-600">{patient.queueNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-800">{patient.fullName}</p>
                          <p className="text-xs text-gray-500">{patient.phone}</p>
                        </td>
                        <td className="text-center py-4">
                          <span className={`inline-block px-3 py-1 rounded-full font-medium text-white text-xs ${
                            patient.priority === 'Emergency' ? 'bg-red-500' :
                            patient.priority === 'Urgent' ? 'bg-orange-500' : 'bg-green-500'
                          }`}> 
                            {patient.priority === 'Emergency' ? 'Khẩn cấp' :
                             patient.priority === 'Urgent' ? 'Ưu tiên' : 'Bình thường'}
                          </span>
                        </td>
                        <td className="text-center text-sm py-4 text-gray-700">
                          {new Date(patient.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="text-center py-4">
                          <button
                            onClick={() => handleCallPatient(patient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm flex items-center gap-2 mx-auto"
                          >
                            <PhoneCall className="w-4 h-4" />
                            Gọi bệnh
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {currentPatient ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md p-6 text-white h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-center">Đang khám</h3>
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="text-5xl font-bold drop-shadow-lg">{currentPatient.queueNumber}</div>
                <div className="text-xl font-semibold text-center px-2">{currentPatient.fullName}</div>
                <div className="text-sm opacity-90">
                  Vào phòng lúc: {currentPatient.startTime 
                    ? new Date(currentPatient.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </div>
                {currentPatient.symptoms && (
                  <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 text-center max-w-xs">
                    <p className="text-sm leading-relaxed">{currentPatient.symptoms}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => {
                    if (onNavigateToRecords && currentPatient) {
                      localStorage.setItem('create_record_patient_name', currentPatient.fullName);
                      onNavigateToRecords();
                      toast.success('Chuyển sang trang tạo hồ sơ khám', {
                        duration: 2000,
                      });
                    }
                  }}
                  className="w-full bg-white text-teal-600 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Tạo hồ sơ khám
                </button>
                <button
                  onClick={() => openCompleteDialog(currentPatient)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành khám
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 mb-4 mx-auto" />
              <h2 className="text-lg font-bold text-gray-700 mb-2">Chưa có bệnh nhân</h2>
              <p className="text-sm text-gray-600">Nhấn "Gọi bệnh" để bắt đầu khám</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, patient: null })}
        onConfirm={handleConfirmComplete}
        patientName={confirmDialog.patient?.fullName}
        queueNumber={confirmDialog.patient?.queueNumber}
      />
    </>
  );
}
