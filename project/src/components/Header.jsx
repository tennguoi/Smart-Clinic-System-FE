import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clinicInfo } = useClinic();

  const clinicName = clinicInfo?.name?.trim() || '';
  const baseLogoUrl = clinicInfo?.logoUrl?.trim() || '';
  const cacheBuster = clinicInfo?.updatedAt ? new Date(clinicInfo.updatedAt).getTime() : Date.now();
  const clinicLogoUrl = baseLogoUrl ? `${baseLogoUrl}?v=${cacheBuster}` : '';

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
            {clinicLogoUrl ? (
              <img
                key={clinicLogoUrl}
                src={clinicLogoUrl}
                alt={clinicName || 'Logo phòng khám'}
                className="w-12 h-12 object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-xs">
                Logo
              </div>
            )}
            <div>
              {clinicName ? (
                <h1 className="text-xl font-bold text-gray-900">{clinicName}</h1>
              ) : (
                <p className="text-sm text-gray-500">Chưa cập nhật tên phòng khám</p>
              )}
              <p className="text-xs text-gray-600">Vui lòng cập nhật thông tin trong trang quản trị</p>
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