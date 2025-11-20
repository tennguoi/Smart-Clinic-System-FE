// src/components/common/Sidebar.jsx – BỎ THANH KÉO HOÀN TOÀN TRONG CODE, IN ĐẬM NHƯ DOCTOR, ĐẸP VL!
import { Cloud } from 'lucide-react';

const Sidebar = ({ 
  title = "HealthCare", 
  menuItems, 
  activeMenu: propActiveMenu,
  onMenuChange,
  logo: LogoIcon = Cloud
}) => {

  return (
    <aside className="w-80 bg-[#1e3a5f] text-white flex flex-col shadow-2xl h-screen sticky top-0 z-50">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-blue-900 flex-shrink-0">
        <LogoIcon className="w-10 h-10 text-blue-300" />
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      {/* Menu – BỎ THANH KÉO BẰNG STYLE TRỰC TIẾP + IN ĐẬM SIÊU ĐẸP */}
      <nav 
        className="flex-1 py-4 overflow-y-auto"
        style={{
          msOverflowStyle: 'none',           /* IE & Edge */
          scrollbarWidth: 'none',            /* Firefox */
          WebkitScrollbar: { display: 'none' } /* Chrome/Safari – fake để không lỗi */
        }}
      >
        <div style={{ 
          /* Fix cho Chrome/Safari – bắt buộc phải có cái này */
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none !important;
            }
          `}</style>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = propActiveMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onMenuChange?.(item.id)}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 
                  text-left text-lg font-medium transition-all duration-300
                  relative overflow-hidden group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-2xl border-r-4 border-white translate-x-2' 
                    : 'text-blue-100 hover:bg-blue-900/60 hover:text-white hover:translate-x-1'
                  }
                `}
              >
                {/* Hiệu ứng nền nhẹ */}
                <div className={`absolute inset-0 bg-white/10 ${isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'} transition-opacity`} />
                
                <Icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-900 flex-shrink-0">
        <p className="text-xs text-blue-300 text-center">© 2025 HealthCare System</p>
      </div>
    </aside>
  );
};

export default Sidebar;