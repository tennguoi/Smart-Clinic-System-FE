import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { clinicInfo } = useClinic();

  const clinicName = clinicInfo?.name?.trim() || '';
  const clinicAddress = clinicInfo?.address?.trim() || '';
  const clinicPhone = clinicInfo?.phone?.trim() || '';
  const clinicEmail = clinicInfo?.email?.trim() || '';
  const clinicLogoUrl = clinicInfo?.logoUrl?.trim() || '';

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {clinicLogoUrl ? (
                <img
                  src={clinicLogoUrl}
                  alt={clinicName || 'Logo phòng khám'}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center text-xs uppercase">
                  Logo
                </div>
              )}
              {clinicName ? (
                <span className="text-white font-bold text-lg">{clinicName}</span>
              ) : (
                <span className="text-sm text-gray-400">Chưa cập nhật tên phòng khám</span>
              )}
            </div>
            <p className="text-sm mb-4 text-gray-400">
              Cập nhật thông tin tại trang quản trị để hiển thị nội dung phòng khám.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Dịch Vụ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  Khám Tai-Mũi-Họng
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  Nội Soi Chẩn Đoán
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  Thủ Thuật ENT
                </a>
              </li>
              
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Về Chúng Tôi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#doctors" className="hover:text-blue-400 transition-colors">
                  Đội Ngũ Bác Sĩ
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-blue-400 transition-colors">
                  Đánh Giá
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Tin Tức
                </a>
              </li>

            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              {clinicAddress && (
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{clinicAddress}</span>
                </li>
              )}
              {clinicPhone && (
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a href={`tel:${clinicPhone.replace(/\s/g, '')}`} className="hover:text-blue-400 transition-colors">
                    {clinicPhone}
                  </a>
                </li>
              )}
              {clinicEmail && (
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${clinicEmail}`} className="hover:text-blue-400 transition-colors">
                    {clinicEmail}
                  </a>
                </li>
              )}
              {clinicInfo?.website && (
                <li className="flex items-center space-x-2">
                  <span className="w-4 h-4 flex-shrink-0">🌐</span>
                  <a 
                    href={clinicInfo.website.startsWith('http') ? clinicInfo.website : `https://${clinicInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    {clinicInfo.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {currentYear} {clinicName || 'Chưa cập nhật tên phòng khám'}.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Chính Sách Bảo Mật
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Điều Khoản Sử Dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}