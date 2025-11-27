// src/pages/FullServicesPage.jsx   (hoặc đường dẫn bạn đang dùng)
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { serviceApi } from '../api/serviceApi';
import ServiceCard from '../components/ServiceCard';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
export default function FullServicesPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const initialServices = location.state?.initialServices || [];
  const initialPagination = location.state?.initialPagination || {};

  const [services, setServices] = useState(initialServices);
  const [pagination, setPagination] = useState({
    totalPages: initialPagination.totalPages ?? 1,
    totalElements: initialPagination.totalElements ?? 0,
    currentPage: initialPagination.currentPage ?? 0,
    isFirst: initialPagination.isFirst ?? true,
    isLast: initialPagination.isLast ?? true,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Khi đổi category → reset về trang 0
  useEffect(() => {
    fetchServices(0);
  }, [selectedCategory]);

  const fetchServices = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (selectedCategory === 'all') {
        data = await serviceApi.getAllServices(page, 6);
      } else {
        data = await serviceApi.getServicesByCategory(selectedCategory, page, 6);
      }

      setServices(data.services || []);
      setPagination({
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? 0,
        currentPage: data.currentPage ?? page,
        isFirst: data.isFirst ?? true,
        isLast: data.isLast ?? true,
      });
    } catch (err) {
      console.error('Error loading services:', err);
      setError(t('fullServices.error'));
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchServices(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tính toán các trang hiển thị (giữ nguyên logic đẹp của bạn)
  const getPageNumbers = () => {
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 5) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current <= 2) {
        pages.push(0, 1, 2, 3, 4);
      } else if (current >= total - 3) {
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(current - 2, current - 1, current, current + 1, current + 2);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const categories = [
    { id: 'all', label: t('fullServices.categories.all') },
    { id: 'Consultation', label: t('fullServices.categories.consultation') },
    { id: 'Test', label: t('fullServices.categories.test') },
    { id: 'Procedure', label: t('fullServices.categories.procedure') },
  ];

  return (
    <section className="bg-gradient-to-b from-cyan-50 via-white to-cyan-50/30 min-h-screen pt-0 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 -mt-8">
        {/* Tiêu đề */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t('fullServices.title')}
          </h2>
          <p className="text-lg text-gray-600 mt-3 max-w-4xl mx-auto">
            {t('fullServices.subtitle')}
          </p>
        </div>

        {/* Tab danh mục */}
        <div className="flex justify-center flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 transform hover:scale-105
                ${selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white border-transparent shadow-lg shadow-cyan-500/30'
                  : 'bg-white hover:bg-cyan-50 border-gray-300 text-gray-700 hover:border-cyan-400 shadow-md hover:shadow-lg'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-lg font-medium">{error}</p>}

        {/* Loading */}
        {loading ? (
          <div className="py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">{t('fullServices.loading')}</p>
          </div>
        ) : (
          <>
            {/* Danh sách dịch vụ */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.length > 0 ? (
                services.map((service, index) => (
                  <ServiceCard key={service.serviceId || index} service={service} index={index} />
                ))
              ) : (
                <p className="col-span-full text-gray-500 py-12 text-lg">
                  {t('fullServices.noServices')}
                </p>
              )}
            </div>

           {pagination.totalPages > 1 && (
  <div className="flex justify-center items-center mt-16 gap-3 select-none">

    {/* First Page */}
    <button
      onClick={() => handlePageChange(0)}
      disabled={pagination.isFirst}
      className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center 
                 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      title={t('fullServices.pagination.first')}
    >
      <ChevronsLeft className="w-5 h-5" />
    </button>

    {/* Previous */}
    <button
      onClick={() => handlePageChange(pagination.currentPage - 1)}
      disabled={pagination.isFirst}
      className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center 
                 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>

    {/* Numbered Buttons */}
    {pageNumbers.map((p) => (
      <button
        key={p}
        onClick={() => handlePageChange(p)}
        className={`w-11 h-11 rounded-lg font-medium transition-all ${
          p === pagination.currentPage
            ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
      >
        {p + 1}
      </button>
    ))}

    {/* Next */}
    <button
      onClick={() => handlePageChange(pagination.currentPage + 1)}
      disabled={pagination.isLast}
      className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center 
                 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
    >
      <ChevronRight className="w-5 h-5" />
    </button>

    {/* Last Page */}
    <button
      onClick={() => handlePageChange(pagination.totalPages - 1)}
      disabled={pagination.isLast}
      className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center 
                 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      title={t('fullServices.pagination.last')}
    >
      <ChevronsRight className="w-5 h-5" />
    </button>

  </div>
)}

          </>
        )}
      </div>
    </section>
  );
}