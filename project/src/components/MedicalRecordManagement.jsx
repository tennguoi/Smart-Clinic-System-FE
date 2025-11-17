import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Eye,
  FileDown
} from 'lucide-react';
import { medicalRecordApi } from '../api/medicalRecordApi';
import MedicalRecordForm from './MedicalRecordForm';

const MedicalRecordManagement = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('examinationDate');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMedicalRecords();
  }, [currentPage, sortBy, sortDir, statusFilter]);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await medicalRecordApi.getMyMedicalRecords(
        currentPage, 
        pageSize, 
        sortBy, 
        sortDir
      );
      setMedicalRecords(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      setError('Không thể tải danh sách bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh án này?')) {
      return;
    }

    try {
      await medicalRecordApi.deleteMedicalRecord(recordId);
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      setError('Không thể xóa bệnh án');
    }
  };

  const handleExportRecord = async (recordId) => {
    try {
      await medicalRecordApi.exportMedicalRecordToPDF(recordId);
    } catch (error) {
      console.error('Error exporting medical record:', error);
      setError('Không thể xuất bệnh án');
    }
  };

  const handleSaveRecord = async () => {
    setShowForm(false);
    setSelectedRecord(null);
    fetchMedicalRecords();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'DRAFT': return 'Bản nháp';
      case 'ARCHIVED': return 'Lưu trữ';
      default: return status;
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  if (loading && medicalRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách bệnh án...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3" size={28} />
              Quản lý bệnh án
            </h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi bệnh án của bệnh nhân</p>
          </div>
          <button
            onClick={handleCreateRecord}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Tạo bệnh án mới
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bệnh nhân, mã bệnh nhân, chẩn đoán..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Bộ lọc
            {showFilters ? <ChevronDown size={16} className="ml-2" /> : <ChevronRight size={16} className="ml-2" />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Medical Records List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('examinationDate')}
                    className="flex items-center hover:text-gray-700"
                  >
                    <Calendar size={14} className="mr-1" />
                    Ngày khám
                    {sortBy === 'examinationDate' && (
                      sortDir === 'asc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bệnh nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chẩn đoán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <React.Fragment key={record.recordId}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(record.examinationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                          <div className="text-xs text-gray-500">{record.patientCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.diagnosis || 'Chưa có chẩn đoán'}
                      </div>
                      {record.chiefComplaint && (
                        <div className="text-xs text-gray-500 mt-1">
                          {record.chiefComplaint.length > 50 
                            ? `${record.chiefComplaint.substring(0, 50)}...`
                            : record.chiefComplaint}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleRecordExpansion(record.recordId)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-green-600 hover:text-green-900"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleExportRecord(record.recordId)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Xuất FDF"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.recordId)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedRecord === record.recordId && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <div className="text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Thông tin khám</h4>
                              <div className="space-y-1">
                                <p><span className="font-medium">Lý do khám:</span> {record.chiefComplaint || 'N/A'}</p>
                                <p><span className="font-medium">Quá trình bệnh lý:</span> {record.historyOfPresentIllness || 'N/A'}</p>
                                <p><span className="font-medium">Khám thể chất:</span> {record.physicalExamination || 'N/A'}</p>
                                <p><span className="font-medium">Dấu hiệu sinh tồn:</span> {record.vitalSigns || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Điều trị</h4>
                              <div className="space-y-1">
                                <p><span className="font-medium">Chẩn đoán phân biệt:</span> {record.differentialDiagnosis || 'N/A'}</p>
                                <p><span className="font-medium">Phác đồ điều trị:</span> {record.treatmentPlan || 'N/A'}</p>
                                <p><span className="font-medium">Thuốc:</span> {record.medications || 'N/A'}</p>
                                <p><span className="font-medium">Hướng dẫn tái khám:</span> {record.followUpInstructions || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          {record.additionalNotes && (
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Ghi chú thêm</h4>
                              <p className="text-gray-700">{record.additionalNotes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {currentPage * pageSize + 1} đến {Math.min((currentPage + 1) * pageSize, filteredRecords.length)} của {filteredRecords.length} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-3 py-1">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Medical Record Form Modal */}
      {showForm && (
        <MedicalRecordForm
          patient={selectedRecord?.patient || null}
          initialData={selectedRecord}
          onClose={() => {
            setShowForm(false);
            setSelectedRecord(null);
          }}
          onSave={handleSaveRecord}
        />
      )}
    </div>
  );
};

export default MedicalRecordManagement;
