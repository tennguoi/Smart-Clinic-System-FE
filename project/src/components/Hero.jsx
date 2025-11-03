import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 to-teal-50 pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                Phòng Khám Chuyên Khoa Hàng Đầu
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Chăm Sóc<br />
              <span className="text-blue-600">Tai-Mũi-Họng</span><br />
              Toàn Diện
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Đội ngũ bác sĩ chuyên môn cao, thiết bị hiện đại,
              mang đến dịch vụ chăm sóc sức khỏe ENT tốt nhất cho bạn và gia đình
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/appointment"
                className="group bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-medium text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Đặt Lịch Khám Ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/services"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-blue-600"
              >
                Xem Dịch Vụ
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-600 mt-1">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Bệnh nhân</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="ENT Clinic"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Chứng Nhận</div>
                  <div className="text-sm text-gray-600">Bộ Y Tế công nhận</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}