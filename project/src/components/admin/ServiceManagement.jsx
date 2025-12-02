// src/pages/admin/ServiceManagement.jsx
import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Power, Eye, Upload, Image as ImageIcon, Search, AlertTriangle, Briefcase
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import AdminServiceApi from '../../api/AdminServiceApi';
import CountBadge from '../common/CountBadge';
import Pagination from '../common/Pagination';
import { useTranslation } from 'react-i18next';

export default function ServiceManagement() {
  const { t } = useTranslation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit | view
  const [selectedService, setSelectedService] = useState(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

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

  // Danh mục + dịch tự động
  const categoryOptions = [
    { value: 'Consultation', label: t('servicesManagement.categories.consultation') },
    { value: 'Test', label: t('servicesManagement.categories.test') },
    { value: 'Procedure', label: t('servicesManagement.categories.procedure') },
  ];

  // KHOẢNG GIÁ ĐÃ DỊCH HOÀN TOÀN (không còn hardcode tiếng Việt)
  const priceRangeOptions = [
    { value: '', label: t('servicesManagement.common.all') },
    { value: '0-500000', label: t('servicesManagement.priceRanges.under500k') },
    { value: '500000-1000000', label: t('servicesManagement.priceRanges.500k_1m') },
    { value: '1000000-1500000', label: t('servicesManagement.priceRanges.1m_1_5m') },
    { value: '1500000-999999999', label: t('servicesManagement.priceRanges.over1_5m') },
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
      toast.error(t('servicesManagement.error.load'));
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

  // ==================== DELETE ====================
  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setLoading(true);
    try {
      await AdminServiceApi.deleteService(serviceToDelete.serviceId);
      toast.success(t('servicesManagement.toast.deleteSuccess', { name: serviceToDelete.name }));
      setShowDeleteConfirmation(false);
      setServiceToDelete(null);
      if (services.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchServices(currentPage);
      }
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // ==================== TOGGLE STATUS ====================
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
      toast.success(
        toggleTarget.currentStatus
          ? t('servicesManagement.toast.deactivated')
          : t('servicesManagement.toast.activated')
      );
      setShowToggleConfirmation(false);
      setToggleTarget(null);
      fetchServices(currentPage);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // ==================== MODAL ====================
  const handleOpenModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    setSelectedImage(null);
    setImagePreview('');
    if (mode === 'create') {
      setFormData({
        name: '', description: '', category: 'Consultation', price: '', isActive: true, photoUrl: ''
      });
    } else if (service) {
      setFormData({ ...service, price: service.price || '' });
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

  const handleSwitchToEdit = () => setModalMode('edit');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error(t('servicesManagement.error.invalidImage'));
    if (file.size > 10 * 1024 * 1024) return toast.error(t('servicesManagement.error.imageTooLarge'));
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      toast.error(t('common.fillAllFields'));
      return;
    }
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
        toast.success(t('servicesManagement.toast.updateSuccess'));
      } else {
        await AdminServiceApi.createService(payload);
        toast.success(t('servicesManagement.toast.createSuccess'));
      }
      handleCloseModal();
      fetchServices(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
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
              <span>{t('adminSidebar.services')}</span>
            </h1>
            <CountBadge currentCount={services.length} totalCount={totalElements} label={t('servicesManagement.label')} />
          </div>
          <button
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition hover:scale-105 font-medium"
          >
            <Plus className="w-5 h-5" /> {t('servicesManagement.createButton')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('servicesManagement.searchLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('servicesManagement.searchPlaceholder')}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('servicesManagement.category')}</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">{t('servicesManagement.common.all')}</option>
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('servicesManagement.status')}</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">{t('servicesManagement.common.all')}</option>
                <option value="true">{t('servicesManagement.active')}</option>
                <option value="false">{t('servicesManagement.inactive')}</option>
              </select>
            </div>

            {/* Price Range – ĐÃ DỊCH */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('servicesManagement.priceRange')}</label>
              <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {priceRangeOptions.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Clear */}
            <div>
              <button onClick={handleClearFilters} className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-medium">
                {t('servicesManagement.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{t('servicesManagement.common.photo')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('servicesManagement.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('servicesManagement.common.description')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('servicesManagement.category')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('servicesManagement.common.price')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('servicesManagement.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{t('servicesManagement.common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20 text-gray-500 text-lg">
                        {t('servicesManagement.noServices')}
                      </td>
                    </tr>
                  ) : (
                    services.map((service, index) => (
                      <tr key={service.serviceId} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm">{currentPage * pageSize + index + 1}</td>
                        <td className="px-6 py-4">
                          {service.photoUrl ? (
                            <img src={`${getImageUrl(service.photoUrl)}?t=${Date.now()}`} alt={service.name}
                                 className="h-14 w-14 object-cover rounded-lg shadow-sm"
                                 onError={e => e.target.src = 'https://via.placeholder.com/64?text=No+Image'} />
                          ) : (
                            <div className="h-14 w-14 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{service.name}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600 max-w-xs truncate">{service.description}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(service.category)}`}>
                            {getCategoryLabel(service.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{formatPrice(service.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {service.isActive ? t('servicesManagement.active') : t('servicesManagement.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleOpenModal('view', service)} title={t('common.view')} className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(service)} title={t('servicesManagement.common.delete')} className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleToggleStatusClick(service)}
                                    title={service.isActive ? t('servicesManagement.deactivate') : t('servicesManagement.activate')}
                                    className={`p-2 rounded-full ${service.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}>
                              <Power className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination tái sử dụng */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Modal Create/Edit/View */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-blue-50/80 backdrop-blur">
                <h2 className="text-2xl font-bold text-blue-700">
                  {modalMode === 'create' ? t('servicesManagement.modal.createTitle') :
                   modalMode === 'view' ? t('servicesManagement.modal.viewTitle') :
                   t('servicesManagement.modal.editTitle')}
                </h2>
                <div className="flex items-center gap-3">
                  {modalMode === 'view' && (
                    <button onClick={handleSwitchToEdit} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                      <Edit className="w-5 h-5" /> {t('servicesManagement.common.edit')}
                    </button>
                  )}
                  <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white/50">
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('servicesManagement.modal.image')}</label>
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
                          {imagePreview ? t('servicesManagement.modal.changeImage') : t('servicesManagement.modal.chooseImage')}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF {t('servicesManagement.modal.maxSize')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('servicesManagement.name')} <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('servicesManagement.common.description')} <span className="text-red-500">*</span></label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('servicesManagement.category')} <span className="text-red-500">*</span></label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('servicesManagement.common.price')} (VNĐ) <span className="text-red-500">*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="1000" required disabled={modalMode === 'view'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                      {uploadingImage ? t('common.processing') : loading ? t('common.processing') : modalMode === 'create' ? t('servicesManagement.createButton') : t('common.save')}
                    </button>
                    <button type="button" onClick={handleCloseModal} disabled={loading || uploadingImage} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 transition">
                      {t('servicesManagement.common.cancel')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showDeleteConfirmation && serviceToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('common.confirmDelete')}</h3>
              <p className="text-gray-600 mb-6">
                {t('servicesManagement.confirm.deleteText', { name: serviceToDelete.name })}
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70">
                  {loading ? t('common.processing') : t('servicesManagement.common.delete')}
                </button>
                <button onClick={() => { setShowDeleteConfirmation(false); setServiceToDelete(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition">
                  {t('servicesManagement.common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Toggle Status Modal */}
        {showToggleConfirmation && toggleTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
              <Power className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
              <h3 className="text-xl font-bold mb-2">
                {toggleTarget.currentStatus ? t('servicesManagement.confirm.deactivateTitle') : t('servicesManagement.confirm.activateTitle')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('servicesManagement.confirm.toggleText', { name: toggleTarget.name })}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmToggle}
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition disabled:opacity-70 ${toggleTarget.currentStatus ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  {loading ? t('common.processing') : t('servicesManagement.common.confirm')}
                </button>
                <button onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-semibold transition">
                  {t('servicesManagement.common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}