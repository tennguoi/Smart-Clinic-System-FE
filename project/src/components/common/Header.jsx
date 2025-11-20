// src/components/common/Header.jsx
import { Search, Bell, User2, Shield, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import axiosInstance from '../../utils/axiosConfig';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = authService.getUserInfo() || {};
  const fullName = user.fullName || 'Người dùng';
  const email = user.email || '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, lịch hẹn..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Thông báo + Avatar */}
        <div className="flex items-center gap-6 ml-8">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* Avatar Dropdown */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{fullName}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="font-medium text-gray-800">{fullName}</p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <User2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Hồ Sơ Cá Nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/security');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Bảo Mật & 2FA</span>
                  </button>

                  <div className="border-t border-gray-200 my-2 mx-4"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}