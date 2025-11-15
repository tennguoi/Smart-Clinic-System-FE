import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const HOTLINE = '1900 636 949';

export default function StickyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Trang Chủ', path: '/' },
    { label: 'Giới Thiệu', path: '/about' },
    { label: 'Dịch Vụ', path: '/services' },
    { label: 'Đội Ngũ Bác Sĩ', path: '/doctors' },
    { label: 'Tin Tức', path: '/news' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white shadow-md border-t-2 border-pink-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid h-24 items-center gap-4 grid-cols-[auto,auto] lg:grid-cols-[auto,1fr,auto]">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-all group">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-xl">2CTW</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-gray-900 leading-tight whitespace-nowrap">Phòng Khám thông minh</h1>
              <p className="text-sm text-gray-600 leading-tight whitespace-nowrap">Chuyên khoa Tai-Mũi-Họng</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center justify-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-5 py-2.5 text-gray-700 hover:text-cyan-600 transition-all font-medium text-base rounded-lg hover:bg-cyan-50 whitespace-nowrap relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4 justify-self-end">
            <a
              href={`tel:${HOTLINE.replace(/\s/g, '')}`}
              className="flex items-center gap-2 rounded-full border border-red-200 bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-white font-semibold text-sm tracking-wide shadow-lg shadow-red-400/40 hover:shadow-red-500/40 transition-all hover:scale-105 whitespace-nowrap"
            >
              <Phone className="w-5 h-5" />
              <span className="whitespace-nowrap">{HOTLINE}</span>
            </a>

            <Link
              to="/appointment"
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-7 py-3 rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all font-semibold text-base shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 transform duration-300 whitespace-nowrap"
            >
              ĐẶT LỊCH NHANH
            </Link>
          </div>

          <div className="justify-self-end lg:hidden">
            <button
              className="text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 px-4 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition-all rounded-lg font-medium text-base"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-3 border-gray-200" />
            <a
              href={`tel:${HOTLINE.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200 px-4 py-3 text-cyan-600 font-semibold uppercase"
            >
              <Phone className="w-4 h-4" />
              Cấp cứu: {HOTLINE}
            </a>
            <Link
              to="/appointment"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 py-3.5 rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all font-semibold text-base text-center shadow-lg shadow-cyan-500/30"
            >
              ĐẶT LỊCH NHANH
            </Link>
          </nav>
        </div>
      )}
    </nav>
  );
}