import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';
import Footer from '../components/Footer';

export default function ContactPage() {
  const { clinicInfo } = useClinic();

  // Fallback values nếu chưa có dữ liệu
  const clinicAddress = clinicInfo?.address || '123 Đường Nguyễn Văn Linh, Phường 26, Quận 7, Thành phố Hồ Chí Minh, Việt Nam';
  const clinicPhone = clinicInfo?.phone || '0123 456 789';
  const clinicEmail = clinicInfo?.email || 'contact@entclinic.vn';

  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-gray-600">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Địa Chỉ</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {clinicAddress}
                </p>
              </div>
            </div>

            {clinicPhone && (
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">Điện Thoại</h3>
                  <p className="text-gray-600">
                    Hotline: <a href={`tel:${clinicPhone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline font-medium">{clinicPhone}</a>
                  </p>
                </div>
              </div>
            )}

            {clinicEmail && (
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">Email</h3>
                  <p className="text-gray-600">
                    <a href={`mailto:${clinicEmail}`} className="text-blue-600 hover:underline font-medium">
                      {clinicEmail}
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Giờ Làm Việc</h3>
                <p className="text-gray-600">
                  Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                  Thứ 7 - Chủ Nhật: 8:00 - 17:00
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h2>
            <form className="space-y-6">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Số Điện Thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={clinicPhone || "0123 456 789"}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ Đề
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option>Chọn chủ đề</option>
                  <option>Tư vấn dịch vụ</option>
                  <option>Đặt lịch khám</option>
                  <option>Phản hồi về dịch vụ</option>
                  <option>Tình trạng khẩn cấp</option>
                  <option>Khác</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội Dung Tin Nhắn
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Vui lòng chi tiết câu hỏi hoặc yêu cầu của bạn..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}