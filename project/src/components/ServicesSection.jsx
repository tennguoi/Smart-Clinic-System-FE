import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const CACHE_KEY_SERVICES = 'services_preview_v1';
const CACHE_KEY_PAGINATION = 'services_preview_pagination_v1';
const CACHE_KEY_SELECTED_CAT = 'services_preview_category_v1';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    if (location.pathname === '/') {
      // đang ở Home -> chỉ scroll mượt
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      return;
    }

    // Nếu không ở Home -> điều hướng tới /services
    // Lấy cached preview từ sessionStorage (nếu có) để tránh full-spinner ở trang /services
    let initialServices = null;
    let initialPagination = null;
    let initialSelectedCategory = null;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY_SERVICES);
      const rawPag = sessionStorage.getItem(CACHE_KEY_PAGINATION);
      const rawCat = sessionStorage.getItem(CACHE_KEY_SELECTED_CAT);
      if (raw) initialServices = JSON.parse(raw);
      if (rawPag) initialPagination = JSON.parse(rawPag);
      if (rawCat) initialSelectedCategory = rawCat;
    } catch (e) {
      // ignore
    }

    // Nếu điều hướng đến phần "services" cụ thể trên home page thay vì trang list
    if (sectionId === 'services' && initialServices) {
      // truyền initialServices để /services dùng ngay (không show fullscreen loader)
      navigate('/services', {
        state: {
          initialServices,
          initialPagination,
          initialSelectedCategory,
          fromHeader: true,
        },
      });
    } else if (sectionId === 'services') {
      // không có cache -> vẫn điều hướng, /services sẽ hiển thị spinner (bình thường)
      navigate('/services', { state: { fromHeader: true } });
    } else {
      // nếu là các section khác mà bạn muốn điều hướng về Home rồi scroll
      // ta chuyển về Home và kèm thông tin scrollTo để Home cuộn ngay khi mount
      navigate('/', { state: { scrollTo: sectionId } });
    }

    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">2CTW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Phòng Khám thông minh</h1>
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
