import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-cyan-50 via-white to-white pt-12 pb-2 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-100/30 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block animate-slide-in-left">
              <span className="bg-cyan-600 text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold shadow-lg shadow-cyan-500/30">
                Phòng Khám Chuyên Khoa Hàng Đầu
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-snug">
              Chăm Sóc
              <br />
              <span className="text-cyan-600 tracking-wide">
                Tai-Mũi-Họng
              </span>
              <br />
              Toàn Diện
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mt-3">
              Đội ngũ bác sĩ chuyên môn cao, thiết bị hiện đại,
              mang đến dịch vụ chăm sóc sức khỏe ENT tốt nhất cho bạn và gia đình
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/appointment"
                className="group bg-cyan-600 text-white px-7 py-3.5 rounded-2xl hover:bg-cyan-700 transition-all font-semibold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transform duration-300"
              >
                <span>Đặt Lịch Khám Ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/services"
                className="bg-white/90 text-cyan-700 px-7 py-3.5 rounded-2xl hover:bg-white transition-all font-semibold text-lg border-2 border-cyan-200 hover:border-cyan-400 shadow-md hover:shadow-lg"
              >
                Xem Dịch Vụ
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold text-cyan-600">15+</div>
                <div className="text-sm text-gray-600 mt-1">Năm kinh nghiệm</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold text-cyan-600">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Bệnh nhân</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold text-cyan-600">98%</div>
                <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50">
              <img
                src="https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="ENT Clinic"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent"></div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-2xl p-6 max-w-xs border-2 border-cyan-100 hover:shadow-cyan-500/20 transition-all animate-bounce-subtle">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">✓</span>
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