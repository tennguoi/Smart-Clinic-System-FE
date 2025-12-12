// src/components/common/Sidebar.jsx – MOBILE: THU NHỎ/MỞ RỘNG, DESKTOP: LUÔN HIỆN ĐẦY ĐỦ!
import { Cloud, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';

const Sidebar = ({ 
  title = "HealthCare", 
  menuItems, 
  activeMenu: propActiveMenu,
  onMenuChange,
  logo: LogoIcon = Cloud
}) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  // Click outside để thu nhỏ - CHỈ TRÊN MOBILE
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Chỉ áp dụng trên mobile (màn hình < 1024px)
      if (window.innerWidth < 1024) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !isCollapsed) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

  return (
    <aside 
      ref={sidebarRef}
      className={`
        ${isCollapsed ? 'w-20 lg:w-80' : 'w-80'}
        ${theme === 'dark' ? 'bg-gray-900 border-r border-gray-700' : 'bg-[#1e3a5f]'} 
        text-white flex flex-col shadow-2xl h-screen sticky top-0 z-50 transition-all duration-300
      `}
    >
      {/* Header */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center lg:gap-3' : 'gap-3'} ${theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-blue-900'} flex-shrink-0 transition-colors duration-300`}>
        {/* Desktop: luôn hiện, Mobile: ẩn khi collapsed */}
        <LogoIcon className={`w-10 h-10 text-blue-300 ${isCollapsed ? 'hidden lg:block' : 'block'}`} />
        <h1 className={`text-2xl font-bold tracking-tight ${isCollapsed ? 'hidden lg:block' : 'block'}`}>{title}</h1>
        
        {/* Toggle Button - CHỈ HIỆN KHI COLLAPSED TRÊN MOBILE, ẨN TRÊN DESKTOP */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="lg:hidden mx-auto p-2 rounded-lg hover:bg-blue-800/50 transition-all duration-200"
            title="Mở rộng"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Menu – BỎ THANH KÉO + IN ĐẬM SIÊU ĐẸP */}
      <nav 
        className="flex-1 py-4 overflow-y-auto"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        <style jsx>{`
          nav::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = propActiveMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onMenuChange?.(item.id);
                // Mở rộng khi click item ở mobile collapsed
                if (isCollapsed && window.innerWidth < 1024) {
                  setIsCollapsed(false);
                }
              }}
              className={`
                w-full flex items-center ${isCollapsed ? 'justify-center px-2 lg:gap-4 lg:px-6' : 'gap-4 px-6'} py-4 
                text-left text-lg font-medium transition-all duration-300
                relative overflow-hidden group
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-2xl border-r-4 border-white' 
                  : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              {/* Hiệu ứng nền nhẹ */}
              <div className={`absolute inset-0 bg-white/10 ${isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} transition-opacity`} />
              
              <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} flex-shrink-0`} />
              
              {/* Desktop: luôn hiện text, Mobile: ẩn khi collapsed */}
              <span className={`relative z-10 tracking-wide whitespace-nowrap ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer - Desktop: luôn hiện, Mobile: ẩn khi collapsed */}
      <div className={`p-4 ${theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-blue-900'} flex-shrink-0 transition-colors duration-300 ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        <p className="text-xs text-blue-300 text-center">© 2025 HealthCare System</p>
      </div>
    </aside>
  );
};

export default Sidebar;