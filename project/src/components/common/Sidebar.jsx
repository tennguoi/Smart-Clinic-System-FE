// src/components/common/Sidebar.jsx   ← Đặt đúng đường dẫn này

import { Cloud } from 'lucide-react';
import React from 'react';

const Sidebar = ({ 
  title = "HealthCare", 
  menuItems, 
  activeMenu, 
  onMenuChange,
  logo: LogoIcon = Cloud   // đổi tên cho rõ nghĩa
}) => {
  return (
    <aside className="w-80 bg-[#1e3a5f] text-white flex flex-col shadow-xl h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        {/* FIX: dùng như component bình thường, KHÔNG gọi () */}
        <LogoIcon className="w-8 h-8" />
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 text-lg ${
                isActive
                  ? 'bg-blue-600 border-r-4 border-white font-bold shadow-lg'
                  : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;