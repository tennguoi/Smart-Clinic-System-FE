import { useState } from 'react';
import { entServices, getCategoryLabel, formatPrice } from '../data/services';
import { Filter, ArrowRight, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export default function FullServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'kham', label: 'Khám Bệnh' },
    { value: 'tham-do', label: 'Thăm Dò' },
    { value: 'thu-thuat', label: 'Thủ Thuật' },
    { value: 'goi-kham', label: 'Gói Khám' }
  ];

  const filteredServices = selectedCategory === 'all'
    ? entServices
    : entServices.filter(service => service.category === selectedCategory);

  const handleBooking = () => {
    const element = document.getElementById('appointment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="full-services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bảng Giá Dịch Vụ
          </h2>
          <p className="text-lg text-gray-600">
            Chi tiết dịch vụ khám và điều trị chuyên khoa Tai-Mũi-Họng
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

        <div className="mb-8">
          <div className="text-sm text-gray-600 text-center">
            Hiển thị <span className="font-semibold text-blue-600">{filteredServices.length}</span> dịch vụ
          </div>
        </div>

        <div className="space-y-4">
          {filteredServices.map((service) => {
            const IconComponent = service.icon
              ? LucideIcons[service.icon.charAt(0).toUpperCase() + service.icon.slice(1).replace(/-./g, x => x[1].toUpperCase())] || LucideIcons.Stethoscope
              : LucideIcons.Stethoscope;

            return (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {service.name}
                        </h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {getCategoryLabel(service.category)}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Thời gian: {service.duration} phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Giá dịch vụ</div>
                      <div className="text-2xl md:text-3xl font-bold text-blue-600">
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    <button
                      onClick={handleBooking}
                      className="whitespace-nowrap bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <span>Đặt Lịch</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              <button
                onClick={handleBooking}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Đặt Lịch Online
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}