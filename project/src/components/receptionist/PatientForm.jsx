import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { vi } from 'date-fns/locale';
import { X, Calendar, User } from 'lucide-react';
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

export default function PatientForm({ patientForm, isEdit, onChange, onSubmit, onCancel, selectedAppointment }) {

  // Tự động điền thông tin khi có selectedAppointment
useEffect(() => {
  if (selectedAppointment && !isEdit) {
    onChange('patientName', selectedAppointment.patientName || '');
    onChange('phone', selectedAppointment.phone || '');
    onChange('email', selectedAppointment.email || '');
    onChange('notes', selectedAppointment.notes || '');
    onChange('priority', selectedAppointment.priority || 'Urgent'); // Ưu tiên
  }
}, [selectedAppointment, isEdit, onChange]);

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

        {/* Thông báo nếu đang điền từ lịch hẹn */}
        {selectedAppointment && !isEdit && (
          <div className="p-6 bg-blue-50 border-b">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  Đang điền thông tin từ lịch hẹn: {selectedAppointment.appointmentCode}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Vui lòng bổ sung các trường còn thiếu (ngày sinh, giới tính, địa chỉ...) trước khi thêm bệnh nhân
                </p>
              </div>
            </div>
          </div>
        )}

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
                disabled={selectedAppointment} // Khóa nếu từ appointment
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                wrapperClassName="w-full"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính <span className="text-red-500">*</span>
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
              {selectedAppointment && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Tự động ưu tiên cho bệnh nhân đặt lịch
                </p>
              )}
            </div>

            {/* ID Number */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 001234567890"
                maxLength="12"
              />
            </div>

            {/* Insurance Number */}
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

            {/* Notes */}
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

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onSubmit}
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