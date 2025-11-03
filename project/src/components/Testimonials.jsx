import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: '1',
      name: 'Chị Nguyễn Mai',
      content: 'Bác sĩ tận tâm, nhiệt tình, khám rất kỹ. Phòng khám sạch sẽ, thiết bị hiện đại. Tôi rất hài lòng với dịch vụ.',
      rating: 5,
      date: '2 tuần trước'
    },
    {
      id: '2',
      name: 'Anh Trần Văn B',
      content: 'Đặt lịch online rất tiện, không phải chờ lâu. Bác sĩ tư vấn chi tiết, giải thích dễ hiểu. Giá cả hợp lý.',
      rating: 5,
      date: '1 tháng trước'
    },
    {
      id: '3',
      name: 'Chị Lê Thị C',
      content: 'Phòng khám đẹp, nhân viên thân thiện. Con tôi bị viêm amidan, sau khi điều trị đã khỏe hẳn. Cảm ơn bác sĩ nhiều!',
      rating: 5,
      date: '3 tuần trước'
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Đánh Giá Khách Hàng
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Bệnh Nhân Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hơn 50,000 bệnh nhân đã tin tưởng và hài lòng với dịch vụ của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.date}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-8 bg-white rounded-lg shadow-md px-8 py-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.9/5</div>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">2,847 đánh giá</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-gray-600 mt-1">Khuyến nghị</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}