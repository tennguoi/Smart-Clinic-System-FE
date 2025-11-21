import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Trash2, X, Eye, EyeOff, User, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import adminAccountApi from '../../api/adminAccountApi'; 
import React, { forwardRef } from 'react';

// --- Role and Gender Options ---
// 1. Chuyển chuỗi YYYY-MM-DD (lưu trong state) thành Date object (cần cho DatePicker)
const dateStringToDate = (dateStr) => {
  if (!dateStr || dateStr.includes('/')) return null; // Tránh lỗi nếu chuỗi đang ở dd/mm/yyyy
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day); 
};
// --- B. CUSTOM INPUT ---
const CustomDateInput = forwardRef(({ value, onClick, placeholder, required }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    ref={ref}
    placeholder={placeholder}
    required={required}
    style={{ width: '170%' }}
    // Đảm bảo W-FULL và styling chuẩn
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
    readOnly 
  />
));
// 2. Chuyển Date object (sau khi chọn) thành chuỗi YYYY-MM-DD (để lưu vào state)
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
  const roleMap = {
    admin: 'Quản trị viên',
    bac_si: 'Bác sĩ',
    tiep_tan: 'Tiếp tân',
  };
  return roleMap[role] || role;
};

const getGenderLabel = (gender) => {
  const genderMap = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  };
  return genderMap[gender] || 'Không rõ';
};

// Hàm này cần được thay thế bằng logic API thực tế của bạn
const getAvatarUrl = (photoUrl) => {
  if (!photoUrl) return null;
  return photoUrl.startsWith('http') ? photoUrl : `http://localhost:8082${photoUrl}`;
};

// --- Toast Component ---
const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
  };
  
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div 
      className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-2xl text-white ${typeStyles[type]} flex items-center gap-3 transition-all duration-300 transform animate-bounce-in`}
      style={{ minWidth: '300px' }}
    >
      <Icon className="w-6 h-6"/>
      <span className='font-medium'>{message}</span>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 p-1 rounded-full hover:bg-white/20">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};


// --- Account Management Component ---
export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Modal Mode: 'create', 'view', 'edit'
  const [modalMode, setModalMode] = useState('create'); 
  
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Toast State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Delete Confirmation State
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // State for form data (combined view/edit/create data)
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
    roles: ['tiep_tan'], // Default role
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
      // SỬ DỤNG API TỪ DÒNG IMPORT LỖI
      const data = await adminAccountApi.getAllUsers();
      // Sort users by full name for display
      data.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'vi', { sensitivity: 'base' }));
      setUsers(data);
    } catch (err) {
      // In ra lỗi chi tiết để debug
      console.error("Error fetching users:", err); 
      showToast(err.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetFormAndState = () => {
    setFormData({
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
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowPassword(false);
  };

  const loadUserData = (user) => {
    setFormData({
      email: user.email || '',
      password: '', // Never populate password for security
      fullName: user.fullName || '',
      phone: user.phone || '',
      dob: user.dob || '',
      gender: user.gender || 'male',
      address: user.address || '',
      experienceYears: user.experienceYears || 0,
      bio: user.bio || '',
      roles: user.roles || ['tiep_tan'],
    });
    
    // Use existing photo URL for preview
    if (user.photoUrl) {
      setPhotoPreview(getAvatarUrl(user.photoUrl));
    } else {
      setPhotoPreview(null);
    }
  }

  const handleOpenModal = (mode, user = null) => {
    resetFormAndState();
    setSelectedUser(user);
    setModalMode(mode);

    if (user) {
      loadUserData(user);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalMode('create');
    resetFormAndState();
  };
  
  // Function to switch from 'view' to 'edit' mode within the open modal
  const handleSwitchToEdit = () => {
    setModalMode('edit');
    // We keep the formData and photoPreview state intact when switching
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 5MB limit
        showToast('Kích thước ảnh không được vượt quá 100MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Chỉ chấp nhận file ảnh', 'error');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleRoleChange = (e) => {
    // Lấy giá trị đơn từ dropdown
    const value = e.target.value;
    
    // Cập nhật vào state. Lưu ý: Backend mong đợi mảng, nên ta bọc value vào mảng [value]
    setFormData((prev) => ({
      ...prev,
      roles: [value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && selectedUser) {
        // Prepare update data
        const updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          experienceYears: parseInt(formData.experienceYears, 10),
          bio: formData.bio,
          roles: formData.roles,
        };
        
        // SỬ DỤNG API TỪ DÒNG IMPORT LỖI
        await adminAccountApi.updateUser(selectedUser.userId, updateData, photoFile);
        showToast('Cập nhật tài khoản thành công!');
      } else if (isCreateMode) {
        // Prepare create data
        const createData = {
          ...formData,
          experienceYears: parseInt(formData.experienceYears, 10),
        };
        
        // SỬ DỤNG API TỪ DÒNG IMPORT LỖI
        await adminAccountApi.createUser(createData, photoFile);
        showToast('Tạo tài khoản thành công!');
      }

      // Close modal and refresh user list after a short delay
      setTimeout(() => {
        handleCloseModal();
        fetchUsers();
      }, 1000);
    } catch (err) {
      console.error("Error submitting form:", err); 
      showToast(err.message || 'Có lỗi xảy ra trong quá trình xử lý', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // --- Delete Logic ---
  const initiateDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setShowDeleteConfirmation(false);

    try {
      
      await adminAccountApi.deleteUser(userToDelete.userId);
      showToast('Xóa tài khoản thành công!');
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err); 
      showToast(err.message || 'Không thể xóa tài khoản', 'error');
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setUserToDelete(null);
  };
  // --- End Delete Logic ---

  // Component rendering
  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 font-sans">
      <ToastNotification 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      
      <div className="flex justify-between items-center mb-6 border-b pb-4">
       <h1 className="text-3xl font-bold text-gray-800">Quản Lý Tài Khoản </h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-5 h-5" />
          Tạo tài khoản 
        </button>
      </div>

      {loading && !showModal ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-3 text-gray-600 font-medium">Đang tải danh sách người dùng...</p>
        </div>
      ) : (
       <div className="bg-white rounded-xl shadow-2xl overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-blue-50">
      <tr>
        <th
          scope="col"
          className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-12"
        >
          STT
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          Ảnh
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          Họ tên
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          Giới tính
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          SĐT
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          Email
        </th>
          <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-bold text-gry-600 uppercase tracking-wider"
        >
          Vai trò
        </th>
     <th
  scope="col"
  className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider"
>
  Thao tác
</th>
      </tr>
    </thead>
          <tbody className="bg-white divide-y divide-gray-100">
  {users.map((user, index) => (
    <tr key={user.userId} className="hover:bg-blue-50 transition duration-150">
      {/* 1. STT */}
      <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-600">
        {index + 1}
      </td>

      {/* 2. Ảnh */}
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
          {getAvatarUrl(user.photoUrl) ? (
            <img
              src={getAvatarUrl(user.photoUrl)}
              alt={user.fullName || 'Ảnh'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </td>

      {/* 3. Họ tên */}
      <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
        {user.fullName}
      </td>

      {/* 4. Giới tính (Đã chuyển lên cho khớp với Header) */}
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
        {getGenderLabel(user.gender)}
      </td>

      {/* 5. SĐT (Đã chuyển lên cho khớp với Header) */}
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
        {user.phone}
      </td>

      {/* 6. Email (Đã chuyển lên cho khớp với Header) */}
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
        {user.email}
      </td>

      {/* 7. Vai trò (Đã chuyển xuống vị trí này) */}
      <td className="px-6 py-3 whitespace-nowrap text-sm">
        <div className="flex gap-1 flex-wrap">
          {user.roles?.map((role, idx) => {
            let colorClass = '';
            switch (role) {
              case 'admin':
                colorClass = 'bg-red-100 text-red-700 border-red-200';
                break;
              case 'bac_si':
                colorClass = 'bg-green-100 text-green-700 border-green-200';
                break;
              case 'tiep_tan':
                colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
                break;
              default:
                colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
            }
            return (
              <span
                key={idx}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
              >
                {getRoleLabel(role)}
              </span>
            );
          })}
        </div>
      </td>

      {/* 8. Thao tác */}
  {/* 8. Thao tác - Đã sửa lại căn chỉnh */}
      <td className="px-6 py-3 whitespace-nowrap">
        {/* Sử dụng flexbox để căn giữa icon hoàn hảo */}
        <div className="flex items-center justify-center gap-3 h-full"> 
          <button
            onClick={() => handleOpenModal('view', user)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition flex items-center justify-center"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => initiateDelete(user)}
            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition flex items-center justify-center"
            title="Xóa tài khoản"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500 text-lg">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              Chưa có tài khoản nào được tạo.
            </div>
          )}
        </div>
      )}

      {/* --- Main Modal (Create/View/Edit) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b bg-blue-50/50 sticky top-0 z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-blue-700">
                {isCreateMode ? 'Tạo Tài khoản Mới' : isViewMode ? 'Chi tiết Tài khoản' : 'Chỉnh sửa Tài khoản'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* View/Edit/Create Actions */}
            <div className="p-6">
                {isViewMode && (
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={handleSwitchToEdit}
                            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition shadow-lg font-semibold"
                        >
                            <Edit className="w-5 h-5" />
                            Chuyển sang Chế độ Chỉnh sửa
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

    {/* --- HÀNG 1: EMAIL & MẬT KHẨU (NEW) --- */}
    <InputField
      label="Email"
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      // Email thường chỉ cho phép sửa khi tạo mới, không cho sửa khi cập nhật
      disabled={!isCreateMode} 
      required
      type="email"
      isReadOnly={!isCreateMode}
      placeholder="vd: nhanvien@phongkham.com"
    />

    {/* TRƯỜNG MẬT KHẨU (MỚI) */}
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mật khẩu
        {isCreateMode && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          // Luôn là password type, trừ khi người dùng bấm vào biểu tượng con mắt
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          // Áp dụng lại styling đã fix (nền trắng khi view)
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition ${
              isViewMode
                ? 'bg-white text-gray-900 border-gray-300 cursor-default'
                : 'bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500'
          }`}
          // Mật khẩu chỉ bắt buộc khi tạo mới
          required={isCreateMode} 
          // Chỉ cho phép sửa khi Edit/Create, không cho sửa khi View
          disabled={isViewMode}
          placeholder={isViewMode ? '********' : 'Để trống nếu không muốn thay đổi'}
        />
        {(isEditMode || isCreateMode) && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {(isEditMode) && (
        <p className="text-xs text-gray-500 mt-1 italic">
          *Chỉ nhập mật khẩu khi bạn muốn thay đổi.
        </p>
      )}
    </div>
    

    {/* --- HÀNG 2: HỌ VÀ TÊN & SỐ ĐIỆN THOẠI --- */}
    <InputField
      label="Họ và tên"
      name="fullName"
      value={formData.fullName}
      onChange={handleInputChange}
      disabled={isViewMode}
      required
      placeholder="Nguyễn Văn A"
    />
    
    <InputField
      label="Số điện thoại"
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      disabled={isViewMode}
      required
      type="tel"
      maxLength="10"
      pattern="[0-9]{10}"
      placeholder="09xxxxxxxx"
    />


   {/* --- HÀNG 3: NGÀY SINH & GIỚI TÍNH --- */}
    
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Ngày sinh <span className="text-red-500">*</span>
      </label>
      
      {isViewMode ? (
        // CHẾ ĐỘ XEM CHI TIẾT: Chỉ hiển thị text đã định dạng
        <InputField
          name="dob"
          // Chuyển từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị
          value={
            formData.dob && formData.dob.includes('-') 
              ? formData.dob.split('-').reverse().join('/') 
              : formData.dob
          }
          disabled={true} 
          type="text"
          isReadOnly={true}
        />
      ) : (
        // CHẾ ĐỘ CHỈNH SỬA/TẠO MỚI: Dùng React Date Picker
      // CHẾ ĐỘ CHỈNH SỬA/TẠO MỚI: Dùng React Date Picker
      
        <DatePicker
          selected={dateStringToDate(formData.dob)} 
          onChange={(date) => {
            setFormData((prev) => ({
                ...prev,
                dob: dateToISOString(date), 
            }));
          }}
          dateFormat="dd/MM/yyyy" 
          
          // --- CÁC THAY ĐỔI MỚI ---
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
          
          // *** MỚI: CHO PHÉP CHỌN THÁNG TỪ DROPDOWN ***
          showMonthDropdown 
          scrollableMonthYearDropdown 
          
          customInput={<CustomDateInput placeholder="dd/mm/yyyy" required={true} />}
          maxDate={new Date()}
        />
      )}
    </div>

    <SelectField // Trường Giới tính giữ nguyên
      label="Giới tính"
      name="gender"
      value={formData.gender}
      onChange={handleInputChange}
      disabled={isViewMode}
      required
      options={genderOptions}
    />

    {/* --- HÀNG 4: SỐ NĂM KINH NGHIỆM & VAI TRÒ --- */}
    <InputField
      label="Số năm kinh nghiệm"
      name="experienceYears"
      value={formData.experienceYears}
      onChange={handleInputChange}
      disabled={isViewMode}
      type="number"
      min="0"
      placeholder="0"
    />
    
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Vai trò <span className="text-red-500">*</span>
      </label>
      <select
        name="roles"
        value={formData.roles[0] || ''}
        onChange={handleRoleChange}
        // Dùng class tĩnh đã fix
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
        required
        disabled={isViewMode}
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>


  {/* --- HÀNG 5 (CUỐI): ĐỊA CHỈ & GIỚI THIỆU/MÔ TẢ (CÂN BẰNG TEXTAREA) --- */}
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Địa chỉ <span className="text-red-500">*</span>
      </label>
      <textarea
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        rows="4" // Chỉ định số dòng để cả hai có cùng chiều cao
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
        disabled={isViewMode}
        required
        placeholder="Số nhà, đường, quận/huyện..."
      />
    </div>
    
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mô tả công việc<span className="text-red-500">*</span>
      </label>
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleInputChange}
        rows="4" // Chỉ định số dòng để cả hai có cùng chiều cao
        maxLength="1000"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition"
        disabled={isViewMode}
      />
      {(!isViewMode) && (
        <p className="text-xs text-gray-500 mt-1">
          {formData.bio.length}/1000 ký tự
        </p>
      )}
    </div>

  </div>

  {/* --- NÚT BẤM (SUBMIT / CANCEL) --- */}
  {(isCreateMode || isEditMode) && (
    <div className="flex gap-4 mt-8">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold shadow-lg active:scale-[0.99] transform"
      >
        {loading ? (
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></div>
        ) : isCreateMode ? (
          'Tạo Tài khoản'
        ) : (
          'Lưu Cập nhật'
        )}
      </button>
      <button
        type="button"
        onClick={handleCloseModal}
        className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold active:scale-[0.99] transform"
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
      
      {/* --- Delete Confirmation Modal --- */}
      {showDeleteConfirmation && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all duration-300">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận Xóa Tài khoản</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản của **{userToDelete.fullName}** ({userToDelete.email})? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Xác nhận Xóa'}
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
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

// --- Reusable Form Components ---

const InputField = ({ label, name, value, onChange, disabled, required, type = 'text', pattern, min, isTextArea = false, isReadOnly = false, placeholder }) => {
    // Determine the class for read-only/disabled state
    const isInactive = disabled || isReadOnly;
    const inactiveClass = isInactive ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500';
    
    return (
      <div className="col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isTextArea ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows="2"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${inactiveClass}`}
                disabled={disabled}
                required={required}
                readOnly={isReadOnly}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${inactiveClass}`}
                disabled={disabled}
                required={required}
                readOnly={isReadOnly}
                pattern={pattern}
                min={min}
                placeholder={placeholder}
            />
        )}
      </div>
    );
};

const SelectField = ({ label, name, value, onChange, disabled, required, options }) => {
    const inactiveClass = disabled ? 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500';

    return (
        <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${inactiveClass}`}
                required={required}
                disabled={disabled}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};