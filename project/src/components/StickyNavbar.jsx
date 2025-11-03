import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

export default function StickyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Giới Thiệu', path: '/about' },
    { label: 'Dịch Vụ', path: '/services' },
    { label: 'Đội Ngũ Bác Sĩ', path: '/doctors' },
    { label: 'Bảng Giá & Gói Khám', path: '/pricing' },
    { label: 'Tin Tức', path: '/news' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">2CTW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Phòng Khám thông minh</h1>
              <p className="text-xs text-gray-600">Chuyên khoa Tai-Mũi-Họng</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/appointment"
              className="bg-teal-500 text-white px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm"
            >
              ĐẶT LỊCH NHANH
            </Link>
          </div>

          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <nav className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Link
              to="/appointment"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-medium text-center"
            >
              ĐẶT LỊCH NHANH
            </Link>
          </nav>
        </div>
      )}
    </nav>
  );
}