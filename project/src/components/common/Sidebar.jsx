// src/components/common/Sidebar.jsx
import { Cloud, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';

const Sidebar = ({ 
  title = "HealthCare", 
  menuItems, 
  activeMenu: propActiveMenu,
  onMenuChange,
  logo: LogoIcon = Cloud
}) => {
  const { theme } = useTheme();
  const sidebarRef = useRef(null);

  // ✅ react-responsive
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Desktop luôn mở sidebar
  useEffect(() => {
    if (isDesktop) {
      setIsCollapsed(false);
    }
  }, [isDesktop]);

  // ✅ Click outside để thu nhỏ – CHỈ MOBILE
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isCollapsed
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, isMobile]);

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
        
        <LogoIcon className={`w-10 h-10 text-blue-300 ${isCollapsed ? 'hidden lg:block' : 'block'}`} />
        <h1 className={`text-2xl font-bold tracking-tight ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
          {title}
        </h1>
        
        {/* Toggle – CHỈ MOBILE & COLLAPSED */}
        {isCollapsed && isMobile && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mx-auto p-2 rounded-lg hover:bg-blue-800/50 transition-all duration-200"
            title="Mở rộng"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav 
        className="flex-1 py-4 overflow-y-auto"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
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
                // ✅ Mobile: click item thì mở sidebar
                if (isCollapsed && isMobile) {
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
              <div className={`absolute inset-0 bg-white/10 ${isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} transition-opacity`} />
              
              <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} flex-shrink-0`} />
              
              <span className={`relative z-10 tracking-wide whitespace-nowrap ${isCollapsed ? 'hidden lg:block' : 'block'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
