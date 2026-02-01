import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState('faq-1');
  const { clinicInfo } = useClinic();

  const clinicPhone = clinicInfo?.phone?.trim() || '';
  const clinicEmail = clinicInfo?.email?.trim() || '';
  const bookingChannels = [
    'Website (sử dụng form đặt lịch online)',
    clinicPhone ? `Điện thoại: ${clinicPhone}` : null,
    clinicEmail ? `Email: ${clinicEmail}` : null,
    'Trực tiếp tại phòng khám.'
  ].filter(Boolean);
  const bookingAnswer = bookingChannels.length
    ? `Bạn có thể đặt lịch qua: ${bookingChannels
        .map((channel, index) => `${index + 1}) ${channel}`)
        .join(', ')}`
    : 'Bạn có thể đặt lịch trực tuyến hoặc trực tiếp tại phòng khám.';

  const faqs = [
    {
      id: 'faq-1',
      category: 'Khám Bệnh',
      question: 'Thời gian khám bao lâu?',
      answer: 'Thời gian khám thường từ 30-45 phút tùy vào tình trạng bệnh nhân. Khám ngoài 30 phút, khám nội soi 20-25 phút. Chúng tôi cố gắng khám chi tiết để chẩn đoán chính xác.'
    },
    {
      id: 'faq-2',
      category: 'Khám Bệnh',
      question: 'Có cần chuẩn bị gì trước khi khám?',
      answer: 'Bạn nên chuẩn bị: Mang theo bảo hiểm y tế (nếu có), thông tin lịch sử bệnh, danh sách thuốc đang dùng. Không cần nhịn ăn trước khám. Hãy đến sớm 10-15 phút để hoàn thành thủ tục.'
    },
    {
      id: 'faq-3',
      category: 'Khám Bệnh',
      question: 'Phòng khám có tiếp nhận bảo hiểm y tế không?',
      answer: 'Có, chúng tôi là cơ sở khám chữa bệnh đạt tiêu chuẩn bảo hiểm y tế. Bạn cần mang theo thẻ bảo hiểm y tế và CMND/CCCD. Chúng tôi có thể hỗ trợ xử lý giấy tờ.'
    },
    {
      id: 'faq-4',
      category: 'Đặt Lịch',
      question: 'Làm thế nào để đặt lịch khám?',
      answer: `${bookingAnswer} Đặt lịch trước giúp bạn không phải chờ đợi.`
    },
    {
      id: 'faq-5',
      category: 'Đặt Lịch',
      question: 'Có thể thay đổi lịch khám không?',
      answer: 'Có, bạn có thể thay đổi hoặc hủy lịch khám trước 2 tiếng. Vui lòng liên hệ phòng khám sớm nhất để tránh ảnh hưởng đến các bệnh nhân khác.'
    },
    {
      id: 'faq-6',
      category: 'Giá Cả',
      question: 'Tại sao giá khác nhau tùy từng dịch vụ?',
      answer: 'Giá khác nhau tùy vào loại dịch vụ, thời gian khám, thiết bị sử dụng, và chuyên môn của bác sĩ.'
    }
  ];

  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Câu Hỏi Thường Gặp
            </h1>
            <p className="text-xl text-gray-600">
              Những thông tin hữu ích để giải đáp thắc mắc của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-6 mb-20">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <div>
                  <span className="text-blue-600 font-semibold text-sm">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    expandedId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedId === faq.id && (
                <div className="p-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {clinicPhone && (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-bold text-gray-900 mb-2">Gọi Điện</h3>
              <p className="text-gray-600 mb-4">Gọi ngay để được tư vấn</p>
              <a href={`tel:${clinicPhone.replace(/\s/g, '')}`} className="text-blue-600 font-semibold hover:underline">
                {clinicPhone}
              </a>
            </div>
          )}
          {clinicInfo?.website && (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-gray-900 mb-2">Website</h3>
              <p className="text-gray-600 mb-4">Truy cập website của chúng tôi</p>
              <a 
                href={clinicInfo.website.startsWith('http') ? clinicInfo.website : `https://${clinicInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold hover:underline"
              >
                {clinicInfo.website}
              </a>
            </div>
          )}
          {clinicEmail && (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Gửi email cho chúng tôi</p>
              <a href={`mailto:${clinicEmail}`} className="text-blue-600 font-semibold hover:underline">
                {clinicEmail}
              </a>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Vẫn Cần Hỗ Trợ?</h2>
          <p className="mb-6 text-blue-100">
            Đội ngũ hỗ trợ khách hàng của chúng tôi sẵn sàng giúp bạn 24/7
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            Liên Hệ Ngay
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}