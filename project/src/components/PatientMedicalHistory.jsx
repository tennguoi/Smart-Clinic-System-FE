import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Stethoscope,
  Pill,
  AlertTriangle,
  Info,
  Search,
  Download,
  FileDown
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { authService } from '../services/authService';
import { medicalRecordApi } from '../api/medicalRecordApi';
import PrescriptionPDF from './PrescriptionPDF';

const PatientMedicalHistory = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('records');
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    if (patient?.patientId) {
      fetchMedicalHistory();
    }
  }, [patient]);

  const fetchMedicalHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch medical records using the new API
      const recordsData = await medicalRecordApi.getPatientHistory(patient.patientId);
      setMedicalRecords(recordsData);

      // Fetch prescriptions (if API exists)
      try {
        const token = authService.getToken();
        const prescriptionsResponse = await fetch(
          `http://localhost:8082/api/prescriptions/patient/${patient.patientId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (prescriptionsResponse.ok) {
          const prescriptionsData = await prescriptionsResponse.json();
          setPrescriptions(prescriptionsData.content || prescriptionsData);
        }
      } catch (prescError) {
        console.log('Prescriptions not available yet');
      }

    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError('Không thể tải lịch sử khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  const exportPatientHistoryToPDF = async () => {
    try {
      await medicalRecordApi.exportPatientHistoryToPDF(patient.patientId);
    } catch (error) {
      console.error('Error exporting patient history:', error);
      setError('Không thể xuất lịch sử bệnh án');
    }
  };

  const exportMedicalRecordToPDF = async (recordId) => {
    try {
      await medicalRecordApi.exportMedicalRecordToPDF(recordId);
    } catch (error) {
      console.error('Error exporting medical record:', error);
      setError('Không thể xuất bệnh án');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const filteredRecords = medicalRecords.filter(record =>
    !searchTerm || 
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter(prescription =>
    !searchTerm || 
    prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.items?.some(item => 
      item.medicationName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Đang tải lịch sử khám bệnh...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <Clock className="mr-2" size={20} />
                Lịch sử khám bệnh
              </h2>
              <p className="text-blue-100 mt-1">
                Bệnh nhân: {patient?.fullName} ({patient?.patientCode})
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportPatientHistoryToPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                title="Xuất lịch sử bệnh án PDF"
              >
                <FileDown size={16} className="mr-2" />
                Xuất PDF
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('records')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'records'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="inline mr-2" size={16} />
                Hồ sơ khám bệnh ({medicalRecords.length})
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'prescriptions'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Pill className="inline mr-2" size={16} />
                Toa thuốc ({prescriptions.length})
              </button>
            </div>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm theo chẩn đoán, bác sĩ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">Chưa có hồ sơ khám bệnh</h3>
                  <p>Bệnh nhân chưa có lịch sử khám bệnh nào</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div key={record.recordId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleRecordExpansion(record.recordId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {expandedRecord === record.recordId ? (
                            <ChevronDown size={20} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-500" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <Calendar size={16} className="text-gray-500" />
                              <span className="font-medium">{formatDateTime(record.examinationDate)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-700'
                                  : record.status === 'DRAFT'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {record.status === 'COMPLETED' ? 'Hoàn thành' : 
                                 record.status === 'DRAFT' ? 'Bản nháp' : 'Lưu trữ'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Bác sĩ: {record.doctorName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportMedicalRecordToPDF(record.recordId);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                            title="Xuất bệnh án PDF"
                          >
                            <Download size={14} />
                          </button>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {record.diagnosis || 'Chưa có chẩn đoán'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.chiefComplaint && record.chiefComplaint.length > 50 
                                ? `${record.chiefComplaint.substring(0, 50)}...`
                                : record.chiefComplaint}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedRecord === record.recordId && (
                      <div className="bg-white px-4 py-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Info size={16} className="mr-1" />
                                Lý do khám
                              </h4>
                              <p className="text-gray-700 text-sm">{record.chiefComplaint || 'Không có'}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Quá trình bệnh lý</h4>
                              <p className="text-gray-700 text-sm">{record.historyOfPresentIllness || 'Không có'}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Stethoscope size={16} className="mr-1" />
                                Khám thể chất
                              </h4>
                              <p className="text-gray-700 text-sm">{record.physicalExamination || 'Không có'}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Dấu hiệu sinh tồn</h4>
                              <p className="text-gray-700 text-sm">{record.vitalSigns || 'Không có'}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Chẩn đoán</h4>
                              <p className="text-gray-700 text-sm font-medium">{record.diagnosis || 'Chưa có chẩn đoán'}</p>
                              {record.differentialDiagnosis && (
                                <p className="text-gray-600 text-sm mt-1">
                                  <span className="font-medium">Chẩn đoán phân biệt:</span> {record.differentialDiagnosis}
                                </p>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Phác đồ điều trị</h4>
                              <p className="text-gray-700 text-sm">{record.treatmentPlan || 'Không có'}</p>
                            </div>

                            {record.followUpInstructions && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn tái khám</h4>
                                <p className="text-gray-700 text-sm">{record.followUpInstructions}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {record.additionalNotes && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-gray-900 mb-2">Ghi chú thêm</h4>
                            <p className="text-gray-700 text-sm">{record.additionalNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">Chưa có toa thuốc</h3>
                  <p>Bệnh nhân chưa có toa thuốc nào</p>
                </div>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <div key={prescription.prescriptionId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill size={16} className="text-blue-500" />
                          <span className="font-medium">Toa thuốc #{prescription.prescriptionCode}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prescription.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-700'
                              : prescription.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {prescription.status === 'ACTIVE' ? 'Đang sử dụng' :
                             prescription.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Ngày kê: {formatDateTime(prescription.prescribedDate)}</div>
                          <div>Bác sĩ: {prescription.doctorName}</div>
                          {prescription.diagnosis && (
                            <div>Chẩn đoán: {prescription.diagnosis}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {prescription.items && prescription.items.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-3">Danh sách thuốc:</h5>
                        <div className="space-y-3">
                          {prescription.items.map((item, index) => (
                            <div key={item.itemId || index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{item.medicationName}</div>
                                  {item.strength && (
                                    <div className="text-sm text-gray-600">Hàm lượng: {item.strength}</div>
                                  )}
                                  <div className="text-sm text-gray-600">
                                    Số lượng: {item.quantity} {item.unit}
                                  </div>
                                </div>
                              </div>
                              {item.dosageInstructions && (
                                <div className="mt-2 text-sm text-blue-700">
                                  <strong>Cách dùng:</strong> {item.dosageInstructions}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <div className="mt-1 text-sm text-orange-700">
                                  <AlertTriangle size={14} className="inline mr-1" />
                                  <strong>Lưu ý:</strong> {item.specialInstructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prescription.treatmentInstructions && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Hướng dẫn điều trị:</h5>
                        <p className="text-sm text-blue-800">{prescription.treatmentInstructions}</p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div className="mt-3 text-sm text-gray-600">
                        <Calendar size={14} className="inline mr-1" />
                        <strong>Tái khám:</strong> {formatDateTime(prescription.followUpDate)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
