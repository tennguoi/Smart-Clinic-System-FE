import { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Power, Eye, Upload, Image as ImageIcon, Search, AlertTriangle, Briefcase,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { toastConfig } from '../../config/toastConfig';
import AdminServiceApi from '../../api/AdminServiceApi';
import CountBadge from '../common/CountBadge';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ServiceManagement() {
  const { theme } = useTheme();
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
      case 'Consultation': return 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
      case 'Test': return 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      case 'Procedure': return 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <>
      <Toaster {...toastConfig} />
      <div className={`px-4 md:px-8 pt-4 pb-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-3 transition-colors duration-300`}>
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

        {/* Bộ lọc */}
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded-lg p-5 mb-6 shadow-md transition-colors duration-300`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors duration-300`}>
                {t('servicesManagement.searchLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('servicesManagement.searchPlaceholder')}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
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
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('servicesManagement.category')}
              </label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                <option value="">{t('servicesManagement.common.all')}</option>
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('servicesManagement.status')}
              </label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                <option value="">{t('servicesManagement.common.all')}</option>
                <option value="true">{t('servicesManagement.active')}</option>
                <option value="false">{t('servicesManagement.inactive')}</option>
              </select>
            </div>

            {/* Price Range – ĐÃ DỊCH */}
            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {t('servicesManagement.priceRange')}
              </label>
              <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                {priceRangeOptions.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Clear */}
            <div>
              <button onClick={handleClearFilters} className={`w-full px-4 py-3 rounded-xl transition font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
                {t('servicesManagement.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className={`mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
              {t('common.loading')}
            </p>
          </div>
        ) : (
          <>
            <div className={`${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow overflow-x-auto transition-colors duration-300`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                      {t('servicesManagement.common.no')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                      {t('servicesManagement.common.photo')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('servicesManagement.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      {t('servicesManagement.common.description')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('servicesManagement.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('servicesManagement.common.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('servicesManagement.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                      {t('servicesManagement.common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20 text-gray-500 dark:text-gray-400 text-lg">
                        {t('servicesManagement.noServices')}
                      </td>
                    </tr>
                  ) : (
                    services.map((service, index) => (
                      <tr key={service.serviceId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {currentPage * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          {service.photoUrl ? (
                            <img
                              src={`${getImageUrl(service.photoUrl)}?t=${Date.now()}`}
                              alt={service.name}
                              className="h-14 w-14 object-cover rounded-lg shadow-sm mx-auto"
                              onError={e => e.target.src = 'https://via.placeholder.com/64?text=No+Image'}
                            />
                          ) : (
                            <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-300 max-w-xs truncate">{service.description}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getCategoryStyle(service.category)}`}>
                            {getCategoryLabel(service.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{formatPrice(service.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {service.isActive ? t('servicesManagement.active') : t('servicesManagement.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleOpenModal('view', service)} title={t('common.view')} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteClick(service)} title={t('common.delete')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleToggleStatusClick(service)}
                                    title={service.isActive ? t('servicesManagement.deactivate') : t('servicesManagement.activate')}
                                    className={`p-2 rounded-full transition ${service.isActive ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30' : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30'}`}>
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

            {/* Pagination - ĐÃ SỬA ĐẸP 100% */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                {/* First & Prev */}
                <button
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
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
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          1
                        </button>
                      );
                      if (startPage > 1) pages.push(<span key="start-ellipsis" className="px-2 text-gray-500">...</span>);
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
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    }

                    // Trang cuối
                    if (endPage < totalPages - 1) {
                      if (endPage < totalPages - 2) pages.push(<span key="end-ellipsis" className="px-2 text-gray-500">...</span>);
                      pages.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => handlePageChange(totalPages - 1)}
                          className={`px-4 py-2.5 rounded-lg border font-medium transition ${
                            currentPage === totalPages - 1
                              ? 'bg-blue-600 text-white border-blue-600'
                              : `${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
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
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                  className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition`}
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Tạo / Sửa */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
              <div className={`flex justify-between items-center p-6 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50/80'} backdrop-blur`}>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`}>
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
                  <button onClick={handleCloseModal} className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-white/50'}`}>
                    <X className="w-7 h-7" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('servicesManagement.modal.image')}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)} alt="Preview" className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600" />
                      ) : (
                        <div className={`h-32 w-32 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600`}>
                          <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    {modalMode !== 'view' && (
                      <div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                        <label htmlFor="image-upload" className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg cursor-pointer transition border`}>
                          <Upload className="w-5 h-5" />
                          {imagePreview ? t('servicesManagement.modal.changeImage') : t('servicesManagement.modal.chooseImage')}
                        </label>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          PNG, JPG, GIF {t('servicesManagement.modal.maxSize')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('servicesManagement.name')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('servicesManagement.common.description')} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="3" 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    ></textarea>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('servicesManagement.category')} <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('servicesManagement.common.price')} (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                      min="0" 
                      step="1000" 
                      required 
                      disabled={modalMode === 'view'} 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} 
                    />
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={loading || uploadingImage} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70">
                      {uploadingImage ? t('common.processing') : loading ? t('common.processing') : modalMode === 'create' ? t('servicesManagement.createButton') : t('common.save')}
                    </button>
                    <button type="button" onClick={handleCloseModal} disabled={loading || uploadingImage} className={`flex-1 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'}`}>
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
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transition-colors duration-300`}>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('common.confirmDelete')}
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                {t('servicesManagement.confirm.deleteText', { name: serviceToDelete.name })}
              </p>
              <div className="flex gap-3">
                <button onClick={handleConfirmDelete} disabled={loading} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-70">
                  {loading ? t('common.processing') : t('servicesManagement.common.delete')}
                </button>
                <button onClick={() => { setShowDeleteConfirmation(false); setServiceToDelete(null); }} className={`flex-1 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'}`}>
                  {t('servicesManagement.common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Toggle Status Modal */}
        {showToggleConfirmation && toggleTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-sm w-full p-6 text-center transition-colors duration-300`}>
              <Power className={`w-12 h-12 mx-auto mb-4 ${toggleTarget.currentStatus ? 'text-red-500' : 'text-green-500'}`} />
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {toggleTarget.currentStatus ? t('servicesManagement.confirm.deactivateTitle') : t('servicesManagement.confirm.activateTitle')}
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
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
                <button
                  onClick={() => { setShowToggleConfirmation(false); setToggleTarget(null); }}
                  className={`flex-1 py-2.5 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold transition ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'}`}
                >
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