# Hướng Dẫn Hệ Thống Đăng Nhập Và Phân Quyền

## Tổng Quan

Hệ thống đăng nhập đã được cấu hình với phân quyền dựa trên role của người dùng. Sau khi đăng nhập thành công, người dùng sẽ được điều hướng đến trang tương ứng với quyền của họ.

## Cấu Trúc Phân Quyền

### Các Role Trong Hệ Thống

1. **ROLE_ADMIN** - Quản trị viên
   - Có quyền truy cập: `/admin/*`
   - Có thể truy cập tất cả các trang khác

2. **ROLE_BAC_SI** - Bác sĩ
   - Có quyền truy cập: `/doctor/*`
   - Backend API: `/api/doctor/**`

3. **ROLE_TIEP_TAN** - Tiếp tân
   - Có quyền truy cập: `/reception/*`
   - Backend API: `/api/appointments/**`

## Luồng Đăng Nhập

### 1. Người Dùng Nhập Thông Tin
- Email
- Password

### 2. Backend Xác Thực
- Kiểm tra email và password
- Nếu đúng, trả về:
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "Tên người dùng",
    "token": "JWT_TOKEN",
    "roles": ["ROLE_ADMIN", "ROLE_BAC_SI"],
    "message": "Login successful"
  }
  ```

### 3. Frontend Lưu Thông Tin
- Token được lưu vào `localStorage` với key `auth_token`
- Thông tin user được lưu vào `localStorage` với key `user_info`
- Roles được lưu vào `localStorage` với key `user_roles`

### 4. Điều Hướng Tự Động
Dựa trên role, người dùng được điều hướng đến:
- **ROLE_ADMIN** → `/admin`
- **ROLE_BAC_SI** → `/doctor`
- **ROLE_TIEP_TAN** → `/reception`
- **Không có role** → `/` (trang chủ)

## Các File Quan Trọng

### 1. authService.js
```javascript
// Quản lý token và roles
- login(token, userInfo, roles)
- logout()
- getToken()
- getUserInfo()
- getRoles()
- isAuthenticated()
- hasRole(role)
- hasAnyRole(rolesList)
- getDefaultRoute()
```

### 2. axiosConfig.js
```javascript
// Tự động thêm token vào header của mọi request
// Xử lý lỗi 401 (Unauthorized)
```

### 3. ProtectedRoute.jsx
```javascript
// Bảo vệ các route yêu cầu authentication
// Kiểm tra role của user
<ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
  <AdminPage />
</ProtectedRoute>
```

### 4. Login.jsx
```javascript
// Xử lý đăng nhập
// Lưu token và roles
// Điều hướng dựa trên role
```

## Cách Sử Dụng

### Kiểm Tra Đăng Nhập
```javascript
import authService from '../services/authService';

if (authService.isAuthenticated()) {
  // User đã đăng nhập
}
```

### Lấy Thông Tin User
```javascript
const userInfo = authService.getUserInfo();
console.log(userInfo.fullName);
console.log(userInfo.email);
```

### Kiểm Tra Role
```javascript
// Kiểm tra một role cụ thể
if (authService.hasRole('ROLE_ADMIN')) {
  // User là admin
}

// Kiểm tra nhiều roles
if (authService.hasAnyRole(['ROLE_ADMIN', 'ROLE_BAC_SI'])) {
  // User là admin hoặc bác sĩ
}
```

### Đăng Xuất
```javascript
import LogoutButton from '../components/LogoutButton';

// Sử dụng component
<LogoutButton />

// Hoặc gọi trực tiếp
authService.logout();
navigate('/login');
```

### Gọi API Với Token
```javascript
import axiosInstance from '../utils/axiosConfig';

// Token tự động được thêm vào header
const response = await axiosInstance.get('/api/admin/users');
```

## Bảo Mật

### Backend (SecurityConfig.java)
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/public/**").permitAll()
    .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
    .requestMatchers("/api/doctor/**").hasAnyAuthority("ROLE_BAC_SI", "ROLE_ADMIN")
    .requestMatchers("/api/appointments/**").hasAnyAuthority("ROLE_TIEP_TAN", "ROLE_ADMIN")
    .anyRequest().authenticated()
);
```

### Frontend (App.jsx)
```javascript
// Admin route - chỉ ROLE_ADMIN
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
    <AdminPage />
  </ProtectedRoute>
} />

// Doctor route - ROLE_BAC_SI và ROLE_ADMIN
<Route path="/doctor/*" element={
  <ProtectedRoute allowedRoles={['ROLE_BAC_SI', 'ROLE_ADMIN']}>
    <DoctorPage />
  </ProtectedRoute>
} />

// Reception route - ROLE_TIEP_TAN và ROLE_ADMIN
<Route path="/reception/*" element={
  <ProtectedRoute allowedRoles={['ROLE_TIEP_TAN', 'ROLE_ADMIN']}>
    <ReceptionPage />
  </ProtectedRoute>
} />
```

## Xử Lý Lỗi

### Token Hết Hạn
- Khi token hết hạn (401), axios interceptor tự động:
  1. Xóa token khỏi localStorage
  2. Chuyển hướng về trang login

### Không Có Quyền Truy Cập
- Khi user không có quyền truy cập một route:
  1. ProtectedRoute kiểm tra role
  2. Chuyển hướng về trang mặc định của user

## Testing

### Test Đăng Nhập
1. Tạo user với role khác nhau trong database
2. Đăng nhập với từng user
3. Kiểm tra điều hướng đúng trang

### Test Phân Quyền
1. Đăng nhập với user có role ROLE_BAC_SI
2. Thử truy cập `/admin` → Sẽ bị chuyển về `/doctor`
3. Thử truy cập `/doctor` → Thành công

### Test Token
1. Đăng nhập thành công
2. Xóa token trong localStorage
3. Reload trang → Sẽ bị chuyển về `/login`

## Lưu Ý

1. **Token được lưu trong localStorage** - Không an toàn tuyệt đối với XSS attacks
2. **Token nên có thời gian hết hạn** - Backend cần cấu hình JWT expiration
3. **HTTPS** - Nên sử dụng HTTPS trong production
4. **Refresh Token** - Có thể implement refresh token để tăng bảo mật
5. **2FA** - Backend đã hỗ trợ 2FA, có thể enable khi cần

## Troubleshooting

### Lỗi: "Đăng nhập thất bại"
- Kiểm tra email và password
- Kiểm tra backend có đang chạy không (localhost:8082)
- Kiểm tra CORS configuration

### Lỗi: "Token không hợp lệ"
- Token có thể đã hết hạn
- Đăng xuất và đăng nhập lại

### Lỗi: Không điều hướng đúng trang
- Kiểm tra roles trong localStorage
- Kiểm tra console.log trong Login.jsx
- Kiểm tra authService.getDefaultRoute()
