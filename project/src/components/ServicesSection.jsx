// src/components/ServicesSection.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { serviceApi } from '../api/serviceApi';
import ServiceCard from './ServiceCard';

export default function ServicesSection() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const CACHE_KEY = 'home_services_cache_v2';
  const CACHE_TIMESTAMP = 'home_services_timestamp';

  const fetchServices = async (category = selectedCategory) => {
    try {
      setLoading(true);
      setError(null);

      const data = category === 'all'
        ? await serviceApi.getAllServices(0, 6)
        : await serviceApi.getServicesByCategory(category, 0, 6);

      const items = data?.services || [];
      setServices(items);

      // Cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ services: items, category }));
      sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());
    } catch (err) {
      console.error('Lỗi tải dịch vụ:', err);
      // Chỉ hiển thị lỗi, không redirect
      const errorMessage = err.message || t('servicesSection.error');
      setError(errorMessage);
      setServices([]);
      // Không throw error để tránh redirect
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu + xử lý cache
  useEffect(() => {
    const cache = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP);
    const now = Date.now();
    const isFresh = timestamp && (now - parseInt(timestamp)) < 10 * 60 * 1000; // 10 phút

    if (cache && isFresh) {
      const { services: cached, category } = JSON.parse(cache);
      setServices(cached);
      setSelectedCategory(category);
      setLoading(false);
    } else {
      setSelectedCategory('all');
      fetchServices('all');
    }
  }, []);

  // Khi đổi category
  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory);
    }
  }, [selectedCategory]);

  const handleViewAll = () => {
    navigate('/services', {
      state: { initialServices: services, initialCategory: selectedCategory }
    });
  };

  const categories = [
    { id: 'all', label: t('servicesSection.categories.all') },
    { id: 'Consultation', label: t('servicesSection.categories.consultation') },
    { id: 'Test', label: t('servicesSection.categories.test') },
    { id: 'Procedure', label: t('servicesSection.categories.procedure') },
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white via-cyan-50/40 to-blue-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-5">
            {t('servicesSection.title')}
          </h2>
          <p className="mt-5 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            {t('servicesSection.subtitle')}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Tab chọn danh mục */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/50 scale-110'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t('servicesSection.loading')}
            </p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400 py-12 text-lg font-medium">{error}</div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12 text-lg">
            {t('servicesSection.noServices')}
          </p>
        ) : (
          <>
            {/* Danh sách dịch vụ */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={service.serviceId || index} service={service} index={index} />
              ))}
            </div>

            {/* Nút xem tất cả */}
            <div className="mt-20 text-center">
              <button
                onClick={handleViewAll}
                className="group inline-flex items-center px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
              >
                {t('servicesSection.viewAll')}
                <svg
                  className="ml-4 w-7 h-7 group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}