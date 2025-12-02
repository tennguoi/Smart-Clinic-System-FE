// src/components/common/Header.jsx
import { Search, Bell, User2, Shield, LogOut, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Thêm hook dịch
import { authService } from '../../services/authService';
import axiosInstance from '../../utils/axiosConfig';

// Import LanguageSwitcher hoặc viết trực tiếp (ở đây mình gộp luôn cho gọn)
import LanguageSwitcher from '../LanguageSwitcher'; // Nếu bạn muốn tách riêng

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(); // Hook dịch
  const user = authService.getUserInfo() || {};
  const fullName = user.fullName || t('header.defaultName') || 'Người dùng';
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
        {/* Thanh tìm kiếm (nếu cần sau này thì mở) */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            {/* <input type="text" placeholder={t('common.search')} ... /> */}
          </div>
        </div>

        {/* Right side: Notification + Language + Avatar */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notification */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Switcher - ĐÃ DỊCH HOÀN TOÀN */}
          <LanguageSwitcher />

          {/* Avatar Dropdown */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-gray-800">{fullName}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
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
                    <span className="font-medium">{t('header.profile', 'Hồ Sơ Cá Nhân')}</span>
                  </button>

                 

                  <div className="border-t border-gray-200 my-2 mx-4"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('header.logout', 'Đăng Xuất')}</span>
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