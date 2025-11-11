import { useState } from "react";
import { Bell, LogOut, User, Stethoscope } from "lucide-react";
 
export default function ReceptionHeader({ onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
 
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      {/* Tiêu đề */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Trang lễ tân</h2>
      </div>
 
      {/* Khu bên phải */}
      <div className="flex items-center gap-6 relative">
        {/* Icon chuông thông báo */}
        <div className="relative cursor-pointer">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
 
        {/* Avatar + tên người dùng */}
        <div
          onClick={() => setShowMenu((prev) => !prev)}
          className="flex items-center gap-3 pl-6 border-l border-gray-200 cursor-pointer select-none"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-700">Receptionist</span>
        </div>
 
        {/* Dropdown menu (ẩn/hiện khi click) */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-3 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
 
 