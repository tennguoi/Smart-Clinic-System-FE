

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
const ROLES_KEY = 'user_roles';

const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return null;
  const upper = role.toUpperCase();
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
};

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map(normalizeRole)
    .filter((role, index, array) => role && array.indexOf(role) === index);
};

export const authService = {
  login: (token, userInfo, roles) => {
    const normalizedRoles = normalizeRoles(roles);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    localStorage.setItem(ROLES_KEY, JSON.stringify(normalizedRoles));
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLES_KEY);
  },
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUserInfo: () => {
    const userInfo = localStorage.getItem(USER_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },
  getRoles: () => {
    const roles = localStorage.getItem(ROLES_KEY);
    return normalizeRoles(roles ? JSON.parse(roles) : []);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
  hasRole: (role) => {
    const roles = authService.getRoles();
    const target = normalizeRole(role);
    return target ? roles.includes(target) : false;
  },
  hasAnyRole: (rolesList) => {
    const userRoles = authService.getRoles();
    return rolesList
      .map(normalizeRole)
      .filter(Boolean)
      .some(role => userRoles.includes(role));
  },

  getDefaultRoute: () => {
    const roles = authService.getRoles();
    if (roles.includes('ROLE_ADMIN')) {
      return '/admin';
    } else if (roles.includes('ROLE_BAC_SI')) {
      return '/doctor';
    } else if (roles.includes('ROLE_TIEP_TAN')) {
      return '/reception';
    }
    return '/';
  }
};

// Xuất thêm các helper nếu cần sử dụng bên ngoài
export const authRoleUtils = {
  normalizeRole,
  normalizeRoles,
};
