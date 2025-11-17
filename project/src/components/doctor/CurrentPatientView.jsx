// src/components/doctor/CurrentPatientView.jsx
import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Heart, Clock, AlertCircle } from 'lucide-react';

export default function CurrentPatientView() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8082/api/doctor/current-patient', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        } else {
          setPatient(null);
        }
      } catch (err) {
        console.error(err);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
    const interval = setInterval(fetchPatient, 5000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  if (loading) return <div className="text-center py-20 text-2xl text-gray-600">Đang tải...</div>;

  if (!patient) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-40 h-40 mx-auto mb-8" />
        <h2 className="text-4xl font-bold text-gray-700">Chưa có bệnh nhân</h2>
        <p className="text-xl text-gray-600 mt-4">Vui lòng chờ lễ tân phân bệnh nhân</p>
      </div>
    );
  }

  const priorityColor = {
    'Khẩn cấp': 'bg-red-100 text-red-800 border-red-300',
    'Ưu tiên': 'bg-orange-100 text-orange-800 border-orange-300',
  }[patient.priority] || 'bg-green-100 text-green-800 border-green-300';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-900">BỆNH NHÂN ĐANG KHÁM</h1>
        <p className="text-xl text-gray-600 mt-3">
          Tự động cập nhật • {currentTime.toLocaleTimeString('vi-VN')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 text-center">
              <div className="text-9xl font-bold">{patient.queueNumber}</div>
              <p className="text-3xl mt-4">Số thứ tự</p>
            </div>

            <div className="p-10">
              <div className="flex items-center gap-8 mb-10">
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-36 h-36 flex items-center justify-center">
                  <User className="w-20 h-20 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-5xl font-bold text-gray-800">{patient.fullName}</h2>
                  <div className="flex gap-6 mt-4 text-xl text-gray-600">
                    <span>{patient.dob}</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-lg">
                <div className="flex items-center gap-4">
                  <Phone className="w-7 h-7 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Số điện thoại</p>
                    <p className="font-bold text-xl">{patient.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Heart className="w-7 h-7 text-red-600" />
                  <div>
                    <p className="text-gray-500">Ưu tiên</p>
                    <span className={`inline-block px-5 py-2 rounded-full font-bold border ${priorityColor}`}>
                      {patient.priority || 'Bình thường'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Clock className="w-7 h-7 text-green-600" />
                  <div>
                    <p className="text-gray-500">Vào phòng lúc</p>
                    <p className="font-bold text-2xl">
                      {patient.startTime?.slice(11, 16) || '--:--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <AlertCircle className="w-7 h-7 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-bold">
                      {patient.checkInTime?.slice(11, 16) || '--:--'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-8 border border-emerald-300">
            <h3 className="text-2xl font-bold text-emerald-800">Sẵn sàng!</h3>
            <p className="text-emerald-700 mt-3">Bệnh nhân đã vào phòng khám</p>
          </div>
        </div>
      </div>
    </div>
  );
}