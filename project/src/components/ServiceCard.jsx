import { ArrowRight, Clock } from 'lucide-react';
import { formatPrice } from '../data/services';
import * as LucideIcons from 'lucide-react';

export default function ServiceCard({ service, onBooking }) {
  const IconComponent = service.icon
    ? LucideIcons[service.icon.charAt(0).toUpperCase() + service.icon.slice(1).replace(/-./g, x => x[1].toUpperCase())] || LucideIcons.Stethoscope
    : LucideIcons.Stethoscope;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
          <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            {service.duration} phút
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {service.name}
      </h3>

      <p className="text-gray-600 mb-6 leading-relaxed">
        {service.description}
      </p>

      <button
        onClick={() => onBooking?.(service.id)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 group"
      >
        <span>Đặt Lịch Ngay</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}