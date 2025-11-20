// src/pages/SecurityPage.jsx
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SecurityManager from '../components/common/SecurityManager';
import { authService } from '../services/authService';

export default function SecurityPage() {
  const navigate = useNavigate();
  const user = authService.getUserInfo() || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Cài Đặt Bảo Mật</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <SecurityManager initialData={user} />
      </div>
    </div>
  );
}