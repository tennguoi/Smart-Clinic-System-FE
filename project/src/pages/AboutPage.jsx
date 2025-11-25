import { Award, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Về Chúng Tôi
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hành trình 15 năm xây dựng niềm tin và chất lượng dịch vụ chăm sóc sức khỏe Tai-Mũi-Họng
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="ENT Clinic Team"
                  className="w-full h-[480px] object-cover"
                />
              </div>

              {/* Certification Badge */}
              <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Bộ Y Tế chứng nhận</div>
                    <div className="text-xs text-gray-600">Chuẩn quốc tế ISO 9001:2015</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Câu chuyện của chúng tôi
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Được thành lập từ năm 2009, chúng tôi bắt đầu với mục tiêu đơn giản nhưng đầy ý nghĩa: 
                  mang đến dịch vụ chăm sóc Tai-Mũi-Họng chất lượng cao với sự tận tâm và chuyên nghiệp.
                </p>
                
                <p>
                  Qua hơn 15 năm phát triển, chúng tôi đã phục vụ hơn 50.000 bệnh nhân, không ngừng đầu tư 
                  vào công nghệ y tế hiện đại và đào tạo đội ngũ y bác sĩ chuyên sâu. Mỗi bệnh nhân đến với 
                  chúng tôi không chỉ được khám chữa bệnh mà còn được chăm sóc như người thân trong gia đình.
                </p>

                <p>
                  Hôm nay, chúng tôi tự hào là một trong những phòng khám thông minh tiên phong ứng dụng 
                  công nghệ số vào quản lý và chăm sóc bệnh nhân, mang đến trải nghiệm khám chữa bệnh 
                  hiện đại và tiện lợi nhất.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sứ mệnh - Tầm nhìn - Giá trị
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">Sứ Mệnh</h3>
              <p className="text-gray-600 leading-relaxed">
                Mang đến dịch vụ chăm sóc Tai-Mũi-Họng chuẩn quốc tế với chi phí hợp lý và trải nghiệm tận tâm, 
                giúp mỗi bệnh nhân an tâm và hài lòng.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">Tầm Nhìn</h3>
              <p className="text-gray-600 leading-relaxed">
                Trở thành phòng khám thông minh dẫn đầu về công nghệ và chất lượng khám chữa ENT tại Việt Nam, 
                được bệnh nhân tin tưởng lựa chọn hàng đầu.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-200 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors duration-300">Giá Trị Cốt Lõi</h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">Chuyên nghiệp – Minh bạch – Nhân ái.</span> 
                {' '}Luôn đặt sức khỏe bệnh nhân ở vị trí trung tâm trong mọi quyết định.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những con số và thành tích ấn tượng qua 15 năm hoạt động
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* 15+ Years Experience */}
            <div className="group bg-cyan-50 rounded-2xl p-8 border border-cyan-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-300 hover:bg-cyan-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Award className="w-7 h-7 text-cyan-600 group-hover:text-cyan-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">15+</div>
              <div className="text-base font-semibold text-gray-900 mb-3">Năm kinh nghiệm</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Đội ngũ bác sĩ chuyên khoa với hơn 15 năm làm việc trong ngành, tích lũy kinh nghiệm điều trị 
                hàng nghìn ca bệnh phức tạp.
              </p>
            </div>

            {/* 50K+ Patients */}
            <div className="group bg-cyan-50 rounded-2xl p-8 border border-cyan-100 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-300 hover:bg-cyan-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Users className="w-7 h-7 text-cyan-600 group-hover:text-cyan-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors duration-300">50K+</div>
              <div className="text-base font-semibold text-gray-900 mb-3">Bệnh nhân phục vụ</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hơn 50.000 bệnh nhân đã tin tưởng và lựa chọn chúng tôi để giải quyết các vấn đề về 
                Tai-Mũi-Họng, với tỷ lệ hài lòng 98%.
              </p>
            </div>

            {/* Ministry Certified */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-2xl hover:-translate-y-2 hover:border-green-300 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                <Shield className="w-7 h-7 text-green-600 group-hover:text-green-700" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                <svg className="w-10 h-10 text-green-600 group-hover:text-green-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-base font-semibold text-gray-900 mb-3">Bộ Y Tế chứng nhận</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Phòng khám được chứng nhận và cấp phép bởi Bộ Y Tế, đạt chuẩn ISO 9001:2015, 
                đảm bảo chất lượng dịch vụ y tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Chúng tôi khác biệt như thế nào?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Công nghệ hiện đại và quy trình chăm sóc chuyên nghiệp
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="group flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300 cursor-pointer h-full">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-cyan-600 transition-colors duration-300">Hệ thống phòng khám thông minh</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Nền tảng số giúp quản lý hồ sơ bệnh án, kết quả khám chữa bệnh và theo dõi tình trạng 
                  bệnh nhân một cách chính xác và nhanh chóng.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300 cursor-pointer h-full">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-cyan-600 transition-colors duration-300">Trang thiết bị chuẩn quốc tế</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Đầu tư thiết bị y tế hiện đại nhất, được nhập khẩu từ các thương hiệu hàng đầu thế giới, 
                  đảm bảo độ chính xác cao.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300 cursor-pointer h-full">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-cyan-600 transition-colors duration-300">Đặt lịch online & nhắc hẹn tự động</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Hệ thống quản trị lịch hẹn thời gian thực giúp giảm tối đa thời gian chờ, bệnh nhân có thể 
                  đặt lịch mọi lúc mọi nơi.
                </p>
              </div>
            </div>

            <div className="group flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-cyan-200 transition-all duration-300 cursor-pointer h-full">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg group-hover:text-cyan-600 transition-colors duration-300">Tư vấn & theo dõi sau khám</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Bệnh nhân được tư vấn hậu khám qua nền tảng chăm sóc từ xa, đảm bảo quá trình phục hồi 
                  đúng hướng.
                </p>
              </div>
            </div>
          </div>

          {/* Process Highlights */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quy trình khám chữa bệnh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">1</div>
                <div className="font-semibold text-gray-900 mb-1">Đặt lịch online</div>
                <div className="text-sm text-gray-600">Nhanh chóng, tiện lợi</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">2</div>
                <div className="font-semibold text-gray-900 mb-1">Khám & chẩn đoán</div>
                <div className="text-sm text-gray-600">Chính xác, chi tiết</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">3</div>
                <div className="font-semibold text-gray-900 mb-1">Điều trị hiệu quả</div>
                <div className="text-sm text-gray-600">An toàn, chuyên nghiệp</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">4</div>
                <div className="font-semibold text-gray-900 mb-1">Theo dõi sau khám</div>
                <div className="text-sm text-gray-600">Tận tâm, chu đáo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
