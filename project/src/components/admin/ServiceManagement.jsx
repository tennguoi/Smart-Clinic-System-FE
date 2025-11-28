import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Power, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Upload, Image as ImageIcon, Search, AlertTriangle, ToggleLeft, ToggleRight, Briefcase, Eye
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import AdminServiceApi from '../../api/AdminServiceApi';
import CountBadge from '../common/CountBadge';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedService, setSelectedService] = useState(null);

  // Xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Xác nhận bật/tắt trạng thái
  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null); // { serviceId, name, currentStatus }

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');

  // Image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Consultation',
    price: '',
    isActive: true,
    photoUrl: ''
  });

  const categoryOptions = [
    { value: 'Consultation', label: 'Khám Bệnh' },
    { value: 'Test', label: 'Thăm Dò' },
    { value: 'Procedure', label: 'Thủ Thuật' },
  ];

  const priceRanges = [
    { label: 'Tất cả', value: '' },
    { label: 'Dưới 500.000 VNĐ', value: '0-500000' },
    { label: '500.000 - 1.000.000 VNĐ', value: '500000-1000000' },
    { label: '1.000.000 - 1.500.000 VNĐ', value: '1000000-1500000' },
    { label: 'Trên 1.500.000 VNĐ', value: '1500000-999999999' },
  ];

  // ==================== FETCH SERVICES ====================
  const fetchServices = async (page = 0) => {
    setLoading(true);
    let minPrice = null;
    let maxPrice = null;
    if (filterPriceRange) {
      const [min, max] = filterPriceRange.split('-');
      minPrice = min ? parseFloat(min) : null;
      maxPrice = max ? parseFloat(max) : null;
    }
    const filters = {
      name: searchTerm.trim() || null,
      category: filterCategory || null,
      isActive: filterStatus === '' ? null : filterStatus === 'true',
      minPrice,
      maxPrice,
    };
    try {
      const data = await AdminServiceApi.getAllServices(page, pageSize, filters);
      setServices(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (err) {
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterCategory, filterStatus, filterPriceRange]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setCurrentPage(newPage);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setFilterPriceRange('');
    setCurrentPage(0);
  };

  // ==================== XÓA DỊCH VỤ ====================
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setLoading(true);
    try {
      await AdminServiceApi.deleteService(serviceToDelete.serviceId);
      toast.success(`Đã xóa dịch vụ "${serviceToDelete.name}"`);
      setShowDeleteConfirmation(false);
      setServiceToDelete(null);
      if (services.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchServices(currentPage);
      }
    } catch (err) {
      toast.error('Không thể xóa dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  // ==================== BẬT/TẮT TRẠNG THÁI VỚI XÁC NHẬN ====================
  const handleToggleStatusClick = (service) => {
    setToggleTarget({
      serviceId: service.serviceId,
      name: service.name,
      currentStatus: service.isActive
    });
    setShowToggleConfirmation(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    setLoading(true);
    try {
      await AdminServiceApi.toggleServiceStatus(toggleTarget.serviceId);
      toast.success(toggleTarget.currentStatus ? 'Đã ngưng hoạt động dịch vụ' : 'Đã kích hoạt dịch vụ');
      setShowToggleConfirmation(false);
      setToggleTarget(null);
      fetchServices(currentPage);
    } catch (err) {
      toast.error('Không thể thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  // ==================== MODAL TẠO/SỬA ====================
  const handleOpenModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    setSelectedImage(null);
    setImagePreview('');
    if (mode === 'create') {
      setFormData({ name: '', description: '', category: 'Consultation', price: '', isActive: true, photoUrl: '' });
    } else if (service) {
      setFormData({ ...service, price: service.price });
      setImagePreview(service.photoUrl || '');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSwitchToEdit = () => {
    setModalMode('edit');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Vui lòng chọn file ảnh');
    if (file.size > 10 * 1024 * 1024) return toast.error('Ảnh không được quá 10MB');
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photoUrl = formData.photoUrl;
      if (selectedImage) {
        setUploadingImage(true);
        const res = await AdminServiceApi.uploadPhoto(selectedImage);
        photoUrl = res.photoUrl;
      }
      const payload = { ...formData, price: parseFloat(formData.price), photoUrl };
      if (modalMode === 'edit') {
        await AdminServiceApi.updateService(selectedService.serviceId, payload);
        toast.success('Cập nhật dịch vụ thành công!');
      } else {
        await AdminServiceApi.createService(payload);
        toast.success('Tạo dịch vụ mới thành công!');
      }
      handleCloseModal();
      fetchServices(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const getCategoryLabel = (cat) => categoryOptions.find(c => c.value === cat)?.label || cat;
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const getImageUrl = (url) => url?.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}${url}`;

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Consultation': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Test': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Procedure': return 'bg-amber-100 text-amber-800 border border-amber-200';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <div className="px-4 md:px-8 pt-4 pb-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Briefcase className="w-9 h-9 text-blue-600" />
              <span>Quản Lý Dịch Vụ</span>
            </h1>
            <CountBadge 
              currentCount={services.length} 
              totalCount={totalElements} 
              label="dịch vụ" 
            />
          </div>
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium">
            <Plus className="w-5 h-5" /> Tạo dịch vụ
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm theo tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên dịch vụ..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả</option>
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả</option>
                <option value="true">Hoạt động</option>
                <option value="false">Ngưng hoạt động</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
              <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {priceRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <button onClick={handleClearFilters} className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium">
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Bảng dịch vụ */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Ảnh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service, index) => (
                  <tr key={service.serviceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {currentPage * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.photoUrl ? (
                        <img
                          src={`${getImageUrl(service.photoUrl)}?t=${service.serviceId}`}
                          alt={service.name}
                          className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                        />
                      ) : (
                        <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-gray-900 max-w-xs truncate">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(service.category)}`}>
                        {getCategoryLabel(service.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatPrice(service.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {service.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleOpenModal('view', service)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Xem chi tiết">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(service)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Xóa">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatusClick(service)}
                          className={`p-2 rounded-full transition-all ${service.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                          title={service.isActive ? 'Ngưng hoạt động' : 'Kích hoạt'}
                        >
                          <Power className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy dịch vụ nào phù hợp.
              </div>
            )}
          </div>
        )}

{/* Pagination - ĐÃ SỬA ĐẸP 100% */}
{totalPages > 1 && (
  <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
    {/* First & Prev */}
    <button
      onClick={() => handlePageChange(0)}
      disabled={currentPage === 0}
      className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <ChevronsLeft className="w-5 h-5" />
    </button>
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 0}
      className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>

    {/* Page Numbers */}
    <div className="flex items-center gap-1">
      {(() => {
        const pages = [];
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        // Luôn hiển thị trang 1
        if (startPage > 0) {
          pages.push(
            <button
              key={0}
              onClick={() => handlePageChange(0)}
              className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                currentPage === 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              1
            </button>
          );
          if (startPage > 1) pages.push(<span key="start-ellipsis" className="px-2">...</span>);
        }

        // Các trang ở giữa
        for (let i = startPage; i <= endPage; i++) {
          pages.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                currentPage === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          );
        }

        // Trang cuối
        if (endPage < totalPages - 1) {
          if (endPage < totalPages - 2) pages.push(<span key="end-ellipsis" className="px-2">...</span>);
          pages.push(
            <button
              key={totalPages - 1}
              onClick={() => handlePageChange(totalPages - 1)}
              className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                currentPage === totalPages - 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {totalPages}
            </button>
          );
        }

        return pages;
      })()}
    </div>

    {/* Next & Last */}
    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages - 1}
      className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <ChevronRight className="w-5 h-5" />
    </button>
    <button
      onClick={() => handlePageChange(totalPages - 1)}
      disabled={currentPage === totalPages - 1}
      className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      <ChevronsRight className="w-5 h-5" />
    </button>
  </div>
)}
        {/* Modal Tạo / Sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 backdrop-blur">
                <h2 className="text-2xl font-bold text-blue-700">
                  {modalMode === 'create' ? 'Tạo dịch vụ mới' : modalMode === 'view' ? 'Chi tiết dịch vụ' : 'Chỉnh sửa dịch vụ'}
                </h2>
                <div className="flex items-center gap-3">
                  {modalMode === 'view' && (
                    <button
                      onClick={handleSwitchToEdit}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit className="w-5 h-5" /> Chỉnh sửa
                    </button>
                  )}
                  <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white/50">
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh dịch vụ</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)} alt="Preview" className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300" />
                      ) : (
                        <div className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {modalMode !== 'view' && (
                      <div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                        <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition border">
                          <Upload className="w-5 h-5" />
                          {imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed">
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="1000" required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed" />
                  </div>
                </div>
                {modalMode !== 'view' && (
                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                      {uploadingImage ? 'Đang tải ảnh...' : loading ? 'Đang xử lý...' : modalMode === 'create' ? 'Tạo dịch vụ' : 'Cập nhật'}
                    </button>
                    <button type="button" onClick={handleCloseModal} disabled={loading || uploadingImage} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 transition">
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận XÓA */}
        {showDeleteConfirmation && serviceToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Xóa dịch vụ <strong>{serviceToDelete.name}</strong>?<br />
                Thao tác này <span className="text-red-600 font-semibold">không thể hoàn tác</span>.
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70">
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button onClick={() => { setShowDeleteConfirmation(false); setServiceToDelete(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Xác nhận BẬT/TẮT trạng thái */}
        {showToggleConfirmation && toggleTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <Power className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
              <h3 className="text-xl font-bold mb-2">
                {toggleTarget.currentStatus ? 'Ngưng hoạt động dịch vụ?' : 'Kích hoạt dịch vụ?'}
              </h3>
              <p className="text-gray-600 mb-6">
                Dịch vụ: <strong>{toggleTarget.name}</strong><br />
                {toggleTarget.currentStatus
                  ? 'Dịch vụ sẽ không hiển thị và không thể đặt lịch.'
                  : 'Dịch vụ sẽ được hiển thị và có thể đặt lịch trở lại.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmToggle}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition disabled:opacity-70 ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}