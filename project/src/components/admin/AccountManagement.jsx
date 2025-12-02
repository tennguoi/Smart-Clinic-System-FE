// src/pages/admin/AccountManagement.jsx (hoặc đường dẫn bạn đang dùng)

import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Edit, X, Eye, EyeOff, User, Upload,
  Power, AlertCircle, Search, UserCog
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminAccountApi from '../../api/adminAccountApi';
import React, { forwardRef } from 'react';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTranslation } from 'react-i18next';

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

const getAvatarUrl = (photoUrl) => {
  if (!photoUrl) return null;
  return photoUrl.startsWith('http') ? photoUrl : `http://localhost:8082${photoUrl}`;
};

const CustomDateInput = forwardRef(({ value, onClick, placeholder, required }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder={placeholder}
    required={required}
    style={{ width: '200%' }}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition cursor-pointer"
    readOnly
  />
));

export default function AccountManagement() {
  const { t } = useTranslation();

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
      const response = await adminAccountApi.searchUsers(filters, currentPage, pageSize);
      setUsers(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      toast.error(t('accountManagement.toast.loadError'));
      setUsers([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, filterRole, filterStatus, currentPage, t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setCurrentPage(0); }, [searchKeyword, filterRole, filterStatus]);

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
      setUsers(prev => prev.map(u => u.userId === toggleTarget.userId ? { ...u, isVerified: newStatus } : u));
      toast.success(newStatus
        ? t('accountManagement.toast.toggleSuccessActive')
        : t('accountManagement.toast.toggleSuccessDisabled')
      );
    } catch (err) {
      toast.error(t('accountManagement.toast.error'));
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
    if (!file.type.startsWith('image/')) {
      toast.error(t('accountManagement.toast.imageError'));
      return;
    }
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
          experienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null,
          roles: formData.roles,
          ...(formData.password && { password: formData.password }),
        };
        await adminAccountApi.updateUser(selectedUser.userId, updateData, photoFile);
        toast.success(t('accountManagement.toast.updateSuccess'));
      } else if (isCreateMode) {
        const createData = {
          ...formData,
          experienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null,
        };
        await adminAccountApi.createUser(createData, photoFile);
        toast.success(t('accountManagement.toast.createSuccess'));
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || t('accountManagement.toast.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 pt-4 pb-8 min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Toaster {...toastConfig} />

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <UserCog className="w-9 h-9 text-blue-600" />
              <span>{t('accountManagement.title')}</span>
            </h1>
            <CountBadge 
              currentCount={users.length} 
              totalCount={totalElements} 
              label={t('accountManagement.title').toLowerCase()} 
            />
          </div>

          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium"
          >
            <UserPlus className="w-5 h-5" /> {t('accountManagement.createButton')}
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Tìm kiếm */}
          <div className="lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="inline w-4 h-4 mr-1" /> {t('common.search')}
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('accountManagement.searchPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Vai trò */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('accountManagement.roleFilter')}
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('accountManagement.allRoles')}</option>
              <option value="admin">{t('accountManagement.roleLabels.admin')}</option>
              <option value="bac_si">{t('accountManagement.roleLabels.bac_si')}</option>
              <option value="tiep_tan">{t('accountManagement.roleLabels.tiep_tan')}</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('accountManagement.statusFilter')}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('accountManagement.allStatuses')}</option>
              <option value="true">{t('accountManagement.activeStatus')}</option>
              <option value="false">{t('accountManagement.disabledStatus')}</option>
            </select>
          </div>

          {/* Xóa lọc */}
          <div className="flex md:block lg:col-span-1">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
            >
              {t('accountManagement.clearFilter')}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">{t('common.loading')}...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-blue-50 dark:bg-blue-900/20">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.stt')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.photo')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.fullName')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.gender')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.phone')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.email')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.role')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.status')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    {t('accountManagement.table.actions')}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user, idx) => (
                  <tr key={user.userId} className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition text-gray-700 dark:text-gray-300">
                    <td className="px-6 py-4 text-center">
                      {currentPage * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border dark:border-gray-600 flex items-center justify-center">
                        {getAvatarUrl(user.photoUrl) ? (
                          <img src={getAvatarUrl(user.photoUrl)} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.fullName}</td>
                    <td className="px-6 py-4">{t(`accountManagement.gender.${user.gender}`) || t('accountManagement.gender.other')}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {Array.isArray(user.roles) && user.roles.length > 0 ? (
                          user.roles.map((r, i) => {
                            const normalizedRole = r ? r.toLowerCase().replace('role_', '') : '';
                            
                            const color =
                              normalizedRole === 'admin'
                                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                                : normalizedRole === 'bac_si' || normalizedRole === 'bacsi'
                                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';

                            return (
                              <span key={i} className={`px-2 py-1 rounded-full text-xs border ${color}`}>
                                {t(`accountManagement.roleLabels.${normalizedRole}`) || r}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                            {t('accountManagement.noRole')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        <Power className="inline w-4 h-4 mr-1" />
                        {user.isVerified ? t('accountManagement.activeStatus') : t('accountManagement.disabledStatus')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal('view', user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openToggleConfirmation(user.userId, user.isVerified)}
                          className={`p-2 rounded-full transition ${
                            user.isVerified
                              ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
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
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl font-medium">{t('accountManagement.noAccounts')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 sticky top-0 bg-blue-50/80 dark:bg-gray-800/90 backdrop-blur">
              <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {isCreateMode ? t('accountManagement.modal.createTitle')
                  : isViewMode ? t('accountManagement.modal.viewTitle')
                    : t('accountManagement.modal.editTitle')}
              </h2>
              <div className="flex items-center gap-3">
                {isViewMode && (
                  <button onClick={handleSwitchToEdit} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                    <Edit className="w-4 h-4" /> {t('accountManagement.modal.editButton')}
                  </button>
                )}
                <button onClick={handleCloseModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700">
                  <X className="w-7 h-7" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar */}
                  <div className="md:col-span-2 flex flex-col items-center border border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-xl bg-gray-50/50 dark:bg-gray-700/50">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {t('accountManagement.modal.avatarLabel')}
                    </label>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-600 shadow-lg ring-4 ring-blue-200 dark:ring-blue-900">
                      {photoPreview ? (
                        <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400 mx-auto" />
                      )}
                    </div>
                    {(isCreateMode || isEditMode) && (
                      <div className="mt-4">
                        <label className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition">
                          <Upload className="w-4 h-4" />
                          {photoFile ? t('accountManagement.modal.changePhoto') : t('accountManagement.modal.choosePhoto')}
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Các field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={isViewMode}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.password')} {isCreateMode && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required={isCreateMode}
                      disabled={isViewMode}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={isEditMode ? t('accountManagement.modal.passwordPlaceholderEdit') : t('accountManagement.modal.passwordPlaceholderCreate')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    {(isCreateMode || isEditMode) && (
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-9 text-gray-500 dark:text-gray-400">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      disabled={isViewMode}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.phone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      disabled={isViewMode}
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.dob')} <span className="text-red-500">*</span>
                    </label>
                    {isViewMode ? (
                      <input
                        value={formData.dob ? formData.dob.split('-').reverse().join('/') : ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <DatePicker
                        selected={dateStringToDate(formData.dob)}
                        onChange={(date) => setFormData(prev => ({ ...prev, dob: dateToISOString(date) }))}
                        customInput={<CustomDateInput placeholder="dd/mm/yyyy" required />}
                        dateFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.gender')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      required
                      disabled={isViewMode}
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">{t('accountManagement.gender.male')}</option>
                      <option value="female">{t('accountManagement.gender.female')}</option>
                      <option value="other">{t('accountManagement.gender.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.experienceYears')}
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      disabled={isViewMode}
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.role')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      disabled={isViewMode}
                      value={formData.roles[0] || ''}
                      onChange={handleRoleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">{t('accountManagement.roleLabels.admin')}</option>
                      <option value="bac_si">{t('accountManagement.roleLabels.bac_si')}</option>
                      <option value="tiep_tan">{t('accountManagement.roleLabels.tiep_tan')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.address')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      disabled={isViewMode}
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('accountManagement.modal.bio')}
                    </label>
                    <textarea
                      name="bio"
                      disabled={isViewMode}
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={1000}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    {!isViewMode && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                        {formData.bio.length}/1000
                      </p>
                    )}
                  </div>
                </div>

                {(isCreateMode || isEditMode) && (
                  <div className="flex gap-4 mt-8">
                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700">
                      {loading ? t('accountManagement.modal.processing') : isCreateMode ? t('accountManagement.modal.createAccountButton') : t('accountManagement.modal.saveButton')}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400">
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM TOGGLE */}
      {showToggleConfirmation && toggleTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
            <h3 className="text-xl font-bold mb-2">
              {toggleTarget.currentStatus
                ? t('accountManagement.confirmToggle.disableTitle')
                : t('accountManagement.confirmToggle.enableTitle')}
            </h3>
            <p className="text-gray-600 mb-6">
              {toggleTarget.currentStatus
                ? t('accountManagement.confirmToggle.disableText')
                : t('accountManagement.confirmToggle.enableText')}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmToggleStatus} disabled={loading}
                className={`flex-1 py-2 rounded-lg font-semibold text-white ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {loading ? t('accountManagement.modal.processing') : t('accountManagement.confirmToggle.confirm')}
              </button>
              <button onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
                {t('accountManagement.confirmToggle.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}