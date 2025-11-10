// src/components/ServiceCard.jsx
import { getCategoryLabel, formatPrice } from '../api/serviceApi';

export default function ServiceCard({ service, index }) {
  const getCategoryColor = (category) => {
    const colors = {
      Consultation: 'bg-blue-100 text-blue-700',
      Test: 'bg-purple-100 text-purple-700',
      Procedure: 'bg-green-100 text-green-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        {/* Header with number and price */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${getCategoryColor(service.category)} flex items-center justify-center font-bold text-lg`}>
            {index}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(service.price)}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getCategoryColor(service.category)}`}>
              {getCategoryLabel(service.category)}
            </div>
          </div>
        </div>

        {/* Service name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {service.name}
        </h3>

        {/* Service description */}
        <p className="text-gray-600 text-sm line-clamp-3">
          {service.description || 'Dịch vụ chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm.'}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Đặt Lịch Ngay
        </button>
      </div>
    </div>
  );
}