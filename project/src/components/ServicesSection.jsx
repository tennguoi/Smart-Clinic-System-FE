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
    <section id="services" className="py-20 bg-gradient-to-b from-cyan-50/30 to-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wide">
            Dịch Vụ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Bảng giá dịch vụ  tai - mũi - họng
          </h2>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-10 space-x-3 flex-wrap gap-3">
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
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white border-transparent shadow-lg shadow-cyan-500/30'
                  : 'bg-white hover:bg-cyan-50 border-gray-300 text-gray-700 hover:border-cyan-400 shadow-md hover:shadow-lg'
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

            <div className="mt-12 flex justify-center">
              <button
                onClick={handleViewAll}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-full font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 transform duration-300"
              >
                Xem tất cả dịch vụ
              </button>

              {refreshing && (
                <RefreshCw className="ml-3 animate-spin text-cyan-500" size={20} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
