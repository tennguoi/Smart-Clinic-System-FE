// src/components/AdminPage.jsx
import Header from '../components/admin/Header';
import Sidebar from '../components/admin/Sidebar';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Page content – trống, sạch, mượt */}
        <main className="flex-1 p-8">
          {/* Có thể thêm nội dung sau này */}
        </main>
      </div>
    </div>
  );
}
