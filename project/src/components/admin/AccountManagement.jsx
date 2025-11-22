import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Edit, Trash2, X, Eye, EyeOff, User, Upload,
  CheckCircle, AlertTriangle, Power, AlertCircle
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminAccountApi from '../../api/adminAccountApi';
import React, { forwardRef } from 'react';

// ====================== HELPER ======================
const dateStringToDate = (dateStr) => {
  if (!dateStr || dateStr.includes('/')) return null;
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

const dateToISOString = (date) => {
  if (!date || isNaN(date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const roleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'bac_si', label: 'Bác sĩ' },
  { value: 'tiep_tan', label: 'Tiếp tân' },
];

const genderOptions = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const getRoleLabel = (role) => {
  const map = { admin: 'Quản trị viên', bac_si: 'Bác sĩ', tiep_tan: 'Tiếp tân' };
  return map[role] || role;
};

const getGenderLabel = (gender) => {
  const map = { male: 'Nam', female: 'Nữ', other: 'Khác' };
  return map[gender] || 'Không rõ';
};

const getAvatarUrl = (photoUrl) => {
  if (!photoUrl) return null;
  return photoUrl.startsWith('http') ? photoUrl : `http://localhost:8082${photoUrl}`;
};

// ====================== CUSTOM INPUT ======================
const CustomDateInput = forwardRef(({ value, onClick, placeholder, required }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder={placeholder}
    required={required}
    style={{ width: '200%' }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
    readOnly
  />
));

// ====================== TOAST ======================
const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;
  const styles = { success: 'bg-green-600', error: 'bg-red-600' };
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-2xl text-white ${styles[type]} flex items-center gap-3 animate-bounce-in`} style={{ minWidth: '300px' }}>
      <Icon className="w-6 h-6" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 p-1 rounded-full hover:bg-white/20">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// ====================== MAIN COMPONENT ======================
export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null); // { userId, currentStatus }

  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dob: '',
    gender: 'male',
    address: '',
    experienceYears: 0,
    bio: '',
    roles: ['tiep_tan'],
  });

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAccountApi.getAllUsers();
      data.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'vi', { sensitivity: 'base' }));
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast(err.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Xác nhận bật/tắt trạng thái
  const openToggleConfirmation = (userId, currentStatus) => {
    setToggleTarget({ userId, currentStatus });
    setShowToggleConfirmation(true);
  };

  const confirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setLoading(true);
    setShowToggleConfirmation(false);
    try {
      const newStatus = !toggleTarget.currentStatus;
      await adminAccountApi.toggleVerifyStatus(toggleTarget.userId, newStatus);
      setUsers(prev => prev.map(u => u.userId === toggleTarget.userId ? { ...u, isVerified: newStatus } : u));
      showToast(newStatus ? 'Tài khoản đã được kích hoạt!' : 'Tài khoản đã bị vô hiệu hóa!', 'success');
    } catch (err) {
      console.error('Lỗi thay đổi trạng thái:', err);
      showToast('Không thể thay đổi trạng thái tài khoản', 'error');
      fetchUsers();
    } finally {
      setLoading(false);
      setToggleTarget(null);
    }
  };

  const resetFormAndState = () => {
    setFormData({
      email: '', password: '', fullName: '', phone: '', dob: '', gender: 'male',
      address: '', experienceYears: 0, bio: '', roles: ['tiep_tan'],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPassword(false);
  };

  const loadUserData = (user) => {
    setFormData({
      email: user.email || '',
      password: user.password || '', // Giờ hiển thị mật khẩu thật khi xem
      fullName: user.fullName || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || 'male',
      address: user.address || '',
      experienceYears: user.experienceYears || 0,
      bio: user.bio || '',
      roles: user.roles || ['tiep_tan'],
    });
    setPhotoPreview(user.photoUrl ? getAvatarUrl(user.photoUrl) : null);
  };

  const handleOpenModal = (mode, user = null) => {
    resetFormAndState();
    setSelectedUser(user);
    setModalMode(mode);
    if (user) loadUserData(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalMode('create');
    resetFormAndState();
  };

  const handleSwitchToEdit = () => setModalMode('edit');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) return showToast('Kích thước ảnh không được vượt quá 100MB', 'error');
    if (!file.type.startsWith('image/')) return showToast('Chỉ chấp nhận file ảnh', 'error');
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // RÀNG BUỘC SỐ ĐIỆN THOẠI
    if (name === 'phone') {
      // 1. Chỉ cho phép nhập số (Regex: /^[0-9\b]+$/)
      if (value && !/^[0-9]+$/.test(value)) {
        return; // Nếu nhập chữ thì chặn luôn, không cập nhật state
      }
      // 2. Chặn nếu dài hơn 10 số (dù đã có maxLength nhưng chặn thêm ở đây cho chắc)
      if (value.length > 10) {
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData(prev => ({ ...prev, roles: [e.target.value] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && selectedUser) {
        const updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          experienceYears: parseInt(formData.experienceYears, 10),
          bio: formData.bio,
          roles: formData.roles,
          ...(formData.password && { password: formData.password }),
        };
        await adminAccountApi.updateUser(selectedUser.userId, updateData, photoFile);
        showToast('Cập nhật tài khoản thành công!');
      } else if (isCreateMode) {
        const createData = {
          ...formData,
          experienceYears: parseInt(formData.experienceYears, 10),
        };
        await adminAccountApi.createUser(createData, photoFile);
        showToast('Tạo tài khoản thành công!');
      }
      setTimeout(() => { handleCloseModal(); fetchUsers(); }, 1000);
    } catch (err) {
      console.error('Error submitting form:', err);
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      await adminAccountApi.deleteUser(userToDelete.userId);
      showToast('Xóa tài khoản thành công!');
      fetchUsers();
    } catch (err) {
      showToast('Không thể xóa tài khoản', 'error');
    } finally {
      setLoading(false);
      setUserToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 font-sans">
      <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Tài Khoản</h1>
        <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105">
          <UserPlus className="w-5 h-5" /> Tạo tài khoản
        </button>
      </div>

      {loading && !showModal ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-3 text-gray-600 font-medium">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase w-12">STT</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Giới tính</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Vai trò</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user, idx) => (
                <tr key={user.userId} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-3 text-center text-sm font-medium text-gray-600">{idx + 1}</td>
                  <td className="px-6 py-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
                      {getAvatarUrl(user.photoUrl) ? (
                        <img src={getAvatarUrl(user.photoUrl)} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900">{user.fullName}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{getGenderLabel(user.gender)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{user.phone}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles?.map((r, i) => {
                        const color = r === 'admin' ? 'bg-red-100 text-red-700 border-red-200' :
                                     r === 'bac_si' ? 'bg-green-100 text-green-700 border-green-200' :
                                     'bg-blue-100 text-blue-700 border-blue-200';
                        return (
                          <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                            {getRoleLabel(r)}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <Power className="w-4 h-4" />
                      {user.isVerified ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleOpenModal('view', user)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition" title="Xem chi tiết">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => initiateDelete(user)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition" title="Xóa">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openToggleConfirmation(user.userId, user.isVerified)}
                        className={`p-2 rounded-full transition ${user.isVerified ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}
                        title={user.isVerified ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg">Chưa có tài khoản nào</p>
            </div>
          )}
        </div>
      )}

      {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80">
              <h2 className="text-2xl font-bold text-blue-700">
                {isCreateMode ? 'Tạo tài khoản mới' : isViewMode ? 'Chi tiết tài khoản' : 'Chỉnh sửa tài khoản'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="p-6">
              {isViewMode && (
                <div className="mb-6 text-right">
                  <button onClick={handleSwitchToEdit} className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition">
                    <Edit className="w-5 h-5" /> Chuyển sang chỉnh sửa
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* --- ẢNH ĐẠI DIỆN (Giữ nguyên ở trên cùng, full chiều rộng) --- */}
    <div className="md:col-span-2 flex flex-col items-center border border-dashed border-gray-300 p-4 rounded-xl bg-gray-50/50">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Ảnh đại diện
      </label>
      {/* ... Logic hiển thị ảnh đại diện ... */}
      <div className="w-32 h-32 rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-blue-200">
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <User className="w-16 h-16 text-gray-400" />
        )}
      </div>
      {(isCreateMode || isEditMode) && (
        <div className="mt-4">
          <label className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition cursor-pointer text-sm font-medium shadow-sm">
            <Upload className="w-4 h-4" />
            {photoFile ? 'Thay đổi Ảnh' : 'Chọn Ảnh'}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isViewMode} />
          </label>
        </div>
      )}
    </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isCreateMode} required placeholder="example@clinic.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                  </div>

                  {/* Mật khẩu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu {isCreateMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={isCreateMode}
                        disabled={isViewMode}
                        placeholder={isViewMode ? '(đã mã hóa)' : 'Nhập mật khẩu mới để đổi'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      {(isCreateMode || isEditMode || (isViewMode && formData.password)) && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                    {isEditMode && <p className="text-xs text-gray-500 mt-1">Để trống nếu không muốn đổi mật khẩu</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={isViewMode} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                  </div>

                <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Số điện thoại <span className="text-red-500">*</span>
  </label>
  <input
    type="tel"
    name="phone"
    value={formData.phone}
    onChange={handleInputChange}
    disabled={isViewMode}
    required
    maxLength={10}             // Không cho nhập quá 10 ký tự
    minLength={10}             // Báo lỗi nếu ít hơn 10 ký tự khi submit
    pattern="[0-9]{10}"        // Regex kiểm tra bắt buộc phải đủ 10 số
    title="Số điện thoại phải bao gồm đúng 10 chữ số" // Dòng thông báo lỗi khi hover hoặc submit sai
    placeholder="0912345678"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
  />
</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
                    {isViewMode ? (
                      <input value={formData.dob ? formData.dob.split('-').reverse().join('/') : ''} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
                    ) : (
                      <DatePicker
                        selected={dateStringToDate(formData.dob)}
                        onChange={(date) => setFormData(prev => ({ ...prev, dob: dateToISOString(date) }))}
                        customInput={<CustomDateInput placeholder="dd/mm/yyyy" required />}
                        dateFormat="dd/MM/yyyy"
                        showMonthDropdown
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        maxDate={new Date()}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isViewMode} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      {genderOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                 {/* Số năm kinh nghiệm (Đã thêm required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số năm kinh nghiệm <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="experienceYears" 
                value={formData.experienceYears} 
                onChange={handleInputChange} 
                disabled={isViewMode} 
                required  // <--- Thêm ở đây
                min="0" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
                    <select value={formData.roles[0] || ''} onChange={handleRoleChange} disabled={isViewMode} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                      {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                {/* Địa chỉ (Đã thêm required) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                disabled={isViewMode} 
                required // <--- Thêm ở đây
                rows={3} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                placeholder="Số nhà, đường, phường/xã..." 
              />
            </div>
                 {/* Mô tả (Đã thêm required) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả công việc / Giới thiệu bản thân <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                disabled={isViewMode} 
                required // <--- Thêm ở đây
                rows={5} 
                maxLength={1000} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
              {!isViewMode && <p className="text-xs text-gray-500 text-right mt-1">{formData.bio.length}/1000</p>}
            </div>
                </div>

                {(isCreateMode || isEditMode) && (
                  <div className="flex gap-4 mt-8">
                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 font-semibold">
                      {loading ? 'Đang xử lý...' : isCreateMode ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 font-semibold">
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirmation && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Xóa tài khoản <strong>{userToDelete.fullName}</strong>?<br />Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold">
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
              <button onClick={() => setShowDeleteConfirmation(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận bật/tắt trạng thái */}
      {showToggleConfirmation && toggleTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
            <h3 className="text-xl font-bold mb-2">
              {toggleTarget.currentStatus ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt tài khoản?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {toggleTarget.currentStatus
                ? 'Tài khoản sẽ không thể đăng nhập nữa.'
                : 'Tài khoản sẽ được phép đăng nhập lại.'}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmToggleStatus} disabled={loading} className={`flex-1 py-2 rounded-lg font-semibold text-white ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
              <button onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}