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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        {/* Number and Title on same line */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-12 h-12 rounded-lg ${getCategoryColor(service.category)} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {index + 1}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-left flex-1">
            {service.name}
          </h3>
        </div>

        {/* Service description */}
        <p className="text-gray-600 text-lg line-clamp-3 mb-4 text-left flex-1">
          {service.description || 'Dịch vụ chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm.'}
        </p>

        {/* Footer with category and price */}
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-100">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getCategoryColor(service.category)}`}>
            {getCategoryLabel(service.category)}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(service.price)}
          </div>
        </div>
      </div>
    </div>
  );
}