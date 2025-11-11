import { Bell, Stethoscope, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header({ onLogout, fullName }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Bảng điều khiển Bác sĩ</h2>
      </div>

      <div className="flex items-center gap-4" ref={menuRef}>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-semibold uppercase">
            {(fullName || 'Doctor').slice(0, 2)}
          </div>
          <span className="font-medium text-gray-700 group-hover:text-gray-900">{fullName || 'Doctor'}</span>
        </button>

        {open && (
          <div className="absolute right-8 top-16 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-100">
            
            </div>
            <div className="p-2">
              <button
                onClick={onLogout}
                className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


