import { useState, useEffect } from 'react';
import { Stethoscope, Mail, Phone, User } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import CountBadge from '../common/CountBadge';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      // Lấy tất cả users rồi filter theo role DOCTOR
      const response = await axiosInstance.get('/api/admin/users');
      const allUsers = response.data || [];
      const doctorList = allUsers.filter(user => 
        user.roles && user.roles.some(role => role.name === 'ROLE_DOCTOR')
      );
      setDoctors(doctorList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách bác sĩ');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http')) return photoUrl;
    return `http://localhost:8082${photoUrl}`;
  };

  const formatRoles = (roles) => {
    if (!roles || roles.length === 0) return 'N/A';
    return roles.map(role => role.name.replace('ROLE_', '')).join(', ');
  };

  return (
    <div className="px-8 pt-4 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Stethoscope className="w-9 h-9 text-blue-600" />
            <span>Quản Lý Bác Sĩ</span>
          </h1>
          <CountBadge 
            currentCount={doctors.length} 
            totalCount={doctors.length} 
            label="bác sĩ" 
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có bác sĩ nào trong hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-24"></div>
              
              <div className="relative px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                    {getAvatarUrl(doctor.photoUrl) ? (
                      <img
                        src={getAvatarUrl(doctor.photoUrl)}
                        alt={doctor.fullName || 'Ảnh bác sĩ'}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                        <Stethoscope className="w-10 h-10 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {doctor.fullName || 'N/A'}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-2">
                    <Stethoscope className="w-4 h-4" />
                    <span className="font-medium">{formatRoles(doctor.roles)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {/* Username */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Username:</span>
                    <span>{doctor.username}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{doctor.email || 'N/A'}</span>
                  </div>

                  {/* Phone */}
                  {doctor.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">SĐT:</span>
                      <span>{doctor.phoneNumber}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-500 text-xs">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doctor.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
