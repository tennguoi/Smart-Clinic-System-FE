import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { vi } from 'date-fns/locale';
import { X, Edit } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

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
  // State để quản lý chế độ xem/sửa (chỉ áp dụng khi isEdit = true)
  const [isEditMode, setIsEditMode] = useState(!isEdit);

  const handleSubmit = () => {
    onSubmit();
  };

  const handleSwitchToEdit = () => {
    setIsEditMode(true);
  };

  // Nếu đang ở chế độ "xem chi tiết", disable tất cả input
  const isDisabled = isEdit && !isEditMode;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? (isEditMode ? 'Chỉnh sửa thông tin bệnh nhân' : 'Xem chi tiết bệnh nhân') : 'Thêm bệnh nhân mới'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Nút Chỉnh sửa - chỉ hiện khi đang ở chế độ xem */}
            {isEdit && !isEditMode && (
              <button
                onClick={handleSwitchToEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5" />
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="example@email.com"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={patientForm.dobDate}
                onChange={(date) => onChange('dob', date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                locale={vi}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                isClearable
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                wrapperClassName="w-full"
                required
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Number - Số căn cước */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số căn cước / CMND
              </label>
              <input
                type="text"
                value={patientForm.idNumber || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 12) value = value.slice(0, 12);
                  onChange('idNumber', value);
                }}
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="VD: 001234567890"
                maxLength="12"
              />
            </div>

            {/* Insurance Number - Số thẻ BHYT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số thẻ BHYT
              </label>
              <input
                type="text"
                value={patientForm.insuranceNumber || ''}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length > 15) value = value.slice(0, 15);
                  onChange('insuranceNumber', value);
                }}
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Nhập địa chỉ đầy đủ"
                rows="2"
              />
            </div>

            {/* Notes - Triệu chứng */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Triệu chứng / Ghi chú
              </label>
              <textarea
                value={patientForm.notes || ''}
                onChange={(e) => onChange('notes', e.target.value)}
                disabled={isDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Mô tả triệu chứng hoặc lý do khám bệnh..."
                rows="3"
              />
            </div>
          </div>

         

          {/* Action Buttons */}
          {/* Chỉ hiện nút khi KHÔNG phải chế độ xem (isEdit && !isEditMode) */}
          {(!isEdit || isEditMode) && (
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
          )}
        </div>
      </div>
    </div>
  );
}