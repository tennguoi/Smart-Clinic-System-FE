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

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Tất cả dịch vụ Tai - Mũi - Họng</h2>

        {/* Filter */}
        <div className="flex justify-center mb-8 space-x-3">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Consultation', label: getCategoryLabel('Consultation') },
            { id: 'Test', label: getCategoryLabel('Test') },
            { id: 'Procedure', label: getCategoryLabel('Procedure') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200
              ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-600">Đang tải dịch vụ...</p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} index={index} />
              ))}
            </div>

            {services.length === 0 && (
              <p className="text-gray-500 mt-6">Không có dịch vụ nào trong danh mục này.</p>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.isFirst}
                  className={`px-4 py-2 border rounded-lg flex items-center space-x-1 ${
                    pagination.isFirst
                      ? 'text-gray-400 border-gray-200'
                      : 'text-blue-600 border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <ChevronLeft size={18} />
                  <span>Trước</span>
                </button>

                <span className="px-3 py-2 text-gray-700">
                  Trang {pagination.currentPage + 1} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.isLast}
                  className={`px-4 py-2 border rounded-lg flex items-center space-x-1 ${
                    pagination.isLast
                      ? 'text-gray-400 border-gray-200'
                      : 'text-blue-600 border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span>Tiếp</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
