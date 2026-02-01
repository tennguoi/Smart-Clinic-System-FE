import { User, Mail, Phone, Calendar, MapPin, Loader, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext'; // ← Thêm import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const getPhotoSrc = (photoUrl) => {
  if (!photoUrl) return '';
  if (photoUrl.startsWith('http')) return photoUrl;
  const normalized = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return `${API_BASE_URL}${normalized}`;
};

export default function ProfileSection({
  fullName,
  email,
  phone,
  dateOfBirth,
  gender,
  address,
  photoUrl,
  onPhotoChange,
  onChange,
  isLoading = false,
  isViewMode = false,
  onSwitchToEdit,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme(); // ← Thêm hook

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-sm border p-6 ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {t('profilepage.personal_info_title')}
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              {t('profilepage.loading_personal_info')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-sm border p-6 ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {t('profilepage.personal_info_title')}
        </h2>
        {isViewMode && onSwitchToEdit && (
          <button
            onClick={onSwitchToEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" />
            {t('profilepage.edit')}
          </button>
        )}
      </div>

      {/* Avatar & Name Section */}
      <div className={`flex items-start gap-6 mb-6 pb-6 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="relative">
          <div className={`w-24 h-24 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            {photoUrl ? (
              <img
                src={getPhotoSrc(photoUrl)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className={`w-12 h-12 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
            )}
          </div>
          {!isViewMode && (
            <button
              onClick={onPhotoChange}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
              title={t('profilepage.change_avatar')}
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <h3 className={`text-lg font-medium mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {fullName || t('profilepage.no_name_yet')}
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {email}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <User className="w-4 h-4 inline mr-2" />
            {t('profilepage.full_name')}
          </label>
          <input
            type="text"
            value={fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            disabled={isViewMode}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
            }`}
            placeholder={t('profilepage.enter_full_name')}
          />
        </div>

        {/* Email (Disabled) */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={email || ''}
            disabled
            className={`w-full px-4 py-2 border rounded-lg cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-500'
                : 'bg-gray-50 border-gray-300 text-gray-500'
            }`}
          />
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {t('profilepage.email_cannot_change')}
          </p>
        </div>

        {/* Phone & Date of Birth */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Phone className="w-4 h-4 inline mr-2" />
              {t('profilepage.phone')}
            </label>
            <input
              type="tel"
              value={phone || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  onChange('phone', value);
                }
              }}
              disabled={isViewMode}
              maxLength="10"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
              placeholder={t('profilepage.phone_placeholder')}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              {t('profilepage.date_of_birth')}
            </label>
            <input
              type="date"
              value={dateOfBirth || ''}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              disabled={isViewMode}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-800'
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {t('profilepage.gender')}
          </label>
          <div className="flex gap-6">
            {['male', 'female', 'other'].map((option) => (
              <label
                key={option}
                className={`flex items-center ${
                  isViewMode ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={(e) => onChange('gender', e.target.value)}
                  disabled={isViewMode}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={`ml-2 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {t(`profilepage.gender_${option}`)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <MapPin className="w-4 h-4 inline mr-2" />
            {t('profilepage.address')}
          </label>
          <textarea
            value={address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={isViewMode}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
            }`}
            placeholder={t('profilepage.enter_address')}
          />
        </div>
      </div>
    </div>
  );
}