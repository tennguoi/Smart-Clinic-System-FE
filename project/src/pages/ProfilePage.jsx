import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProfileManager from '../components/common/ProfileManager';
import SecurityManager from '../components/common/SecurityManager';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const user = authService.getUserInfo() || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Cài Đặt</h1>
          <div className="w-40"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Thông Tin Cá Nhân
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
              Bảo Mật
            </button>
          </div>

          {activeTab === 'profile' && <ProfileManager initialData={user} />}
          {activeTab === 'security' && <SecurityManager initialData={user} />}
        </div>
      </div>
    </div>
  );
}