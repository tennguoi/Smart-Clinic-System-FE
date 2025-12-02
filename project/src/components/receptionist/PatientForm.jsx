import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { vi, enUS } from 'date-fns/locale';
import { X, Edit } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '../../contexts/ThemeContext';

export default function PatientForm({ patientForm, isEdit, onChange, onSubmit, onCancel }) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  
  // State để quản lý chế độ xem/sửa (chỉ áp dụng khi isEdit = true)
  const [isEditMode, setIsEditMode] = useState(!isEdit);

  const isDark = theme === 'dark';

  // Priority options with i18n
  const priorityOptions = [
    { value: 'Normal', label: t('queueManagement.priority.normal') },
    { value: 'Urgent', label: t('queueManagement.priority.urgent') },
    { value: 'Emergency', label: t('queueManagement.priority.emergency') },
  ];

  // Gender options with i18n
  const genderOptions = [
    { value: 'male', label: t('queueManagement.patientForm.gender.male') },
    { value: 'female', label: t('queueManagement.patientForm.gender.female') },
    { value: 'other', label: t('queueManagement.patientForm.gender.other') },
  ];

  // Get DatePicker locale based on current language
  const datePickerLocale = i18n.language === 'vi' ? vi : enUS;

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
      <div className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b sticky top-0 backdrop-blur z-10 transition-colors ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {isEdit 
              ? (isEditMode 
                  ? t('queueManagement.patientForm.editTitle') 
                  : t('queueManagement.patientForm.viewTitle'))
              : t('queueManagement.patientForm.addTitle')}
          </h2>
          <div className="flex items-center gap-2">
            {/* Nút Chỉnh sửa - chỉ hiện khi đang ở chế độ xem */}
            {isEdit && !isEditMode && (
              <button
                onClick={handleSwitchToEdit}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="w-5 h-5" />
                {t('queueManagement.patientForm.editButton')}
              </button>
            )}
            <button
              onClick={onCancel}
              className={`transition-colors ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
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
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.patientName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientForm.patientName}
                onChange={(e) => onChange('patientName', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.namePlaceholder')}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.phone')} <span className="text-red-500">*</span>
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.phonePlaceholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.email')}
              </label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => onChange('email', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.emailPlaceholder')}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.dob')} <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={patientForm.dobDate}
                onChange={(date) => onChange('dob', date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                locale={datePickerLocale}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                isClearable
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                wrapperClassName="w-full"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.gender.label')}
              </label>
              <select
                value={patientForm.gender}
                onChange={(e) => onChange('gender', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
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
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.priority')} <span className="text-red-500">*</span>
              </label>
              <select
                value={patientForm.priority}
                onChange={(e) => onChange('priority', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
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
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.idNumber')}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.idPlaceholder')}
                maxLength="12"
              />
            </div>

            {/* Insurance Number - Số thẻ BHYT */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.insurance')}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.insurancePlaceholder')}
                maxLength="15"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.address')}
              </label>
              <textarea
                value={patientForm.address}
                onChange={(e) => onChange('address', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.addressPlaceholder')}
                rows="2"
              />
            </div>

            {/* Notes - Triệu chứng */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('queueManagement.patientForm.notes')}
              </label>
              <textarea
                value={patientForm.notes || ''}
                onChange={(e) => onChange('notes', e.target.value)}
                disabled={isDisabled}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder={t('queueManagement.patientForm.notesPlaceholder')}
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
                {isEdit 
                  ? t('queueManagement.patientForm.updateButton') 
                  : t('queueManagement.patientForm.addButton')}
              </button>
              <button
                onClick={onCancel}
                className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium ${
                  isDark 
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {t('queueManagement.patientForm.cancelButton')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}