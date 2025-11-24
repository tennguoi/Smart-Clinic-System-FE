import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Power, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Upload, Image as ImageIcon, Search, AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminServiceApi from '../../api/AdminServiceApi';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedService, setSelectedService] = useState(null);

  // Xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

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

  // ==================== XÓA DỊCH VỤ VỚI XÁC NHẬN ====================
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

  // ==================== BẬT/TẮT TRẠNG THÁI ====================
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await AdminServiceApi.toggleServiceStatus(id);
      toast.success(currentStatus ? 'Đã tắt dịch vụ' : 'Đã bật dịch vụ');
      fetchServices(currentPage);
    } catch (err) {
      toast.error('Không thể thay đổi trạng thái');
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
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="p-4 md:p-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý Dịch vụ</h1>
          <button onClick={() => handleOpenModal('create')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow">
            <Plus className="w-5 h-5" /> Tạo dịch vụ mới
          </button>
        </div>

        {/* Khung tìm kiếm + lọc - MÀU TRẮNG */}
        <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm theo tên</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên dịch vụ..."
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả</option>
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả</option>
                <option value="true">Hoạt động</option>
                <option value="false">Ngưng hoạt động</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
              <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {priceRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2.5 rounded-lg transition shadow border border-gray-400"
              >
                <X className="w-5 h-5" /> Xóa lọc
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {service.isActive ? 'Hoạt động' : 'Ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleOpenModal('edit', service)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Chỉnh sửa">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteClick(service)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Xóa">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(service.serviceId, service.isActive)}
                          className={`${service.isActive ? 'text-green-600 hover:text-green-900 hover:bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'} p-1 rounded-full transition`}
                          title={service.isActive ? 'Tắt dịch vụ' : 'Bật dịch vụ'}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button onClick={() => handlePageChange(0)} disabled={currentPage === 0} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i).map(page => {
                if (page === 0 || page === totalPages - 1 || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg border ${currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}`}
                    >
                      {page + 1}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50">
              <ChevronsRight className="w-5 h-5" />
            </button>

            <span className="ml-4 text-sm text-gray-600 hidden sm:block">
              Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong> (Tổng <strong>{totalElements}</strong> dịch vụ)
            </span>
          </div>
        )}

        {/* Modal Tạo / Sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Tạo dịch vụ mới' : 'Chỉnh sửa dịch vụ'}
                </h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Ảnh */}
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
                    <div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition border">
                        <Upload className="w-5 h-5" />
                        {imagePreview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="1000" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                    {uploadingImage ? 'Đang tải ảnh...' : loading ? 'Đang xử lý...' : modalMode === 'create' ? 'Tạo dịch vụ' : 'Cập nhật'}
                  </button>
                  <button type="button" onClick={handleCloseModal} disabled={loading || uploadingImage} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 transition">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal XÁC NHẬN XÓA */}
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
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirmation(false); setServiceToDelete(null); }}
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