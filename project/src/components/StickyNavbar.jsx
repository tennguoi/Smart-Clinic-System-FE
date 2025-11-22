import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';
import defaultLogo from '../images/logo.png';

export default function StickyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { clinicInfo } = useClinic();

  const clinicName = clinicInfo?.name;
  const clinicPhone = clinicInfo?.phone;
  const clinicLogoUrl = clinicInfo?.logoUrl;

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
        {/* WRAPPER */}
        <div className="flex h-24 items-center w-full">

          {/* LEFT: LOGO (1/3 chiều rộng) */}
          <div className="flex flex-1 lg:basis-1/3 items-center">
            <Link
              to="/"
              className="flex items-center space-x-3 hover:opacity-90 transition-all group"
            >
              <img 
                src={clinicLogoUrl || defaultLogo} 
                alt={clinicName || 'Logo phòng khám'}
                className="w-16 h-16 object-contain rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                onError={(e) => {
                  e.target.src = defaultLogo;
                }}
              />
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold text-gray-900 leading-tight whitespace-nowrap">
                  {clinicName}
                </h1>
                
              </div>
            </Link>
          </div>

          {/* CENTER: NAV LINKS (1/3 chiều rộng) */}
          <div className="hidden lg:flex flex-1 lg:basis-1/3 items-center justify-center space-x-2">
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

          {/* RIGHT: HOTLINE + CTA (1/3 chiều rộng) */}
          {clinicPhone && (
            <div className="hidden lg:flex flex-1 lg:basis-1/3 items-center justify-end gap-3">
              <a
                href={`tel:${clinicPhone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-full border border-red-200 bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-white font-semibold text-sm tracking-wide shadow-lg shadow-red-400/30 hover:shadow-red-500/40 transition-all hover:scale-105 whitespace-nowrap min-w-[170px]"
              >
                <Phone className="w-5 h-5" />
                <span className="whitespace-nowrap">{clinicPhone}</span>
              </a>

              <Link
                to="/appointment"
                className="flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-5 py-2.5 min-w-[170px] hover:from-cyan-600 hover:to-emerald-600 transition-all font-semibold text-sm shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 duration-300 whitespace-nowrap"
              >
                ĐẶT LỊCH NHANH
              </Link>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden text-gray-700 ml-auto"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
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

            {clinicPhone && (
              <a
                href={`tel:${clinicPhone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200 px-4 py-3 text-cyan-600 font-semibold uppercase"
              >
                <Phone className="w-4 h-4" />
                Cấp cứu: {clinicPhone}
              </a>
            )}

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
