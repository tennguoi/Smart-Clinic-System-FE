import React from 'react';
import { authService } from '../services/authService';
import LogoutButton from '../components/LogoutButton';

const DoctorPage = () => {
  const userInfo = authService.getUserInfo();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Trang Bác Sĩ
            </h1>
            <LogoutButton />
          </div>
          <div className="mb-6">
            <p className="text-gray-600">
              Xin chào, <span className="font-semibold text-blue-600">{userInfo?.fullName}</span>
            </p>
            <p className="text-sm text-gray-500">Email: {userInfo?.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                Lịch Khám Hôm Nay
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Bệnh nhân đang chờ</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Đã Khám
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Bệnh nhân trong tuần</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-800 mb-2">
                Lịch Hẹn
              </h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-2">Lịch hẹn sắp tới</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Chức Năng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Xem Danh Sách Bệnh Nhân
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                Lịch Khám Hôm Nay
              </button>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                Kê Đơn Thuốc
              </button>
              <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition">
                Lịch Sử Khám Bệnh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
