import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { serviceApi, getCategoryLabel } from '../api/serviceApi';
import ServiceCard from './ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FullServicesPage() {
  const loc = useLocation();
  const initialServices = loc.state?.initialServices || [];
  const initialPagination = loc.state?.initialPagination || {};

  const [services, setServices] = useState(initialServices);
  const [pagination, setPagination] = useState(initialPagination);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Gọi API khi thay đổi category hoặc page
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
        isFirst: data.isFirst ?? false,
        isLast: data.isLast ?? false,
      });
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchServices(newPage);
    }
  };

  // Tính toán page numbers để hiển thị
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

  return (
    <section className="bg-gradient-to-b from-cyan-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 min-h-screen pt-0 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 -mt-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Danh mục dịch vụ Tai - Mũi - Họng</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-3">
            Lựa chọn phù hợp cho từng nhu cầu khám – từ tư vấn, chẩn đoán đến thủ thuật chuyên sâu.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-3">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Consultation', label: getCategoryLabel('Consultation') },
            { id: 'Test', label: getCategoryLabel('Test') },
            { id: 'Procedure', label: getCategoryLabel('Procedure') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 transform hover:scale-105
              ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white border-transparent shadow-lg shadow-cyan-500/30'
                  : 'bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-cyan-400 dark:hover:border-cyan-500 shadow-md hover:shadow-lg'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Đang tải dịch vụ...</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} index={index} />
              ))}
            </div>

            {services.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 mt-6">Không có dịch vụ nào trong danh mục này.</p>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-3 select-none">
                <button 
                  onClick={() => handlePageChange(0)} 
                  disabled={pagination.isFirst}
                  className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {'<<'}
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)} 
                  disabled={pagination.isFirst}
                  className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {'<'}
                </button>
                {pageNumbers.map((p) => (
                  <button 
                    key={p} 
                    onClick={() => handlePageChange(p)}
                    className={`w-11 h-11 rounded-lg font-medium transition-all ${
                      p === pagination.currentPage
                        ? 'bg-gray-800 dark:bg-cyan-600 text-white border-gray-800 dark:border-cyan-600 shadow-md'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)} 
                  disabled={pagination.isLast}
                  className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {'>'}
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.totalPages - 1)} 
                  disabled={pagination.isLast}
                  className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {'>>'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
