import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Power, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Upload, Image as ImageIcon, Search, AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminServiceApi from '../../api/AdminServiceApi';
import { useTranslation } from 'react-i18next';

export default function ServiceManagement() {
  const { t, i18n } = useTranslation();
  const isVN = i18n.language === 'vi';

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
  const [toggleTarget, setToggleTarget] = useState(null);

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

  // Danh mục đa ngôn ngữ
  const categoryOptions = [
    { value: 'Consultation', label: isVN ? 'Khám Bệnh' : 'Consultation' },
    { value: 'Test', label: isVN ? 'Thăm Dò' : 'Diagnostic Tests' },
    { value: 'Procedure', label: isVN ? 'Thủ Thuật' : 'Procedures' },
  ];

  const priceRanges = [
    { label: isVN ? 'Tất cả' : 'All', value: '' },
    { label: isVN ? 'Dưới 500.000 VNĐ' : 'Under 500,000 VND', value: '0-500000' },
    { label: isVN ? '500.000 - 1.000.000 VNĐ' : '500,000 - 1,000,000 VND', value: '500000-1000000' },
    { label: isVN ? '1.000.000 - 1.500.000 VNĐ' : '1,000,000 - 1,500,000 VND', value: '1000000-1500000' },
    { label: isVN ? 'Trên 1.500.000 VNĐ' : 'Over 1,500,000 VND', value: '1500000-999999999' },
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
      toast.error(isVN ? 'Không thể tải danh sách dịch vụ' : 'Failed to load services');
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
      toast.success(isVN ? `Đã xóa dịch vụ "${serviceToDelete.name}"` : `Service "${serviceToDelete.name}" deleted`);
      setShowDeleteConfirmation(false);
      setServiceToDelete(null);
      if (services.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchServices(currentPage);
      }
    } catch (err) {
      toast.error(isVN ? 'Không thể xóa dịch vụ' : 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  // ==================== BẬT/TẮT TRẠNG THÁI ====================
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
      toast.success(toggleTarget.currentStatus
        ? (isVN ? 'Đã ngưng hoạt động dịch vụ' : 'Service deactivated')
        : (isVN ? 'Đã kích hoạt dịch vụ' : 'Service activated')
      );
      setShowToggleConfirmation(false);
      setToggleTarget(null);
      fetchServices(currentPage);
    } catch (err) {
      toast.error(isVN ? 'Không thể thay đổi trạng thái' : 'Failed to change status');
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error(isVN ? 'Vui lòng chọn file ảnh' : 'Please select an image file');
    if (file.size > 10 * 1024 * 1024) return toast.error(isVN ? 'Ảnh không được quá 10MB' : 'Image must not exceed 10MB');
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
        toast.success(isVN ? 'Cập nhật dịch vụ thành công!' : 'Service updated successfully!');
      } else {
        await AdminServiceApi.createService(payload);
        toast.success(isVN ? 'Tạo dịch vụ mới thành công!' : 'New service created successfully!');
      }
      handleCloseModal();
      fetchServices(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || (isVN ? 'Có lỗi xảy ra' : 'An error occurred'));
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const getCategoryLabel = (cat) => categoryOptions.find(c => c.value === cat)?.label || cat;
  const formatPrice = (price) => new Intl.NumberFormat(isVN ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);

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
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="p-4 md:p-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {isVN ? 'Quản lý Dịch vụ' : 'Service Management'}
          </h1>
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow">
            <Plus className="w-5 h-5" /> {isVN ? 'Tạo dịch vụ mới' : 'Create New Service'}
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isVN ? 'Tìm theo tên' : 'Search by name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isVN ? 'Nhập tên dịch vụ...' : 'Enter service name... …'}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isVN ? 'Danh mục' : 'Category'}
              </label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">{isVN ? 'Tất cả' : 'All'}</option>
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isVN ? 'Trạng thái' : 'Status'}
              </label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">{isVN ? 'Tất cả' : 'All'}</option>
                <option value="true">{isVN ? 'Hoạt động' : 'Active'}</option>
                <option value="false">{isVN ? 'Ngưng hoạt động' : 'Inactive'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isVN ? 'Khoảng giá' : 'Price Range'}
              </label>
              <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {priceRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <button onClick={handleClearFilters} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2.5 rounded-lg transition shadow border border-gray-400">
                <X className="w-5 h-5" /> {isVN ? 'Xóa lọc' : 'Clear Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Bảng dịch vụ */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">{isVN ? 'Đang tải dữ liệu...' : 'Loading data...'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    {isVN ? 'Ảnh' : 'Image'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isVN ? 'Tên' : 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {isVN ? 'Mô tả' : 'Description'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isVN ? 'Danh mục' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isVN ? 'Giá' : 'Price'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isVN ? 'Trạng thái' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    {isVN ? 'Thao tác' : 'Actions'}
                  </th>
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
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(service.category)}`}>
                        {getCategoryLabel(service.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(service.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {service.isActive ? (isVN ? 'Hoạt động' : 'Active') : (isVN ? 'Ngưng hoạt động' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleOpenModal('edit', service)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title={isVN ? 'Chỉnh sửa' : 'Edit'}>
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(service)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title={isVN ? 'Xóa' : 'Delete'}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatusClick(service)}
                          className={`p-2 rounded-full transition-all ${service.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                          title={service.isActive ? (isVN ? 'Ngưng hoạt động' : 'Deactivate') : (isVN ? 'Kích hoạt' : 'Activate')}
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
                {isVN ? 'Không tìm thấy dịch vụ nào phù hợp.' : 'No services found.'}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button onClick={() => handlePageChange(0)} disabled={currentPage === 0} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const startPage = Math.max(0, currentPage - 2);
                const endPage = Math.min(totalPages - 1, currentPage + 2);

                if (startPage > 0) {
                  pages.push(
                    <button key={0} onClick={() => handlePageChange(0)} className={`px-4 py-2.5 rounded-lg border font-medium transition ${currentPage === 0 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>1</button>
                  );
                  if (startPage > 1) pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button key={i} onClick={() => handlePageChange(i)} className={`px-4 py-2.5 rounded-lg border font-medium transition ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>
                      {i + 1}
                    </button>
                  );
                }

                if (endPage < totalPages - 1) {
                  if (endPage < totalPages - 2) pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                  pages.push(
                    <button key={totalPages - 1} onClick={() => handlePageChange(totalPages - 1)} className={`px-4 py-2.5 rounded-lg border font-medium transition ${currentPage === totalPages - 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}>
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
              <ChevronsRight className="w-5 h-5" />
            </button>

            <span className="ml-4 text-sm text-gray-600 hidden sm:block">
              {isVN ? `Trang ${currentPage + 1} / ${totalPages} (Tổng ${totalElements} dịch vụ)` : `Page ${currentPage + 1} of ${totalPages} (Total ${totalElements} services)`}
            </span>
          </div>
        )}

        {/* Modal Tạo / Sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalMode === 'create' ? (isVN ? 'Tạo dịch vụ mới' : 'Create New Service') : (isVN ? 'Chỉnh sửa dịch vụ' : 'Edit Service')}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Ảnh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isVN ? 'Ảnh dịch vụ' : 'Service Image'}
                  </label>
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
                    <div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition border">
                        <Upload className="w-5 h-5" />
                        {imagePreview ? (isVN ? 'Thay đổi ảnh' : 'Change Image') : (isVN ? 'Chọn ảnh' : 'Choose Image')}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF {isVN ? 'tối đa 10MB' : 'max 10MB'}</p>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isVN ? 'Tên dịch vụ' : 'Service Name'} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isVN ? 'Mô tả' : 'Description'} <span className="text-red-500">*</span>
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isVN ? 'Danh mục' : 'Category'} <span className="text-red-500">*</span>
                    </label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isVN ? 'Giá (VNĐ)' : 'Price (VND)'} <span className="text-red-500">*</span>
                    </label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="1000" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                    {uploadingImage ? (isVN ? 'Đang tải ảnh...' : 'Uploading...') : loading ? (isVN ? 'Đang xử lý...' : 'Processing...') : modalMode === 'create' ? (isVN ? 'Tạo dịch vụ' : 'Create Service') : (isVN ? 'Cập nhật' : 'Update')}
                  </button>
                  <button type="button" onClick={handleCloseModal} disabled={loading || uploadingImage} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 transition">
                    {isVN ? 'Hủy' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác nhận XÓA */}
        {showDeleteConfirmation && serviceToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{isVN ? 'Xác nhận xóa' : 'Confirm Delete'}</h3>
              <p className="text-gray-600 mb-6">
                {isVN ? `Xóa dịch vụ ` : 'Delete service '}<strong>{serviceToDelete.name}</strong>?<br />
                <span className="text-red-600 font-semibold">{isVN ? 'Thao tác này không thể hoàn tác' : 'This action cannot be undone'}</span>.
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70">
                  {loading ? (isVN ? 'Đang xóa...' : 'Deleting...') : (isVN ? 'Xóa' : 'Delete')}
                </button>
                <button onClick={() => { setShowDeleteConfirmation(false); setServiceToDelete(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition">
                  {isVN ? 'Hủy' : 'Cancel'}
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
                {toggleTarget.currentStatus ? (isVN ? 'Ngưng hoạt động dịch vụ?' : 'Deactivate service?') : (isVN ? 'Kích hoạt dịch vụ?' : 'Activate service?')}
              </h3>
              <p className="text-gray-600 mb-6">
                {isVN ? 'Dịch vụ' : 'Service'}: <strong>{toggleTarget.name}</strong><br />
                {toggleTarget.currentStatus
                  ? (isVN ? 'Dịch vụ sẽ không hiển thị và không thể đặt lịch.' : 'Service will be hidden and unavailable for booking.')
                  : (isVN ? 'Dịch vụ sẽ được hiển thị và có thể đặt lịch trở lại.' : 'Service will be visible and bookable again.')
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmToggle}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition disabled:opacity-70 ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {loading ? (isVN ? 'Đang xử lý...' : 'Processing...') : (isVN ? 'Xác nhận' : 'Confirm')}
                </button>
                <button
                  onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition"
                >
                  {isVN ? 'Hủy' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}