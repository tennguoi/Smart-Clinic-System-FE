import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  CreditCard, 
  FileText, 
  AlertTriangle,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatPhone, formatGender, calculateAge } from '../api/patientApi';
import { useTranslation } from '../hooks/useTranslation';

const PatientDetail = ({ patient, onClose, onEdit }) => {
  const { t } = useTranslation();

  if (!patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Chưa có thông tin';
    return new Date(dateTimeString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoSection = ({ title, icon: Icon, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Icon className="mr-2" size={20} />
        {title}
      </h3>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex py-2 ${className}`}>
      <dt className="w-1/3 text-sm font-medium text-gray-600">{label}:</dt>
      <dd className="w-2/3 text-sm text-gray-900">{value || 'Chưa có thông tin'}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết bệnh nhân
            </h2>
            <p className="text-sm text-gray-600">
              Mã BN: <span className="font-semibold">{patient.patientCode}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(patient)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div>
              {/* Basic Information */}
              <InfoSection title="Thông tin cơ bản" icon={User}>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="divide-y divide-gray-200">
                    <InfoRow label="Họ và tên" value={patient.fullName} className="font-semibold" />
                    <InfoRow 
                      label="Giới tính" 
                      value={formatGender(patient.gender)} 
                    />
                    <InfoRow 
                      label="Ngày sinh" 
                      value={patient.dateOfBirth ? (
                        <>
                          {formatDate(patient.dateOfBirth)}
                          {patient.dateOfBirth && (
                            <span className="text-blue-600 ml-2">
                              ({calculateAge(patient.dateOfBirth)} tuổi)
                            </span>
                          )}
                        </>
                      ) : 'Chưa có thông tin'}
                    />
                    <InfoRow 
                      label="CMND/CCCD" 
                      value={patient.identityCard} 
                    />
                  </dl>
                </div>
              </InfoSection>

              {/* Contact Information */}
              <InfoSection title="Thông tin liên hệ" icon={Phone}>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="divide-y divide-gray-200">
                    <InfoRow 
                      label="Số điện thoại" 
                      value={
                        <a 
                          href={`tel:${patient.phone}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Phone size={14} className="mr-1" />
                          {formatPhone(patient.phone)}
                        </a>
                      }
                    />
                    <InfoRow 
                      label="Email" 
                      value={patient.email ? (
                        <a 
                          href={`mailto:${patient.email}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Mail size={14} className="mr-1" />
                          {patient.email}
                        </a>
                      ) : 'Chưa có thông tin'}
                    />
                    <InfoRow 
                      label="Địa chỉ" 
                      value={patient.address ? (
                        <div className="flex items-start">
                          <MapPin size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                          <span>{patient.address}</span>
                        </div>
                      ) : 'Chưa có thông tin'}
                    />
                  </dl>
                </div>
              </InfoSection>

              {/* Emergency Contact */}
              <InfoSection title="Liên hệ khẩn cấp" icon={AlertTriangle}>
                <div className="bg-red-50 rounded-lg p-4">
                  <dl className="divide-y divide-red-200">
                    <InfoRow 
                      label="Người liên hệ" 
                      value={patient.emergencyContact}
                    />
                    <InfoRow 
                      label="Số điện thoại" 
                      value={patient.emergencyPhone ? (
                        <a 
                          href={`tel:${patient.emergencyPhone}`}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Phone size={14} className="mr-1" />
                          {formatPhone(patient.emergencyPhone)}
                        </a>
                      ) : 'Chưa có thông tin'}
                    />
                  </dl>
                </div>
              </InfoSection>
            </div>

            {/* Right Column */}
            <div>
              {/* Insurance Information */}
              <InfoSection title="Thông tin bảo hiểm" icon={CreditCard}>
                <div className="bg-green-50 rounded-lg p-4">
                  <dl>
                    <InfoRow 
                      label="Số thẻ BHYT" 
                      value={patient.insuranceNumber || (
                        <span className="text-gray-500 italic">Chưa có bảo hiểm</span>
                      )}
                    />
                  </dl>
                </div>
              </InfoSection>

              {/* Medical History */}
              <InfoSection title="Tiền sử bệnh" icon={FileText}>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-gray-900">
                    {patient.medicalHistory || (
                      <span className="text-gray-500 italic">Không có tiền sử bệnh</span>
                    )}
                  </div>
                </div>
              </InfoSection>

              {/* Allergies */}
              <InfoSection title="Dị ứng" icon={AlertTriangle}>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-gray-900">
                    {patient.allergies || (
                      <span className="text-gray-500 italic">Không có dị ứng</span>
                    )}
                  </div>
                </div>
              </InfoSection>

              {/* Notes */}
              <InfoSection title="Ghi chú" icon={FileText}>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-900">
                    {patient.notes || (
                      <span className="text-gray-500 italic">Không có ghi chú</span>
                    )}
                  </div>
                </div>
              </InfoSection>

              {/* System Information */}
              <InfoSection title="Thông tin hệ thống" icon={Clock}>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="divide-y divide-gray-200">
                    <InfoRow 
                      label="Ngày tạo" 
                      value={
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDateTime(patient.createdAt)}
                        </div>
                      }
                    />
                    <InfoRow 
                      label="Người tạo" 
                      value={patient.createdByName ? (
                        <div className="flex items-center">
                          <UserCheck size={14} className="mr-1" />
                          {patient.createdByName}
                        </div>
                      ) : 'Hệ thống'}
                    />
                    {patient.updatedAt && (
                      <InfoRow 
                        label="Cập nhật lần cuối" 
                        value={
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatDateTime(patient.updatedAt)}
                          </div>
                        }
                      />
                    )}
                  </dl>
                </div>
              </InfoSection>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
