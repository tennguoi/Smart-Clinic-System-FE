// src/components/ServicesSection.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, getCategoryLabel } from '../api/serviceApi';
import ServiceCard from './ServiceCard';
import { RefreshCw } from 'lucide-react';

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cache keys
  const CACHE_KEY = 'home_services_cache_v2';
  const CACHE_TIMESTAMP = 'home_services_timestamp';

  // Load từ cache (chỉ cache 10 phút để luôn tươi mới)
  useEffect(() => {
    const cache = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP);

    const now = Date.now();
    const isFresh = timestamp && (now - parseInt(timestamp)) < 10 * 60 * 1000; // 10 phút

    if (cache && isFresh) {
      const data = JSON.parse(cache);
      setServices(data.services);
      setSelectedCategory(data.category);
    } else {
      fetchServices(); // Load lần đầu
    }
  }, []);

  // Khi đổi category → load lại
  useEffect(() => {
    if (services.length > 0) {
      fetchServices();
    }
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const data = selectedCategory === 'all'
        ? await serviceApi.getAllServices(0, 6)
        : await serviceApi.getServicesByCategory(selectedCategory, 0, 6);

      const items = data?.services || [];

      setServices(items);

      // Cache lại cho lần sau vào trang chủ
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        services: items,
        category: selectedCategory
      }));
      sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());

    } catch (err) {
      console.error(err);
      setError('Không thể tải dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewAll = () => {
    navigate('/services', {
      state: {
        initialServices: services,
        initialCategory: selectedCategory,
        initialPagination: {
          totalElements: services.length > 0 ? 999 : 0, // gợi ý có nhiều
        }
      },
    });
  };

  // Danh sách category hiển thị ở trang chủ (chỉ 4 cái chính, đẹp gọn)
  const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Consultation', label: 'Khám bệnh' },
  { id: 'Test', label: 'Thăm dò chức năng' },
  { id: 'Procedure', label: 'Thủ thuật' },
];
  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-cyan-50/50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Bảng Giá Dịch Vụ Tai Mũi Họng
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật mới nhất • Minh bạch • Chuyên sâu
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-cyan-500/30'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-cyan-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="text-center text-red-600 mb-8 font-medium">{error}</div>
        )}

        {/* Loading */}
        {loading && services.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Grid dịch vụ - có ảnh đẹp */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.length > 0 ? (
                services.map((service, index) => (
                  <ServiceCard
                    key={service.serviceId || index}
                    service={service}
                    index={index}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 text-lg py-12">
                  Không có dịch vụ nào trong danh mục này.
                </p>
              )}
            </div>

            {/* Nút Xem tất cả */}
            <div className="mt-16 text-center">
              <button
                onClick={handleViewAll}
                className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl hover:from-cyan-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-300"
              >
                Xem toàn bộ bảng giá dịch vụ
                <RefreshCw className={`ml-3 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}