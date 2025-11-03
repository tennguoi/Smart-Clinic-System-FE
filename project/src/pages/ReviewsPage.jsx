import { Star } from 'lucide-react';
import Footer from '../components/Footer';

export default function ReviewsPage() {
  const reviews = [
    {
      id: '1',
      name: 'Chị Nguyễn Mai',
      title: 'Khách hàng',
      rating: 5,
      date: '15 Tháng 10, 2024',
      content: 'Bác sĩ tận tâm, nhiệt tình, khám rất kỹ. Phòng khám sạch sẽ, thiết bị hiện đại. Tôi rất hài lòng với dịch vụ. Sẽ quay lại lần tới!'
    },
    {
      id: '2',
      name: 'Anh Trần Văn B',
      title: 'Khách hàng',
      rating: 5,
      date: '12 Tháng 10, 2024',
      content: 'Đặt lịch online rất tiện, không phải chờ lâu. Bác sĩ tư vấn chi tiết, giải thích dễ hiểu. Giá cả hợp lý. Rất đáng giá!'
    },
    {
      id: '3',
      name: 'Chị Lê Thị C',
      title: 'Khách hàng',
      rating: 5,
      date: '10 Tháng 10, 2024',
      content: 'Phòng khám đẹp, nhân viên thân thiện. Con tôi bị viêm amidan, sau khi điều trị đã khỏe hẳn. Cảm ơn bác sĩ nhiều!'
    },
    {
      id: '4',
      name: 'Anh Phạm Minh D',
      title: 'Khách hàng',
      rating: 5,
      date: '8 Tháng 10, 2024',
      content: 'Bị ù tai suốt mấy năm, đã khám ở nhiều nơi nhưng không khỏi. Ở đây bác sĩ tìm ra nguyên nhân và chỉ định điều trị đúng. Giờ đã cảm thấy tốt hơn nhiều.'
    },
    {
      id: '5',
      name: 'Chị Hoàng Linh E',
      title: 'Khách hàng',
      rating: 5,
      date: '5 Tháng 10, 2024',
      content: 'Khám rất chuyên nghiệp, bác sĩ giải thích rõ tình trạng bệnh và cách điều trị. Tôi cảm thấy yên tâm và tin tưởng. Khuyên các bạn nên khám ở đây!'
    },
    {
      id: '6',
      name: 'Anh Ngô Hữu F',
      title: 'Khách hàng',
      rating: 5,
      date: '2 Tháng 10, 2024',
      content: 'Chảy máu cam suốt. Đến đây bác sĩ xử lý cầm máu rất nhanh và hiệu quả. Không đau, không khó chịu. Giá cả công bằng. Rất hài lòng!'
    }
  ];

  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Đánh Giá Từ Bệnh Nhân
            </h1>
            <p className="text-xl text-gray-600">
              Nghe những câu chuyện thực tế từ bệnh nhân đã trải nghiệm dịch vụ của chúng tôi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.title}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1 mb-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{review.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bạn Có Kinh Nghiệm Tốt Với Phòng Khám Của Chúng Tôi?
            </h2>
            <p className="text-gray-600 mb-6">
              Chia sẻ đánh giá của bạn giúp chúng tôi cải thiện dịch vụ và hỗ trợ bệnh nhân khác
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Để Lại Đánh Giá Của Bạn
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}