// src/components/ServiceCard.jsx
import { useState } from 'react';
import { getCategoryLabel, formatPrice, getServiceImage } from '../api/serviceApi';

export default function ServiceCard({ service, index }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Lấy URL ảnh (từ database hoặc placeholder)
  const imageUrl = getServiceImage(service);

  const getCategoryColor = (category) => {
    const colors = {
      Consultation: 'bg-blue-100 text-blue-700',
      Test: 'bg-purple-100 text-purple-700',
      Procedure: 'bg-green-100 text-green-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-cyan-200 flex flex-col h-full hover:-translate-y-1 cursor-pointer">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-cyan-50">
        {!imageError ? (
          <>
            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Image from Database */}
            <img
              src={imageUrl}
              alt={service.name}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoading(false)}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          </>
        ) : (
          // Fallback UI when image fails to load
          <div className="w-full h-full flex items-center justify-center bg-cyan-100">
            <svg className="w-20 h-20 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Index Number Badge */}
        <div className="absolute top-3 left-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-lg text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
            {index + 1}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(service.category)}`}>
            {getCategoryLabel(service.category)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-cyan-600 transition-colors duration-300">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-base line-clamp-2 mb-4 flex-1">
          {service.description || 'Dịch vụ chuyên nghiệp với đội ngũ bác sĩ giàu kinh nghiệm.'}
        </p>

        {/* Price */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500">Giá khám</span>
            <span className="text-xl font-bold text-cyan-600">
              {formatPrice(service.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}