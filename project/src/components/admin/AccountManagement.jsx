// ===================== ACCOUNT MANAGEMENT (FULL FILE PART 1) =====================

import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Edit, X, Eye, EyeOff, User, Upload,
  CheckCircle, AlertTriangle, Power, AlertCircle, Search,
  UserCog
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminAccountApi from '../../api/adminAccountApi';
import React, { forwardRef } from 'react';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';

// ====================== HELPER ======================
const dateStringToDate = (dateStr) => {
  if (!dateStr || dateStr.includes('/')) return null;
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

const genderOptions = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const roleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'bac_si', label: 'Bác sĩ' },
  { value: 'tiep_tan', label: 'Tiếp tân' },
];

const dateToISOString = (date) => {
  if (!date || isNaN(date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRoleLabel = (role) => {
  if (!role) return '';
  
  // Chuẩn hóa role về lowercase và loại bỏ "ROLE_" prefix
  const normalizedRole = role.toLowerCase().replace('role_', '');
  
  const map = { 
    admin: 'Quản trị viên', 
    bac_si: 'Bác sĩ',
    bacsi: 'Bác sĩ',
    tiep_tan: 'Tiếp tân',
    tieptan: 'Tiếp tân'
  };
  
  return map[normalizedRole] || role;
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
    style={{ width: '190%' }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition cursor-pointer"
    readOnly
  />
));

// ====================== MAIN COMPONENT ======================
export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = 8;
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    dob: '',
    gender: 'male',
    address: '',
    experienceYears: '',
    bio: '',
    roles: ['tiep_tan'],
  });

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';



  const resetFilters = () => {
    setSearchKeyword('');
    setFilterRole('');
    setFilterStatus('');
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        keyword: searchKeyword || undefined,
        roleName: filterRole || undefined,
        isVerified: filterStatus === '' ? undefined : filterStatus === 'true',
      };

      const response = await adminAccountApi.searchUsers(
        filters,
        currentPage,
        pageSize
      );

      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, filterRole, filterStatus, currentPage]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchKeyword, filterRole, filterStatus]);

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

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
      setUsers(prev =>
        prev.map(u =>
          u.userId === toggleTarget.userId ? { ...u, isVerified: newStatus } : u
        )
      );

      toast.success(
        newStatus ? 'Tài khoản đã được kích hoạt!' : 'Tài khoản đã bị vô hiệu hóa!'
      );
    } catch (err) {
      toast.error('Không thể thay đổi trạng thái tài khoản');
    } finally {
      setLoading(false);
      setToggleTarget(null);
    }
  };

  const resetFormAndState = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      dob: '',
      gender: 'male',
      address: '',
      experienceYears: '',
      bio: '',
      roles: ['tiep_tan'],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPassword(false);
  };

  const loadUserData = (user) => {
    setFormData({
      email: user.email || '',
      password: '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || 'male',
      address: user.address || '',
      experienceYears: user.experienceYears ?? '',
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
    if (!file.type.startsWith('image/'))
      return toast.error('Chỉ chấp nhận file ảnh');
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      if (value && !/^[0-9]+$/.test(value)) return;
      if (value.length > 10) return;
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
          experienceYears:
            formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null,
          roles: formData.roles,
          ...(formData.password && { password: formData.password }),
        };

        await adminAccountApi.updateUser(selectedUser.userId, updateData, photoFile);
        toast.success('Cập nhật tài khoản thành công!');
      } else if (isCreateMode) {
        const createData = {
          ...formData,
          experienceYears:
            formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null,
        };

        await adminAccountApi.createUser(createData, photoFile);
        toast.success('Tạo tài khoản thành công!');
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50 font-sans">
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <UserCog className="w-9 h-9 text-blue-600" />
              <span>Quản Lý Tài Khoản</span>
            </h1>
            <CountBadge 
              currentCount={users.length} 
              totalCount={totalElements} 
              label="tài khoản" 
            />
          </div>

          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium"
          >
            <UserPlus className="w-5 h-5" /> Tạo tài khoản
          </button>
        </div>
      </div>

{/* SEARCH & FILTER BAR */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">

    {/* Tìm kiếm */}
    <div className="lg:col-span-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Search className="inline w-4 h-4 mr-1" /> Tìm kiếm
      </label>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="Tên, SĐT, Email..."
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Vai trò */}
    <div className="lg:col-span-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Vai trò
      </label>
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tất cả</option>
        <option value="admin">Quản trị viên</option>
        <option value="bac_si">Bác sĩ</option>
        <option value="tiep_tan">Tiếp tân</option>
      </select>
    </div>

    {/* Trạng thái */}
    <div className="lg:col-span-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Trạng thái
      </label>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tất cả</option>
        <option value="true">Hoạt động</option>
        <option value="false">Vô hiệu hóa</option>
      </select>
    </div>

    {/* Xóa lọc */}
    <div className="flex md:block lg:col-span-1">
      <button
        onClick={resetFilters}
        className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium"
      >
        Xóa lọc
      </button>
    </div>

  </div>
</div>


      {/* TABLE */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                    STT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Ảnh
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Họ tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Giới tính
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    SĐT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, idx) => (
                  <tr key={user.userId} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">
                      {currentPage * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border flex items-center justify-center">
                        {getAvatarUrl(user.photoUrl) ? (
                          <img
                            src={getAvatarUrl(user.photoUrl)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">{user.fullName}</td>
                    <td className="px-6 py-4">{getGenderLabel(user.gender)}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.email}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(user.roles) && user.roles.length > 0 ? (
                          user.roles.map((r, i) => {
                            // Chuẩn hóa role để so sánh
                            const normalizedRole = r ? r.toLowerCase().replace('role_', '') : '';
                            
                            const color =
                              normalizedRole === 'admin'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : normalizedRole === 'bac_si' || normalizedRole === 'bacsi'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-purple-100 text-purple-700 border-purple-200';

                            return (
                              <span
                                key={i}
                                className={`px-2 py-1 rounded-full text-xs border ${color}`}
                              >
                                {getRoleLabel(r)}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-xs italic">Chưa có vai trò</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <Power className="inline w-4 h-4 mr-1" />
                        {user.isVerified ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">

                        <button
                          onClick={() => handleOpenModal('view', user)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* ❌ Delete button has been removed completely */}

                        <button
                          onClick={() => openToggleConfirmation(user.userId, user.isVerified)}
                          className={`p-2 rounded-full transition ${
                            user.isVerified
                              ? 'text-green-600 hover:bg-green-100'
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <Power className="w-5 h-5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-medium">Không tìm thấy tài khoản nào</p>
              </div>
            )}

          </div>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
            {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 backdrop-blur">
              <h2 className="text-2xl font-bold text-blue-700">
                {isCreateMode
                  ? 'Tạo tài khoản mới'
                  : isViewMode
                  ? 'Chi tiết tài khoản'
                  : 'Chỉnh sửa tài khoản'}
              </h2>

              <div className="flex items-center gap-3">
                {isViewMode && (
                  <button
                    onClick={handleSwitchToEdit}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white/50">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Avatar */}
                  <div className="md:col-span-2 flex flex-col items-center border border-dashed border-gray-300 p-6 rounded-xl bg-gray-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</label>

                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-200">
                      {photoPreview ? (
                        <img src={photoPreview} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400 mx-auto" />
                      )}
                    </div>

                    {(isCreateMode || isEditMode) && (
                      <div className="mt-4">
                        <label className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full cursor-pointer">
                          <Upload className="w-4 h-4" />
                          {photoFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={isViewMode}
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@clinic.com"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu {isCreateMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={(isCreateMode || isEditMode) && showPassword ? 'text' : 'password'}
                        name="password"
                        required={isCreateMode}
                        disabled={isViewMode}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={isEditMode ? 'Nhập mật khẩu mới (tuỳ chọn)' : 'Nhập mật khẩu'}
                        className="w-full px-3 py-2 border rounded-lg pr-12"
                      />
                      {(isCreateMode || isEditMode) && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3 top-2.5 text-gray-500"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      disabled={isViewMode}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      disabled={isViewMode}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0912345678"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>

                    {isViewMode ? (
                      <input
                        value={formData.dob ? formData.dob.split('-').reverse().join('/') : ''}
                        disabled
                        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      />
                    ) : (
                      <DatePicker
                        required
                        selected={dateStringToDate(formData.dob)}
                        onChange={(date) =>
                          setFormData(prev => ({ ...prev, dob: dateToISOString(date) }))
                        }
                        customInput={<CustomDateInput placeholder="dd/mm/yyyy" required />}
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                      />
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      required
                      disabled={isViewMode}
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {genderOptions.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số năm kinh nghiệm
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      disabled={isViewMode}
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={isViewMode}
                      value={formData.roles[0] || ''}
                      onChange={handleRoleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {roleOptions.map(o => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      disabled={isViewMode}
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả / Giới thiệu
                    </label>
                    <textarea
                      name="bio"
                      disabled={isViewMode}
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={1000}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {!isViewMode && (
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {formData.bio.length}/1000
                      </p>
                    )}
                  </div>

                </div>

                {(isCreateMode || isEditMode) && (
                  <div className="flex gap-4 mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
                    >
                      {loading ? 'Đang xử lý...' : isCreateMode ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================== TOGGLE STATUS CONFIRMATION ====================== */}
      {showToggleConfirmation && toggleTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-4 ${
                toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'
              }`}
            />

            <h3 className="text-xl font-bold mb-2">
              {toggleTarget.currentStatus ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt tài khoản?'}
            </h3>

            <p className="text-gray-600 mb-6">
              {toggleTarget.currentStatus
                ? 'Tài khoản sẽ không thể đăng nhập nữa.'
                : 'Tài khoản sẽ được phép đăng nhập lại.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmToggleStatus}
                disabled={loading}
                className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                  toggleTarget.currentStatus
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>

              <button
                onClick={() => {
                  setShowToggleConfirmation(false);
                  setToggleTarget(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


