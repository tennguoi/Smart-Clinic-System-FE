import Header from '../components/doctor/Header';
import Sidebar from '../components/doctor/Sidebar';
import RevenueTable from '../components/doctor/RevenueTable';

export default function DoctorManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 space-y-8">
          <RevenueTable />
        </main>
      </div>
    </div>
  );
}


