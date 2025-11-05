// src/pages/FullServicesPage.jsx
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { entServices, getCategoryLabel, formatPrice } from '../data/services';

const categories = [
  { value: 'all', label: 'Tất Cả' },
  { value: 'Consultation', label: 'Khám Bệnh' },
  { value: 'Test', label: 'Thăm Dò' },
  { value: 'Procedure', label: 'Thủ Thuật' },
];

export default function FullServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all'
    ? entServices.filter(service => service.isActive)
    : entServices.filter(service => service.isActive && service.category === selectedCategory);

  return (
    <section id="full-services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Danh Sách Dịch Vụ
          </h2>
          <p className="text-lg text-gray-600">
            Các dịch vụ khám và điều trị chuyên khoa Tai-Mũi-Họng
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Filter className="w-4 h-4 text-gray-600 ml-2" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên Dịch Vụ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mô Tả</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Loại Dịch Vụ</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Giá</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.serviceId} className="border-t border-gray-200">
                  <td className="px-6 py-4 text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-gray-600">{service.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {getCategoryLabel(service.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-blue-600">{formatPrice(service.price)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Cần Tư Vấn Thêm?
            </h3>
            <p className="text-gray-600 mb-6">
              Liên hệ với chúng tôi để được tư vấn chi tiết về dịch vụ phù hợp với tình trạng sức khỏe của bạn
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0123456789"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border-2 border-blue-600"
              >
                Gọi Ngay: 0123 456 789
              </a>
              <a
                href="/appointment"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Đặt Lịch Online
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}