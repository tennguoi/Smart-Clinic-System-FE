// src/components/common/Header.jsx
import { Search, Bell, User2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import axiosInstance from '../../utils/axiosConfig';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user = authService.getUserInfo() || {};
  const fullName = user.fullName || t('header.defaultName', 'Người dùng');
  const email = user.email || '';

  // Đóng dropdown khi click ngoài
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Thanh tìm kiếm (ẩn tạm) */}
        <div className="flex-1 max-w-xl"></div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Avatar Dropdown */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {fullName.slice(0, 2).toUpperCase()}
              </div>

              <div className="text-left hidden md:block">
                <p className="font-semibold text-gray-800 dark:text-white">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
              </div>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <p className="font-medium text-gray-800 dark:text-white">{fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                  >
                    <User2 className="w-5 h-5" />
                    <span>{t('header.profile', 'Hồ sơ cá nhân')}</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-4"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600 dark:text-red-400 font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('header.logout', 'Đăng xuất')}</span>
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