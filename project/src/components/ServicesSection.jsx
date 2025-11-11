import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi, getCategoryLabel } from '../api/serviceApi';
import ServiceCard from './ServiceCard';
import { RefreshCw } from 'lucide-react';

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const CACHE_KEY_SERVICES = 'cached_services';
  const CACHE_KEY_PAGINATION = 'cached_pagination';
  const CACHE_KEY_SELECTED_CAT = 'cached_selected_category';

  // ✅ Lấy dữ liệu từ cache nếu có
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY_SERVICES);
    const cachedPagination = sessionStorage.getItem(CACHE_KEY_PAGINATION);
    const cachedCat = sessionStorage.getItem(CACHE_KEY_SELECTED_CAT);

    if (cached && cachedPagination) {
      setServices(JSON.parse(cached));
      setPagination(JSON.parse(cachedPagination));
      if (cachedCat) setSelectedCategory(cachedCat);
    } else {
      fetchFirstPage({ showGlobalLoading: true });
    }
  }, []);

  // ✅ Load lại khi đổi category
  useEffect(() => {
    fetchFirstPage({ showGlobalLoading: true });
  }, [selectedCategory]);

  const fetchFirstPage = async ({ showGlobalLoading = true } = {}) => {
    try {
      if (showGlobalLoading && services.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      let data;
      if (selectedCategory === 'all') {
        data = await serviceApi.getAllServices(0, 6);
      } else {
        data = await serviceApi.getServicesByCategory(selectedCategory, 0, 6);
      }

      const items = data?.services || [];
      setServices(items);
      setPagination({
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? items.length,
        currentPage: data.currentPage ?? 0,
        isFirst: data.isFirst ?? true,
        isLast: data.isLast ?? false,
      });

      sessionStorage.setItem(CACHE_KEY_SERVICES, JSON.stringify(items));
      sessionStorage.setItem(CACHE_KEY_PAGINATION, JSON.stringify(data));
      sessionStorage.setItem(CACHE_KEY_SELECTED_CAT, selectedCategory);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewAll = () => {
    navigate('/services', {
      state: { initialServices: services, initialPagination: pagination },
    });
  };

  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Dịch vụ chuyên khoa Tai - Mũi - Họng</h2>

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
              <p className="text-gray-500 mt-6">Không có dịch vụ nào thuộc danh mục này.</p>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleViewAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
              >
                Xem tất cả dịch vụ
              </button>

              {refreshing && (
                <RefreshCw className="ml-3 animate-spin text-blue-500" size={20} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
