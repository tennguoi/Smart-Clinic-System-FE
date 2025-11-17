import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  FileText, 
  User, 
  Calendar,
  Stethoscope,
  Activity,
  BookOpen,
  Pill,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { authService } from '../services/authService';

const MedicalRecordForm = ({ patient, onClose, onSave, initialData = null }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    examinationDate: new Date().toISOString().slice(0, 16),
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    vitalSigns: '',
    diagnosis: '',
    differentialDiagnosis: '',
    treatmentPlan: '',
    medications: '',
    followUpInstructions: '',
    additionalNotes: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        examinationDate: initialData.examinationDate 
          ? new Date(initialData.examinationDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const payload = {
        ...formData,
        patientId: patient.patientId,
        examinationDate: new Date(formData.examinationDate).toISOString()
      };

      const url = initialData 
        ? `http://localhost:8082/api/medical-records/${initialData.recordId}`
        : 'http://localhost:8082/api/medical-records';
      
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Không thể lưu hồ sơ bệnh án');
      }

      const result = await response.json();
      setSuccess(true);
      setTimeout(() => {
        onSave?.(result);
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving medical record:', error);
      setError(error.message || 'Đã xảy ra lỗi khi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: 'DRAFT' }));
    setTimeout(() => {
      document.getElementById('medical-record-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  const handleSaveAsCompleted = () => {
    setFormData(prev => ({ ...prev, status: 'COMPLETED' }));
    setTimeout(() => {
      document.getElementById('medical-record-form').dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 0);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {initialData ? 'Cập nhật thành công!' : 'Tạo hồ sơ thành công!'}
            </h3>
            <p className="text-gray-600">
              Hồ sơ bệnh án đã được lưu vào hệ thống
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="mr-2" size={20} />
                {initialData ? 'Cập nhật hồ sơ bệnh án' : 'Tạo hồ sơ bệnh án mới'}
              </h2>
              <p className="text-blue-100 mt-1">
                Bệnh nhân: {patient?.fullName} ({patient?.patientCode})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="mr-2" size={16} />
              {error}
            </div>
          )}

          <form id="medical-record-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Ngày khám *
                </label>
                <input
                  type="datetime-local"
                  name="examinationDate"
                  value={formData.examinationDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="inline mr-1" size={16} />
                  Dấu hiệu sinh tồn
                </label>
                <input
                  type="text"
                  name="vitalSigns"
                  value={formData.vitalSigns}
                  onChange={handleInputChange}
                  placeholder="Huyết áp, mạch, nhiệt độ, cân nặng..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Lý do khám */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-1" size={16} />
                Lý do khám *
              </label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                rows={3}
                placeholder="Bệnh nhân đến khám vì..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Quá trình bệnh lý */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline mr-1" size={16} />
                Quá trình bệnh lý
              </label>
              <textarea
                name="historyOfPresentIllness"
                value={formData.historyOfPresentIllness}
                onChange={handleInputChange}
                rows={4}
                placeholder="Mô tả chi tiết quá trình diễn biến bệnh..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Khám thể chất */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="inline mr-1" size={16} />
                Khám thể chất
              </label>
              <textarea
                name="physicalExamination"
                value={formData.physicalExamination}
                onChange={handleInputChange}
                rows={4}
                placeholder="Kết quả khám lâm sàng..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Chẩn đoán */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chẩn đoán *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Chẩn đoán chính..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chẩn đoán phân biệt
                </label>
                <textarea
                  name="differentialDiagnosis"
                  value={formData.differentialDiagnosis}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Các chẩn đoán phân biệt..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Phác đồ điều trị */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Pill className="inline mr-1" size={16} />
                Phác đồ điều trị
              </label>
              <textarea
                name="treatmentPlan"
                value={formData.treatmentPlan}
                onChange={handleInputChange}
                rows={4}
                placeholder="Kế hoạch điều trị..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Thuốc kê đơn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thuốc kê đơn
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                rows={4}
                placeholder="Danh sách thuốc và li용..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hướng dẫn tái khám */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline mr-1" size={16} />
                Hướng dẫn tái khám
              </label>
              <textarea
                name="followUpInstructions"
                value={formData.followUpInstructions}
                onChange={handleInputChange}
                rows={3}
                placeholder="Hướng dẫn táikhám và theo dõi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Các ghi chú khác..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              * Thông tin bắt buộc
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={loading}
                className="px-4 py-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
              <button
                type="button"
                onClick={handleSaveAsCompleted}
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="mr-1" size={16} />
                {loading ? 'Đang lưu...' : 'Hoàn thành'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordForm;
