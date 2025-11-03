import { useState } from 'react';
import { entServices } from '../data/services';
import ServiceCard from './ServiceCard';
import { ArrowRight } from 'lucide-react';

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState(null);

  const featuredServices = entServices.slice(0, 6);

  const handleBooking = (serviceId) => {
    setSelectedService(serviceId);
    const appointmentSection = document.getElementById('appointment');
    if (appointmentSection) {
      appointmentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFullServices = () => {
    const element = document.getElementById('full-services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Dịch Vụ Chuyên Nghiệp
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Dịch Vụ Tai-Mũi-Họng Nổi Bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cung cấp đa dạng dịch vụ khám, chẩn đoán và điều trị chuyên khoa ENT
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBooking={handleBooking}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={scrollToFullServices}
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg border-2 border-blue-600"
          >
            <span>Xem Tất Cả Dịch Vụ</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}