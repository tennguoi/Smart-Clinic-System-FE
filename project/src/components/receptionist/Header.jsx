import { LogOut, User } from 'lucide-react';

export default function ReceptionHeader({ onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700">Trang lễ tân</h2>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-700">Receptionist</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
