import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block animate-slide-in-left">
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-cyan-500/30">
                Phòng Khám Chuyên Khoa Hàng Đầu
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Chăm Sóc
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Tai-Mũi-Họng
              </span>
              <br />
              Toàn Diện
            </h1>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Đội ngũ bác sĩ chuyên môn cao, thiết bị hiện đại,
              mang đến dịch vụ chăm sóc sức khỏe ENT tốt nhất cho bạn và gia đình
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/appointment"
                className="group bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-emerald-600 transition-all font-semibold text-lg flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transform duration-300"
              >
                <span>Đặt Lịch Khám Ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/services"
                className="bg-white text-cyan-600 px-8 py-4 rounded-xl hover:bg-cyan-50 transition-all font-semibold text-lg border-2 border-cyan-500 hover:border-cyan-600 shadow-md hover:shadow-lg"
              >
                Xem Dịch Vụ
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">15+</div>
                <div className="text-sm text-gray-600 mt-1">Năm kinh nghiệm</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Bệnh nhân</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">98%</div>
                <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50">
              <img
                src="https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="ENT Clinic"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent"></div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs border-2 border-cyan-100 hover:shadow-cyan-500/20 transition-all animate-bounce-subtle">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
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