import React from 'react';

const priorityLabels = { Normal: 'Thường', Urgent: 'Ưu tiên', Emergency: 'Khẩn cấp' };
const statusLabels = { Waiting: 'Chờ khám', InProgress: 'Đang khám', Completed: 'Đã hoàn thành', Cancelled: 'Hủy' };

export default function PatientForm({ 
  patientForm, 
  isEdit, 
  onChange, 
  onSubmit, 
  onCancel 
}) {
  return (
    <div className="bg-white p-4 border rounded shadow space-y-2">
      <h3 className="font-semibold">
        {isEdit ? 'Cập nhật bệnh nhân' : 'Thêm bệnh nhân mới'}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <input 
          placeholder="Tên bệnh nhân" 
          value={patientForm.patientName} 
          onChange={(e) => onChange('patientName', e.target.value)} 
          className="border px-2 py-1 rounded" 
        />
        <input 
          placeholder="Số điện thoại" 
          value={patientForm.phone} 
          onChange={(e) => onChange('phone', e.target.value)} 
          className="border px-2 py-1 rounded" 
        />
        <input 
          placeholder="Email" 
          value={patientForm.email} 
          onChange={(e) => onChange('email', e.target.value)} 
          className="border px-2 py-1 rounded" 
        />
        <input 
          type="date" 
          placeholder="Ngày sinh" 
          value={patientForm.dob} 
          onChange={(e) => onChange('dob', e.target.value)} 
          className="border px-2 py-1 rounded" 
        />
        <select 
          value={patientForm.gender} 
          onChange={(e) => onChange('gender', e.target.value)} 
          className="border px-2 py-1 rounded"
        >
          <option value="">Chọn giới tính</option>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
        <input 
          placeholder="Địa chỉ" 
          value={patientForm.address} 
          onChange={(e) => onChange('address', e.target.value)} 
          className="border px-2 py-1 rounded" 
        />
        <select 
          value={patientForm.priority} 
          onChange={(e) => onChange('priority', e.target.value)} 
          className="border px-2 py-1 rounded"
        >
          {Object.entries(priorityLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {isEdit && (
          <select 
            value={patientForm.status} 
            onChange={(e) => onChange('status', e.target.value)} 
            className="border px-2 py-1 rounded"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        )}
        <input 
          type="datetime-local" 
          value={patientForm.checkInTime} 
          onChange={(e) => onChange('checkInTime', e.target.value)} 
          className="border px-2 py-1 rounded" 
          min={!isEdit ? new Date().toISOString().slice(0, 16) : undefined} 
        />
      </div>
      <div className="flex space-x-2 mt-2">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
          onClick={onSubmit}
        >
          {isEdit ? 'Cập nhật' : 'Thêm'}
        </button>
        <button 
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}