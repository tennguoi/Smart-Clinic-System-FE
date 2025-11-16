import { Users , CalendarDays, FileText, Cloud, UserCircle, Shield } from "lucide-react";

const menuItems = [

  { id: "appointments", label: "Quản lý lịch hẹn", icon: CalendarDays },
{ id: "records", label: "Danh sách bệnh nhân", icon: Users  },
  { id: "invoices", label: "Hóa đơn", icon: FileText },
  { id: "profile", label: "Hồ sơ cá nhân", icon: UserCircle },
  { id: "security", label: "Bảo mật", icon: Shield },
];

export default function ReceptionSidebar({ activeMenu, onMenuChange }) {
  return (
    <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <Cloud className="w-8 h-8" />
        <h1 className="text-xl font-semibold">Reception Panel</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 border-r-4 border-white text-white"
                  : "text-blue-200 hover:bg-blue-900/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
