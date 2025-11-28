// src/pages/admin/AccountManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Edit, X, Eye, EyeOff, User, Upload,
  CheckCircle, AlertTriangle, Power, AlertCircle, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  UserCog
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
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

// ====================== PAGINATION ======================
const Pagination = ({ currentPage, totalPages, goToPage }) => {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) startPage = Math.max(0, endPage - maxVisible + 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-8 py-4 border-t border-gray-200">
      <button onClick={() => goToPage(0)} disabled={currentPage === 0} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
        <ChevronsLeft className="w-5 h-5" />
      </button>
      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
        <ChevronLeft className="w-5 h-5" />
      </button>
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`px-4 py-2.5 rounded-lg border font-medium transition ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          {page + 1}
        </button>
      ))}
      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
        <ChevronRight className="w-5 h-5" />
      </button>
      <button onClick={() => goToPage(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ====================== MAIN COMPONENT ======================
export default function AccountManagement() {
  const { t } = useTranslation();

  // ── State nhóm gọn, dễ đọc
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 8;
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'view' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phone: '', dob: '', gender: 'male',
    address: '', experienceYears: '', bio: '', roles: ['tiep_tan'],
  });

  const isViewMode = modalMode === 'view';
  const isCreateMode = modalMode === 'create';
  const isEditMode = modalMode === 'edit';

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

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
      showToastMessage(t('admin.accounts.toast.loadError'), 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, filterRole, filterStatus, currentPage, t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setCurrentPage(0); }, [searchKeyword, filterRole, filterStatus]);

  const goToPage = (page) => {
    if (page >= 0 && page < totalPages && page !== currentPage) setCurrentPage(page);
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
      showToastMessage(newStatus ? t('admin.accounts.toast.toggleActive') : t('admin.accounts.toast.toggleInactive'), 'success');
    } catch (err) {
      showToastMessage(t('admin.common.error'), 'error');
    } finally {
      setLoading(false);
      setToggleTarget(null);
    }
  };

  const resetFormAndState = () => {
    setFormData({
      email: '', password: '', fullName: '', phone: '', dob: '', gender: 'male',
      address: '', experienceYears: '', bio: '', roles: ['tiep_tan'],
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToastMessage(t('admin.accounts.toast.invalidImage'), 'error');
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value && !/^[0-9]+$/.test(value)) return;
    if (name === 'phone' && value.length > 10) return;
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
          fullName: formData.fullName, phone: formData.phone, dob: formData.dob,
          gender: formData.gender, address: formData.address,
          experienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null, roles: formData.roles,
          ...(formData.password && { password: formData.password }),
        };
        await adminAccountApi.updateUser(selectedUser.userId, updateData, photoFile);
        showToastMessage(t('admin.accounts.toast.updateSuccess'), 'success');
      } else if (isCreateMode) {
        const createData = {
          ...formData,
          experienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
          bio: formData.bio || null,
        };
        await adminAccountApi.createUser(createData, photoFile);
        showToastMessage(t('admin.accounts.toast.createSuccess'), 'success');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      showToastMessage(err.response?.data?.message || t('admin.common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 font-sans">
      <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <UserCog className="w-9 h-9 text-blue-600" />
            <span>{t('admin.accounts.pageTitle')}</span>
          </h1>
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium">
            <UserPlus className="w-5 h-5" /> {t('admin.accounts.createButton')}
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Search className="inline w-4 h-4 mr-1" /> {t('admin.accounts.searchPlaceholder')}</label>
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder={t('admin.accounts.searchPlaceholder')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.accounts.filterRole')}</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">{t('admin.common.all')}</option>
              <option value="admin">{t('admin.accounts.role.admin')}</option>
              <option value="bac_si">{t('admin.accounts.role.bac_si')}</option>
              <option value="tiep_tan">{t('admin.accounts.role.tiep_tan')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.accounts.filterStatus')}</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="">{t('admin.common.all')}</option>
              <option value="true">{t('admin.common.active')}</option>
              <option value="false">{t('admin.common.inactive')}</option>
            </select>
          </div>
          <div>
            <button onClick={resetFilters} className="w-full h-[52px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white border border-gray-400 text-gray-700 hover:bg-gray-50">
              <X className="w-5 h-5" /> {t('admin.common.clearFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('admin.common.loading')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.no')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.avatar')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.fullName')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.gender')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.phone')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.email')}</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.role')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.status')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">{t('admin.accounts.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, idx) => (
                  <tr key={user.userId} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-center">{currentPage * pageSize + idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border flex items-center justify-center">
                        {getAvatarUrl(user.photoUrl) ? <img src={getAvatarUrl(user.photoUrl)} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.fullName}</td>
                    <td className="px-6 py-4">{t(`admin.accounts.gender.${user.gender}`) || user.gender}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map((r, i) => {
                          const color = r === 'admin' ? 'bg-red-100 text-red-700 border-red-200'
                            : r === 'bac_si' ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200';
                          return (
                            <span key={i} className={`px-2 py-1 rounded-full text-xs border ${color}`}>
                              {t(`admin.accounts.role.${r}`) || r}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <Power className="inline w-4 h-4 mr-1" />
                        {user.isVerified ? t('admin.common.active') : t('admin.common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal('view', user)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100"><Eye className="w-5 h-5" /></button>
                        <button onClick={() => openToggleConfirmation(user.userId, user.isVerified)} className={`p-2 rounded-full transition ${user.isVerified ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'}`}>
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
                <p className="text-xl font-medium">{t('admin.accounts.noAccounts')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} goToPage={goToPage} />

      {/* ====================== MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 z-10">
              <h2 className="text-2xl font-bold text-blue-700">
                {isCreateMode ? t('admin.accounts.modal.createTitle') : isViewMode ? t('admin.accounts.modal.viewTitle') : t('admin.accounts.modal.editTitle')}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700"><X className="w-7 h-7" /></button>
            </div>

            <div className="p-6">
              {isViewMode && (
                <div className="mb-6 text-right">
                  <button onClick={() => setModalMode('edit')} className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition">
                    <Edit className="w-5 h-5" /> {t('admin.accounts.modal.switchToEdit')}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar */}
                  <div className="md:col-span-2 flex flex-col items-center border border-dashed border-gray-300 p-6 rounded-xl bg-gray-50/50">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('admin.accounts.modal.avatar')}</label>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-200">
                      {photoPreview ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-gray-400 mx-auto" />}
                    </div>
                    {(isCreateMode || isEditMode) && (
                      <div className="mt-4">
                        <label className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full cursor-pointer hover:bg-blue-200 transition">
                          <Upload className="w-4 h-4" />
                          {photoFile ? t('admin.accounts.modal.changePhoto') : t('admin.accounts.modal.choosePhoto')}
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.email')} <span className="text-red-500">*</span></label>
                    <input type="email" name="email" required disabled={isViewMode} value={formData.email} onChange={handleInputChange} placeholder="example@clinic.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.password')} {isCreateMode && <span className="text-red-500">*</span>}</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" required={isCreateMode} disabled={isViewMode} value={formData.password} onChange={handleInputChange}
                        placeholder={isEditMode ? t('admin.accounts.modal.passwordHint') : t('admin.accounts.modal.password')} className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      {(isCreateMode || isEditMode) && (
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.fullName')} <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" required disabled={isViewMode} value={formData.fullName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.phone')} <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" required disabled={isViewMode} maxLength={10} pattern="[0-9]{10}" value={formData.phone} onChange={handleInputChange} placeholder="0912345678" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.dob')} <span className="text-red-500">*</span></label>
                    {isViewMode ? <input value={formData.dob ? formData.dob.split('-').reverse().join('/') : ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                      : <DatePicker selected={dateStringToDate(formData.dob)} onChange={(date) => setFormData(prev => ({ ...prev, dob: dateToISOString(date) }))}
                          customInput={<CustomDateInput placeholder="dd/mm/yyyy" required />} dateFormat="dd/MM/yyyy" maxDate={new Date()} showMonthDropdown showYearDropdown dropdownMode="select" />}
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.gender')} <span className="text-red-500">*</span></label>
                    <select name="gender" required disabled={isViewMode} value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="male">{t('admin.accounts.gender.male')}</option>
                      <option value="female">{t('admin.accounts.gender.female')}</option>
                      <option value="other">{t('admin.accounts.gender.other')}</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.experienceYears')}</label>
                    <input type="number" name="experienceYears" min="0" disabled={isViewMode} value={formData.experienceYears} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.role')} <span className="text-red-500">*</span></label>
                    <select required disabled={isViewMode} value={formData.roles[0] || ''} onChange={handleRoleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="admin">{t('admin.accounts.role.admin')}</option>
                      <option value="bac_si">{t('admin.accounts.role.bac_si')}</option>
                      <option value="tiep_tan">{t('admin.accounts.role.tiep_tan')}</option>
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.address')} <span className="text-red-500">*</span></label>
                    <textarea name="address" required disabled={isViewMode} value={formData.address} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.accounts.modal.bio')}</label>
                    <textarea name="bio" disabled={isViewMode} value={formData.bio} onChange={handleInputChange} rows={5} maxLength={1000} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {!isViewMode && <p className="text-xs text-gray-500 text-right mt-1">{formData.bio.length}/1000</p>}
                  </div>
                </div>

                {(isCreateMode || isEditMode) && (
                  <div className="flex gap-4 mt-8">
                    <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium">
                      {loading ? t('admin.common.processing') : isCreateMode ? t('admin.accounts.modal.create') : t('admin.common.save')}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-medium">
                      {t('admin.common.cancel')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================== TOGGLE CONFIRMATION ====================== */}
      {showToggleConfirmation && toggleTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
            <h3 className="text-xl font-bold mb-2">
              {toggleTarget.currentStatus ? t('admin.accounts.confirmToggle.deactivate') : t('admin.accounts.confirmToggle.activate')}
            </h3>
            <p className="text-gray-600 mb-6">
              {toggleTarget.currentStatus ? t('admin.accounts.confirmToggle.deactivateDesc') : t('admin.accounts.confirmToggle.activateDesc')}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmToggleStatus} disabled={loading} className={`flex-1 py-2 rounded-lg font-semibold text-white transition ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {loading ? t('admin.common.processing') : t('admin.common.confirm')}
              </button>
              <button onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-medium">
                {t('admin.common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}