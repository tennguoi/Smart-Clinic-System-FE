import { Calendar, User, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

export default function NewsPage() {
  const news = [
    {
      id: '1',
      title: 'Công Nghệ Nội Soi Mới: Chẩn Đoán Chính Xác Hơn',
      excerpt: 'Phòng khám đã trang bị thiết bị nội soi 4K mới nhất, giúp chẩn đoán các bệnh lý Tai-Mũi-Họng với độ chính xác cao hơn 99%.',
      content: 'Phòng khám ENT tự hào công bố việc trang bị thiết bị nội soi 4K được nhập khẩu từ Nhật Bản. Công nghệ này cho phép bác sĩ quan sát chi tiết các cấu trúc bên trong tai, mũi và họng với độ phóng đại 40x, giúp phát hiện sớm các bệnh lý.',
      image: 'https://images.pexels.com/photos/3861457/pexels-photo-3861457.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: 'BS. Nguyễn Văn A',
      date: '15 Tháng 10, 2024'
    },
    {
      id: '2',
      title: 'Lợi Ích Của Nội Soi Tai Mũi Họng Định Kỳ',
      excerpt: 'Khám nội soi định kỳ giúp phát hiện sớm các bệnh lý và ngăn chặn biến chứng nguy hiểm.',
      content: 'Việc khám nội soi định kỳ có nhiều lợi ích quan trọng: phát hiện sớm viêm mũi xoang, polyp, ù tai, giảm thính lực... Các chuyên gia khuyến cáo nên khám ít nhất 1 lần mỗi năm để bảo vệ sức khỏe.',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: 'BS. Trần Thị B',
      date: '8 Tháng 10, 2024'
    },
    {
      id: '3',
      title: 'Phương Pháp Điều Trị Viêm Xoang Hiệu Quả',
      excerpt: 'Khám phá những phương pháp điều trị viêm xoang mới giúp bệnh nhân nhanh chóng hồi phục.',
      content: 'Viêm xoang là bệnh phổ biến ảnh hưởng đến chất lượng sống. Phòng khám ENT áp dụng nhiều phương pháp điều trị hiệu quả: thuốc, nội soi, kỹ thuật rửa xoang... Bác sĩ sẽ lựa chọn phương pháp phù hợp với tình trạng từng bệnh nhân.',
      image: 'https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: 'BS. Lê Văn C',
      date: '1 Tháng 10, 2024'
    }
  ];

  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tin Tức & Cập Nhật
            </h1>
            <p className="text-xl text-gray-600">
              Cập nhật kiến thức y khoa và thông tin mới nhất từ phòng khám
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8">
          {news.map((article, index) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              {index === 0 ? (
                <>
                  <div className="relative h-96">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                      <p className="mb-4 leading-relaxed">{article.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{article.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:grid md:grid-cols-4 gap-6 items-center p-8">
                  <div className="h-48 md:h-56 rounded-lg overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="col-span-3 mt-4 md:mt-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{article.date}</span>
                        </div>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium">
                        <span>Đọc Thêm</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}