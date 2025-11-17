// src/components/doctor/CurrentPatientExamination.jsx
import { useState, useEffect } from 'react';
import { Users, PhoneCall, CheckCircle, Clock, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import dữ liệu ảo + dialog xác nhận
import mockData from '../../mock/doctorQueue.json';
import ConfirmDialog from '../common/ConfirmDialog';

export default function CurrentPatientExamination() {
  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // State cho dialog xác nhận hoàn thành
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    patient: null,
  });

  const doctorInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
  const doctorName = doctorInfo.fullName || 'Bác sĩ';

  // Load dữ liệu ảo
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueue(mockData.queue || []);
      setCurrentPatient(mockData.currentPatient || null);
      setLoading(false);
    }, 800);

    const interval = setInterval(() => {
      setQueue([...mockData.queue]);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Gọi bệnh nhân vào khám
  const callPatient = (patient) => {
    if (currentPatient) {
      toast.error('Đang khám bệnh nhân khác!');
      return;
    }
    toast.success(`Đã gọi ${patient.queueNumber} - ${patient.fullName}`, {
      icon: 'Loudspeaker',
      duration: 3000,
    });
    setCurrentPatient(patient);
    setQueue(prev => prev.filter(p => p.id !== patient.id));
  };

  // Mở dialog xác nhận hoàn thành
  const openCompleteDialog = (patient) => {
    setConfirmDialog({
      isOpen: true,
      patient,
    });
  };

  // Xác nhận hoàn thành khám
  const handleConfirmComplete = () => {
    const patient = confirmDialog.patient;
    toast.success(`Đã hoàn thành khám cho ${patient.queueNumber} - ${patient.fullName}!`, {
      icon: 'Checkmark',
      style: { background: '#10b981', color: 'white' },
      duration: 4000,
    });
    setCurrentPatient(null);
    setConfirmDialog({ isOpen: false, patient: null });
  };

  const waitingPatients = queue.filter(p => p.status === 'Waiting');
  const filtered = waitingPatients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.queueNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-4xl font-bold text-blue-600 animate-pulse">Đang tải bảng điều khiển...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* HEADER TÍM CHỦ ĐẠO */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black">Bảng Điều Khiển Bác Sĩ</h1>
            <p className="text-3xl mt-2 opacity-90">Dr. {doctorName}</p>
          </div>
          <div className="text-right">
            <div className="text-9xl font-black drop-shadow-lg">{waitingPatients.length}</div>
            <div className="text-3xl opacity-90">Bệnh nhân đang chờ</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: DANH SÁCH CHỜ (8/12) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <Users className="w-10 h-10" />
                Danh sách bệnh nhân hôm nay
              </h2>
            </div>

            <div className="p-6 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-5 top-4 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên hoặc số thứ tự..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border-2 border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-screen">
              <table className="w-full">
                <thead className="bg-gray-100 text-gray-700 uppercase text-sm sticky top-0">
                  <tr>
                    <th className="px-6 py-5 text-left">Số TT</th>
                    <th className="px-6 py-5 text-left">Họ tên</th>
                    <th className="px-6 py-5 text-center">Ưu tiên</th>
                    <th className="px-6 py-5 text-center">Check-in</th>
                    <th className="px-6 py-5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-32 text-gray-500 text-3xl font-medium">
                        Không có bệnh nhân nào đang chờ
                      </td>
                    </tr>
                  ) : (
                    filtered.map((patient) => (
                      <tr key={patient.id} className="hover:bg-blue-50 transition border-b">
                        <td className="px-6 py-6">
                          <span className="text-6xl font-black text-blue-600">{patient.queueNumber}</span>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-2xl font-semibold text-gray-800">{patient.fullName}</p>
                          <p className="text-gray-500">{patient.phone}</p>
                        </td>
                        <td className="text-center py-6">
                          <span className={`inline-block px-6 py-3 rounded-full font-bold text-white text-sm shadow-md ${
                            patient.priority === 'Emergency' ? 'bg-red-500' :
                            patient.priority === 'Urgent' ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {patient.priority === 'Emergency' ? 'Khẩn cấp' :
                             patient.priority === 'Urgent' ? 'Ưu tiên' : 'Bình thường'}
                          </span>
                        </td>
                        <td className="text-center text-lg py-6 text-gray-700">
                          {new Date(patient.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="text-center py-6">
                          <button
                            onClick={() => callPatient(patient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition shadow-xl flex items-center gap-3 mx-auto"
                          >
                            <PhoneCall className="w-8 h-8" />
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

        {/* CỘT PHẢI: ĐANG KHÁM (4/12) */}
        <div className="lg:col-span-4">
          {currentPatient ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl p-10 text-white h-full flex flex-col">
              <h3 className="text-4xl font-black mb-8 text-center">Đang khám</h3>
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className="text-9xl font-black drop-shadow-2xl">{currentPatient.queueNumber}</div>
                <div className="text-4xl font-bold text-center px-4">{currentPatient.fullName}</div>
                <div className="text-xl opacity-90">
                  Vào phòng lúc: {currentPatient.startTime?.slice(11, 16) || '--:--'}
                </div>
                {currentPatient.symptoms && (
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 text-center max-w-xs">
                    <p className="text-lg leading-relaxed">{currentPatient.symptoms}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4 mt-8">
                <button className="w-full bg-white text-teal-600 py-5 rounded-2xl font-black text-2xl hover:bg-gray-100 transition shadow-xl">
                  Tạo hồ sơ khám
                </button>
                <button
                  onClick={() => openCompleteDialog(currentPatient)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-2xl transition shadow-2xl flex items-center justify-center gap-4"
                >
                  <CheckCircle className="w-10 h-10" />
                  Hoàn thành khám
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-56 h-56 mb-10 mx-auto" />
              <h2 className="text-5xl font-bold text-gray-700 mb-4">Chưa có bệnh nhân</h2>
              <p className="text-2xl text-gray-600">Nhấn "Gọi bệnh" để bắt đầu khám</p>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG XÁC NHẬN HOÀN THÀNH */}
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