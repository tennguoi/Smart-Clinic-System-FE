import { Award, Users, Target, Heart } from 'lucide-react';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Giới Thiệu Phòng Khám
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hơn 15 năm tận tâm chăm sóc sức khỏe Tai-Mũi-Họng của bệnh nhân
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Câu Chuyện Của Chúng Tôi
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Phòng Khám ENT được thành lập với mục đích mang đến dịch vụ chăm sóc sức khỏe Tai-Mũi-Họng chất lượng cao, áp dụng công nghệ tiên tiến và phương pháp điều trị hiện đại.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Chúng tôi tập hợp đội ngũ bác sĩ chuyên khoa I, II với nhiều năm kinh nghiệm, trang thiết bị y tế tân tiên, và luôn sẵn sàng phục vụ bệnh nhân với tâm huyết cao nhất.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Mục tiêu của chúng tôi là trở thành phòng khám Tai-Mũi-Họng hàng đầu, nơi bệnh nhân có thể tin tưởng và tìm thấy sự chăm sóc tốt nhất.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Phòng khám ENT"
              className="w-full h-[400px] object-cover rounded-xl shadow-xl"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
            <p className="text-gray-600">Năm kinh nghiệm</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
            <p className="text-gray-600">Bệnh nhân phục vụ</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
            <p className="text-gray-600">Bệnh nhân hài lòng</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
            <p className="text-gray-600">Hỗ trợ liên tục</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sứ Mệnh</h3>
            <p className="text-gray-600 leading-relaxed">
              Cung cấp dịch vụ chăm sóc sức khỏe Tai-Mũi-Họng chất lượng cao, tận tâm, với công nghệ tiên tiến.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Tầm Nhìn</h3>
            <p className="text-gray-600 leading-relaxed">
              Trở thành phòng khám Tai-Mũi-Họng hàng đầu, được bệnh nhân tin tưởng và khuyên cáo.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Giá Trị</h3>
            <p className="text-gray-600 leading-relaxed">
              Tận tâm, chuyên nghiệp, tin cậy, và luôn đặt sức khỏe bệnh nhân lên hàng đầu.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}