// src/components/ServiceCard.jsx
import { formatPrice, getCategoryLabel } from '../data/services';

export default function ServiceCard({ service }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {getCategoryLabel(service.category).charAt(0)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</div>
          <div className="text-sm text-gray-500 mt-1">{getCategoryLabel(service.category)}</div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {service.name}
      </h3>

      <p className="text-gray-600 leading-relaxed">
        {service.description}
      </p>
    </div>
  );
}