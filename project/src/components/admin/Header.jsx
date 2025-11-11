import { Search, Bell, User, LogOut, User2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    roles: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.roles?.[0] || 'User';

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetch('http://localhost:8082/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Lỗi khi lấy thông tin người dùng');
          return res.json();
        })
        .then((data) => {
          if (data.userId) {
            setUserData({
              fullName: data.fullName || '',
              email: data.email || '',
              roles: data.roles || [],
            });
            localStorage.setItem('user', JSON.stringify(data));
          }
        })
        .catch((err) => {
          console.error('Lỗi lấy thông tin người dùng:', err);
          if (err.message.includes('401')) {
            localStorage.removeItem('token');
            localStorage.setItem('user', JSON.stringify({}));
            navigate('/login');
          }
        })
        .finally(() => setLoading(false));
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify({}));
        navigate('/login');
      } else {
        console.error('Đăng xuất thất bại:', data.message);
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