import { useState, useEffect } from 'react';
import { serviceApi } from '../api/serviceApi';
import ServiceCard from './ServiceCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CACHE_KEY_SERVICES = 'services_preview_v1';
const CACHE_KEY_PAGINATION = 'services_preview_pagination_v1';
const CACHE_KEY_SELECTED_CAT = 'services_preview_category_v1';

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // only fullscreen when no cached data
  const [refreshing, setRefreshing] = useState(false); // small spinner when background refresh
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    isFirst: true,
    isLast: false,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchFirstPage = async ({ showGlobalLoading = true } = {}) => {
    try {
      if (showGlobalLoading && services.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const data = await serviceApi.getAllServices(0, 6); // pageIndex 0, pageSize 6
      const items = data?.services || [];
      // optional: apply category filter here if you want homepage preview filtered
      const filtered = selectedCategory === 'all' ? items : items.filter(s => s.category === selectedCategory);

      setServices(filtered);
      setPagination({
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? (data.services?.length ?? filtered.length),
        currentPage: data.currentPage ?? 0,
        isFirst: data.isFirst ?? true,
        isLast: data.isLast ?? false,
      });

      try {
        sessionStorage.setItem(CACHE_KEY_SERVICES, JSON.stringify(filtered));
        sessionStorage.setItem(CACHE_KEY_PAGINATION, JSON.stringify({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.currentPage,
          isFirst: data.isFirst,
          isLast: data.isLast
        }));
        sessionStorage.setItem(CACHE_KEY_SELECTED_CAT, selectedCategory);
      } catch (e) {
        // ignore storage errors
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Try load from sessionStorage first to avoid flash
    let cachedServices = null;
    let cachedPagination = null;
    let cachedCat = null;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY_SERVICES);
      const rawPag = sessionStorage.getItem(CACHE_KEY_PAGINATION);
      const rawCat = sessionStorage.getItem(CACHE_KEY_SELECTED_CAT);
      if (raw) cachedServices = JSON.parse(raw);
      if (rawPag) cachedPagination = JSON.parse(rawPag);
      if (rawCat) cachedCat = rawCat;
    } catch (e) {
      // ignore parse errors
    }

    if (cachedServices && Array.isArray(cachedServices) && cachedServices.length > 0) {
      setServices(cachedServices);
      setPagination(cachedPagination || pagination);
      if (cachedCat) setSelectedCategory(cachedCat);
      setLoading(false);
      // refresh in background (small spinner)
      fetchFirstPage({ showGlobalLoading: false });
    } else {
      // no cache -> show global spinner
      fetchFirstPage({ showGlobalLoading: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && services.length === 0) {
    // only show fullscreen loader when there is no cached data
    return (
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dịch vụ...</p>
        </div>
      </section>
    );
  }

  if (error && services.length === 0) {
    return (
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchFirstPage({ showGlobalLoading: true })}
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
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Dịch Vụ Chuyên Nghiệp</span>
            {refreshing && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">Dịch Vụ Tai-Mũi-Họng Nổi Bật</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Cung cấp đa dạng dịch vụ khám, chẩn đoán và điều trị chuyên khoa ENT</p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Hiện không có dịch vụ nào.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {services.map((service, idx) => (
                <ServiceCard
                  key={service.serviceId ?? service.id ?? idx}
                  service={service}
                  index={idx + 1}
                />
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/services"
                state={{
                  initialServices: services,
                  initialPagination: pagination,
                  initialSelectedCategory: selectedCategory,
                }}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg border-2 border-blue-600"
              >
                <span>Xem Tất Cả Dịch Vụ</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
