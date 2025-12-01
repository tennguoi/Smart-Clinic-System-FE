// src/components/ServicesSection.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceApi } from '../api/serviceApi';
import ServiceCard from './ServiceCard';

export default function ServicesSection() {
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

      // Cache lại
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ services: items, category }));
      sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());

    } catch (err) {
      console.error('Lỗi tải dịch vụ:', err);
      setError('Không thể tải dịch vụ. Vui lòng thử lại.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Load lần đầu + xử lý cache
  useEffect(() => {
    const cache = sessionStorage.getItem(CACHE_KEY);
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP);
    const now = Date.now();
    const isFresh = timestamp && (now - parseInt(timestamp)) < 10 * 60 * 1000;

    if (cache && isFresh) {
      const { services: cached, category } = JSON.parse(cache);
      setServices(cached);
      setSelectedCategory(category);
      setLoading(false);
    } else {
      fetchServices('all'); // lần đầu luôn fetch
    }
  }, []);

  // Khi đổi category
  useEffect(() => {
    fetchServices(selectedCategory);
  }, [selectedCategory]);

  const handleViewAll = () => {
    navigate('/services', { state: { initialServices: services, initialCategory: selectedCategory } });
  };

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Consultation', label: 'Khám bệnh' },
    { id: 'Test', label: 'Thăm dò chức năng' },
    { id: 'Procedure', label: 'Thủ thuật' },
  ];

  return (
    <section id="services" className="py-12 bg-gradient-to-b from-cyan-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Bảng Giá Dịch Vụ Tai Mũi Họng
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Cập nhật mới nhất • Minh bạch • Chuyên sâu
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-cyan-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500'
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dịch vụ...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12 text-lg font-medium">{error}</div>
        ) : services.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12 text-lg">
            Không có dịch vụ nào trong danh mục này.
          </p>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={service.serviceId || index} service={service} index={index} />
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                onClick={handleViewAll}
                className="group inline-flex items-center px-10 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Xem tất cả dịch vụ
                <svg className="ml-3 w-6 h-6 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}