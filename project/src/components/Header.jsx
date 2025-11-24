import { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';
import defaultLogo from '../images/logo.png';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clinicInfo } = useClinic();

  // Fallback values nếu chưa có dữ liệu
  const clinicName = clinicInfo?.name || 'Phòng Khám thông minh';
  const clinicLogoUrl = clinicInfo?.logoUrl;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <img 
              src={clinicLogoUrl || defaultLogo} 
              alt={clinicName || 'Logo phòng khám'}
              className="w-12 h-12 object-contain rounded-lg"
              onError={(e) => {
                e.target.src = defaultLogo;
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{clinicName}</h1>
              <p className="text-xs text-gray-600">Chuyên khoa Tai-Mũi-Họng</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Trang Chủ
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Dịch Vụ
            </button>
            <button onClick={() => scrollToSection('doctors')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Đội Ngũ
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Đánh Giá
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Liên Hệ
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => scrollToSection('appointment')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đặt Lịch Nhanh
            </button>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="px-4 py-4 space-y-3">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left py-2 text-gray-700">
              Trang Chủ
            </button>
            <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 text-gray-700">
              Dịch Vụ
            </button>
            <button onClick={() => scrollToSection('doctors')} className="block w-full text-left py-2 text-gray-700">
              Đội Ngũ
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="block w-full text-left py-2 text-gray-700">
              Đánh Giá
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-gray-700">
              Liên Hệ
            </button>
            <button
              onClick={() => scrollToSection('appointment')}
              className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Đặt Lịch Nhanh
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}