import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Liên Hệ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Thông Tin Liên Hệ
          </h2>
          <p className="text-lg text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Địa Chỉ</h3>
                <p className="text-gray-600">
                  123 Đường Nguyễn Văn Linh, Quận 7<br />
                  Thành phố Hồ Chí Minh
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Điện Thoại</h3>
                <p className="text-gray-600">
                  Hotline: <a href="tel:0123456789" className="text-blue-600 hover:underline">0123 456 789</a><br />
                  Zalo: <a href="tel:0987654321" className="text-blue-600 hover:underline">0987 654 321</a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:contact@entclinic.vn" className="text-blue-600 hover:underline">
                    contact@entclinic.vn
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Giờ Làm Việc</h3>
                <p className="text-gray-600">
                  Thứ 2 - Thứ 6: 8:00 - 20:00<br />
                  Thứ 7 - Chủ Nhật: 8:00 - 17:00
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Hỗ Trợ Khẩn Cấp</h3>
              <p className="text-gray-600 mb-3">
                Nếu bạn gặp tình trạng khẩn cấp, vui lòng gọi ngay:
              </p>
              <a
                href="tel:0123456789"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Phone className="w-5 h-5" />
                <span>0123 456 789</span>
              </a>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl overflow-hidden h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954387384135!2d106.69919631480082!3d10.732119192330907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbea5fe3db1%3A0xfae94aca5709003f!2sNguyen%20Van%20Linh%2C%20District%207%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1629789123456!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Map location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}