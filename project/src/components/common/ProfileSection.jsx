import { User, Mail, Phone, Calendar, MapPin, Loader, Edit } from 'lucide-react';

export default function ProfileSection({ fullName, email, phone, dateOfBirth, gender, address, photoUrl, onPhotoChange, onChange, isLoading = false, isViewMode = false, onSwitchToEdit }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông Tin Cá Nhân</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Đang tải thông tin cá nhân...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Thông Tin Cá Nhân</h2>
        {isViewMode && onSwitchToEdit && (
          <button
            onClick={onSwitchToEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit className="w-4 h-4" /> Chỉnh sửa
          </button>
        )}
      </div>

      <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            {photoUrl ? (
              <img src={`http://localhost:8082${photoUrl}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          {!isViewMode && (
            <button
              onClick={onPhotoChange}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{fullName || 'Chưa có tên'}</h3>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Tên đầy đủ
          </label>
          <input
            type="text"
            value={fullName || ''}
            onChange={(e) => onChange('fullName', e.target.value)}
            disabled={isViewMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Nhập tên đầy đủ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={email || ''}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Chỉ cho phép số
                if (value.length <= 10) {
                  onChange('phone', value);
                }
              }}
              disabled={isViewMode}
              maxLength="10"
              pattern="[0-9]{10}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="0xxxxxxxxx (10 số)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Ngày sinh
            </label>
            <input
              type="date"
              value={dateOfBirth || ''}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              disabled={isViewMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
          <div className="flex gap-4">
            {['male', 'female', 'other'].map((option) => (
              <label key={option} className={`flex items-center ${isViewMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={gender === option}
                  onChange={(e) => onChange('gender', e.target.value)}
                  disabled={isViewMode}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option === 'male' ? 'Nam' : option === 'female' ? 'Nữ' : 'Khác'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Địa chỉ
          </label>
          <textarea
            value={address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={isViewMode}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Nhập địa chỉ của bạn"
          />
        </div>
      </div>
    </div>
  );
}