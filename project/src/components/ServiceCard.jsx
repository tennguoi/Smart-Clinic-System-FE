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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer group">
      <div className="p-6">
        {/* Header with number and category badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${getCategoryColor(service.category)} flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300`}>
            {index + 1}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
            {getCategoryLabel(service.category)}
          </div>
        </div>

        {/* Service name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {service.name}
        </h3>

        {/* Service description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {service.description || 'Dịch vụ chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm.'}
        </p>

        {/* Price at bottom */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-500 font-medium">Giá dịch vụ:</span>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(service.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}