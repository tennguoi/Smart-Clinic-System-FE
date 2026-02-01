import React from 'react';
import { authService } from '../services/authService';
const UserInfo = ({ showRoles = true, className = '' }) => {
  const userInfo = authService.getUserInfo();
  const roles = authService.getRoles();

  if (!userInfo) {
    return null;
  }
  const roleDisplayNames = {
    'ROLE_ADMIN': 'Quản trị viên',
    'ROLE_BAC_SI': 'Bác sĩ',
    'ROLE_TIEP_TAN': 'Tiếp tân',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {userInfo.fullName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">
          {userInfo.fullName}
        </span>
        {showRoles && roles.length > 0 && (
          <span className="text-xs text-gray-500">
            {roles.map(role => roleDisplayNames[role] || role).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
