import React from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';

// 1. Import thư viện lịch
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 2. Cấu hình tiếng Việt cho lịch
import { registerLocale } from 'react-datepicker';
import vi from 'date-fns/locale/vi';
registerLocale('vi', vi);

// --- CONSTANTS ---
const priorityOptions = [
  { value: 'Normal', label: 'Thường' },
  { value: 'Urgent', label: 'Ưu tiên' },
  { value: 'Emergency', label: 'Khẩn cấp' },
];

// === ĐÃ SỬA Ở ĐÂY: Value phải khớp với dữ liệu mặc định ở cha ('Nam') ===
const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
];

export default function PatientForm({ patientForm, isEdit, onChange, onSubmit, onCancel }) {
  
  // Hàm xử lý khi submit
  const handleSubmit = () => {
    // Validate cơ bản
    if (!patientForm.patientName || !patientForm.phone) {
        // Bạn có thể thêm toast error ở đây nếu muốn chặn submit
        // toast.error("Vui lòng điền tên và số điện thoại");
        // return;
    }
    onSubmit();
  };

  // Helper: Chuyển chuỗi yyyy-mm-dd thành Date Object cho DatePicker hiển thị
  const getSelectedDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    // Kiểm tra nếu ngày không hợp lệ
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper: Chuyển Date Object từ DatePicker thành chuỗi yyyy-mm-dd để lưu xuống DB
  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange('dob', `${year}-${month}-${day}`);
    } else {
      onChange('dob', '');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Chỉnh sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- Form Content --- */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bệnh nhân <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientForm.patientName}
                onChange={(e) => onChange('patientName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên đầy đủ"
              />
            </div>

            {/* 2. Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={patientForm.phone}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 10) value = value.slice(0, 10); // Giới hạn 10 số
                  onChange('phone', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 0912345678"
              />
            </div>

            {/* 3. Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
              />
            </div>

            {/* 4. Date of Birth - REACT-DATEPICKER */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <div className="relative w-full">
                <DatePicker
                  selected={getSelectedDate(patientForm.dob)}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  locale="vi"
                  placeholderText="dd/mm/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 block w-full"
                  wrapperClassName="w-full"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  // Tắt input nhập tay để tránh lỗi format, bắt buộc chọn lịch
                  onKeyDown={(e) => e.preventDefault()} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* 5. Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Option rỗng bị bỏ đi vì ta đã set default là Nam */}
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ ưu tiên <span className="text-red-500">*</span>
              </label>
              <select
                value={patientForm.priority}
                onChange={(e) => onChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <textarea
                value={patientForm.address}
                onChange={(e) => onChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập địa chỉ đầy đủ"
                rows="2"
              />
            </div>
          </div>

          {/* --- Note Section --- */}
          {!isEdit && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl">ℹ️</span>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Lưu ý:</p>
                  <p className="text-xs text-blue-700">
                    Hệ thống chỉ cho phép thêm bệnh nhân trong khung giờ làm việc: 
                    <span className="font-semibold"> 8:00-12:00</span> (sáng) và 
                    <span className="font-semibold"> 14:00-18:00</span> (chiều)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- Footer Actions --- */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm active:transform active:scale-[0.98]"
            >
              {isEdit ? 'Cập nhật thông tin' : 'Thêm bệnh nhân'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200 active:transform active:scale-[0.98]"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}