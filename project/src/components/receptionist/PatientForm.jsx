import React from 'react';
import { X } from 'lucide-react';

const priorityOptions = [
  { value: 'Normal', label: 'Thường' },
  { value: 'Urgent', label: 'Ưu tiên' },
  { value: 'Emergency', label: 'Khẩn cấp' },
];

const genderOptions = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function PatientForm({ patientForm, isEdit, onChange, onSubmit, onCancel }) {
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
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

        {/* Form Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Name */}
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={patientForm.phone}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 10) value = value.slice(0, 10);
                  onChange('phone', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 0912345678"
              />
            </div>

            {/* Email */}
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

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={patientForm.dob}
                onChange={(e) => onChange('dob', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) => onChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
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

            {/* 🆕 ID Number - Số căn cước */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số căn cước / CMND
              </label>
              <input
                type="text"
                value={patientForm.idNumber || ''}
                onChange={(e) => {
                  // Chỉ cho phép số, giới hạn 12 số
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 12) value = value.slice(0, 12);
                  onChange('idNumber', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 001234567890"
                maxLength="12"
              />
            </div>

            {/* 🆕 Insurance Number - Số thẻ BHYT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số thẻ BHYT
              </label>
              <input
                type="text"
                value={patientForm.insuranceNumber || ''}
                onChange={(e) => {
                  // Cho phép chữ và số, viết hoa tự động
                  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length > 15) value = value.slice(0, 15);
                  onChange('insuranceNumber', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: HS4010012345678"
                maxLength="15"
              />
            </div>

            {/* Address */}
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

            {/* 🆕 Notes - Triệu chứng */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Triệu chứng / Ghi chú
              </label>
              <textarea
                value={patientForm.notes || ''}
                onChange={(e) => onChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                rows="3"
              />
            </div>
          </div>

          {/* Thông báo khung giờ làm việc - Chỉ hiển thị khi thêm mới */}
          {!isEdit && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800 font-medium mb-1">ℹ️ Lưu ý:</p>
              <p className="text-xs text-blue-700">
                Hệ thống chỉ cho phép thêm bệnh nhân trong khung giờ làm việc: 
                <span className="font-semibold"> 8:00-12:00</span> (sáng) và 
                <span className="font-semibold"> 14:00-18:00</span> (chiều)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {isEdit ? 'Cập nhật' : 'Thêm bệnh nhân'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}