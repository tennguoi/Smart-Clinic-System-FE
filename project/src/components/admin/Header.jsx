import { Search, Bell, User, LogOut, User2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, authRoleUtils } from '../../services/authService';
import axiosInstance from '../../utils/axiosConfig';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    roles: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = authService.getToken();
  const user = authService.getUserInfo() || {};
  const userRole = authService.getRoles()?.[0] || 'User';

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Lấy thông tin từ localStorage trước
    const storedUser = authService.getUserInfo();
    const storedRoles = authService.getRoles();
    
    if (storedUser && storedUser.fullName) {
      // Nếu đã có thông tin trong localStorage, dùng luôn
      setUserData({
        fullName: storedUser.fullName || '',
        email: storedUser.email || '',
        roles: storedRoles,
      });
    }
    // Không cần fetch lại từ server vì thông tin đã được lưu khi login
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      const { data } = await axiosInstance.post('/api/auth/logout');
      if (data?.success) {
        authService.logout();
        navigate('/login');
      } else {
        console.error('Đăng xuất thất bại:', data?.message);
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 ml-6">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative flex items-center gap-3 pl-6 border-l border-gray-200">
          {loading ? (
            <span className="text-gray-700">Đang tải...</span>
          ) : (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
              >
                <User className="w-6 h-6 text-white" />
              </button>
              <span className="font-medium text-gray-700">
                {userData.fullName || 'User'} 
              </span>
            </>
          )}

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <User2 className="w-5 h-5" />
                <span>Hồ Sơ</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}