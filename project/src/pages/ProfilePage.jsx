import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext'; // ← Thêm import
import ProfileManager from '../components/common/ProfileManager';
import SecurityManager from '../components/common/SecurityManager';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { theme } = useTheme(); // ← Thêm hook
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const user = authService.getUserInfo() || {};

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Header */}
      <div className={`border-b shadow-sm px-8 py-4 ${theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }`}>
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition-colors ${theme === 'dark'
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('profilepage.back')}</span>
          </button>

          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {t('profilepage.settings')}
          </h1>

          <div className="w-40"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark'
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
          }`}>
          {/* Tabs */}
          <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'profile'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('profilepage.personal_info')}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'security'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('profilepage.security')}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && <ProfileManager initialData={user} />}
          {activeTab === 'security' && <SecurityManager initialData={user} />}
        </div>
      </div>
    </div>
  );
}