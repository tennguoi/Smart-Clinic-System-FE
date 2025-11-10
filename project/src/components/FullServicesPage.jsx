import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import ServiceCard from './ServiceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FullServicesPage() {
  const loc = useLocation();
  const initialServices = loc.state?.initialServices;
  const initialPagination = loc.state?.initialPagination;
  const initialSelectedCategory = loc.state?.initialSelectedCategory ?? 'all';

  const [services, setServices] = useState(initialServices || []);
  const [loading, setLoading] = useState(!initialServices); // if we have initial data, don't show fullscreen loader
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);
  const [pagination, setPagination] = useState(
    initialPagination || {
      totalPages: 0,
      totalElements: 0,
      currentPage: 0,
      isFirst: true,
      isLast: false,
    }
  );

  useEffect(() => {
    // when selectedCategory changes, load page 0
    fetchServices(0, { showGlobalLoading: !initialServices }); // if initialServices provided, do background refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchServices = async (page = 0, { showGlobalLoading = true } = {}) => {
    try {
      if (showGlobalLoading && services.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const data = await serviceApi.getAllServices(page, 6);

      // Lọc theo danh mục
      let filtered = data.services || [];
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((s) => s.category === selectedCategory);
      }

      setServices(filtered);
      setPagination({
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? (data.services?.length ?? filtered.length),
        currentPage: data.currentPage ?? page,
        isFirst: data.isFirst ?? page === 0,
        isLast: data.isLast ?? false,
      });
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchServices(newPage, { showGlobalLoading: false });
    document
      .getElementById('full-services')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // fetchServices sẽ được gọi bởi useEffect khi selectedCategory thay đổi
  };

  const categories = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'Consultation', label: 'Khám Bệnh' },
    { value: 'Test', label: 'Thăm Dò' },
    { value: 'Procedure', label: 'Thủ Thuật' },
  ];

  if (loading && services.length === 0) {
    // 🌀 Hiển thị spinner lớn khi load lần đầu (chỉ khi không có initial data)
    return (
      <section id="full-services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dịch vụ...</p>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section id="full-services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchServices(0, { showGlobalLoading: true })}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="full-services" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tất Cả Dịch Vụ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Danh sách đầy đủ các dịch vụ chuyên khoa Tai-Mũi-Họng
          </p>
        </div>

        {/* Bộ lọc danh mục */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vùng danh sách + overlay loading */}
        <div className="relative">
          {/* overlay hiển thị khi loading trang tiếp theo */}
          {refreshing && services.length > 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Không có dịch vụ nào trong danh mục này.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 transition-opacity duration-300">
              {services.map((service, idx) => (
                <ServiceCard
                  key={service.serviceId ?? service.id ?? idx}
                  service={service}
                  index={pagination.currentPage * 6 + idx + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.isFirst}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.isFirst
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Trước
            </button>

            <div className="flex flex-col items-center text-gray-600">
              <span>
                Trang {pagination.currentPage + 1} / {pagination.totalPages}
              </span>
              <span className="text-sm text-gray-400">
                ({pagination.totalElements} dịch vụ)
              </span>
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.isLast}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                pagination.isLast
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
              }`}
            >
              Sau
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
