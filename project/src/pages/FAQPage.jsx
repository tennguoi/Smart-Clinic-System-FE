import { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState('faq-1');
  const { t, language } = useTranslation();

  const faqData = {
    vi: [
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
        answer: 'Bạn có thể đặt lịch qua: 1) Website (sử dụng form đặt lịch online), 2) Điện thoại: 0123 456 789, 3) Zalo: 0987 654 321, 4) Trực tiếp tại phòng khám. Đặt lịch trước giúp bạn không phải chờ đợi.'
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
      },
      {
        id: 'faq-7',
        category: 'Thời Gian Làm Việc',
        question: 'Phòng khám làm việc vào những giờ nào?',
        answer: 'Phòng khám làm việc từ Thứ 2 đến Chủ Nhật: Sáng: 7:00 - 12:00, Chiều: 13:00 - 17:00, Tối: 18:00 - 20:00. Phòng khám nghỉ các ngày lễ lớn. Vui lòng gọi điện trước để xác nhận.'
      },
      {
        id: 'faq-8',
        category: 'Thủ Tục',
        question: 'Thủ tục khám bệnh như thế nào?',
        answer: 'Bước 1: Đăng ký tại quầy lễ tân (mang theo CMND/CCCD, thẻ BHYT nếu có). Bước 2: Lấy số thứ tự và chờ gọi. Bước 3: Vào phòng khám theo số thứ tự. Bước 4: Bác sĩ khám và kê đơn. Bước 5: Thanh toán tại quầy và nhận toa thuốc.'
      },
      {
        id: 'faq-9',
        category: 'Bảo Hiểm',
        question: 'Bảo hiểm y tế được thanh toán như thế nào?',
        answer: 'Chúng tôi chấp nhận thẻ BHYT. Bệnh nhân chỉ cần thanh toán phần chi phí không được bảo hiểm chi trả. Tỷ lệ thanh toán tùy thuộc vào loại dịch vụ và quy định của BHYT. Vui lòng mang theo thẻ BHYT và CMND/CCCD khi đến khám.'
      },
      {
        id: 'faq-10',
        category: 'Bảo Hiểm',
        question: 'Có những loại bảo hiểm nào được chấp nhận?',
        answer: 'Chúng tôi chấp nhận: Bảo hiểm y tế (BHYT) của Bảo hiểm Xã hội Việt Nam, Bảo hiểm y tế tự nguyện, và một số bảo hiểm tư nhân. Vui lòng liên hệ trước để xác nhận loại bảo hiểm của bạn có được chấp nhận không.'
      },
      {
        id: 'faq-11',
        category: 'Thủ Tục',
        question: 'Bệnh nhân mới cần mang theo giấy tờ gì?',
        answer: 'Bệnh nhân mới cần mang theo: CMND/CCCD (bắt buộc), Thẻ BHYT (nếu có), Giấy tờ liên quan đến bệnh án cũ (nếu có), Danh sách thuốc đang sử dụng (nếu có). Lễ tân sẽ hỗ trợ tạo hồ sơ mới cho bạn.'
      },
      {
        id: 'faq-12',
        category: 'Thủ Tục',
        question: 'Bệnh nhân cũ có cần đăng ký lại không?',
        answer: 'Bệnh nhân cũ chỉ cần cung cấp số điện thoại hoặc tên để lễ tân tra cứu hồ sơ. Sau đó sẽ được cấp số thứ tự khám. Không cần đăng ký lại từ đầu.'
      }
    ],
    en: [
      {
        id: 'faq-1',
        category: 'Medical Examination',
        question: 'How long does an examination take?',
        answer: 'Examination time is usually 30-45 minutes depending on the patient\'s condition. General examination takes 30 minutes, endoscopic examination takes 20-25 minutes. We strive for thorough examination for accurate diagnosis.'
      },
      {
        id: 'faq-2',
        category: 'Medical Examination',
        question: 'What preparation is needed before the examination?',
        answer: 'You should prepare: Bring your health insurance card (if any), medical history information, list of current medications. No fasting required before examination. Please arrive 10-15 minutes early to complete procedures.'
      },
      {
        id: 'faq-3',
        category: 'Medical Examination',
        question: 'Does the clinic accept health insurance?',
        answer: 'Yes, we are a qualified medical facility that accepts health insurance. You need to bring your health insurance card and ID/Citizen ID. We can assist with paperwork processing.'
      },
      {
        id: 'faq-4',
        category: 'Appointment',
        question: 'How to book an appointment?',
        answer: 'You can book an appointment via: 1) Website (using online booking form), 2) Phone: 0123 456 789, 3) Zalo: 0987 654 321, 4) Directly at the clinic. Booking in advance helps you avoid waiting.'
      },
      {
        id: 'faq-5',
        category: 'Appointment',
        question: 'Can I change my appointment?',
        answer: 'Yes, you can change or cancel your appointment 2 hours in advance. Please contact the clinic as early as possible to avoid affecting other patients.'
      },
      {
        id: 'faq-6',
        category: 'Pricing',
        question: 'Why do prices vary by service?',
        answer: 'Prices vary depending on the type of service, examination time, equipment used, and doctor\'s expertise.'
      }
    ]
  };

  const faqs = faqData[language] || faqData.vi;

  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('faq.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('faq.subtitle')}
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
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📞</div>
            <h3 className="font-bold text-gray-900 mb-2">{t('faq.callPhone')}</h3>
            <p className="text-gray-600 mb-4">{t('faq.callNow')}</p>
            <a href="tel:0123456789" className="text-blue-600 font-semibold hover:underline">
              0123 456 789
            </a>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-gray-900 mb-2">{t('faq.zalo')}</h3>
            <p className="text-gray-600 mb-4">{t('faq.chatZalo')}</p>
            <a href="tel:0987654321" className="text-blue-600 font-semibold hover:underline">
              0987 654 321
            </a>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="font-bold text-gray-900 mb-2">{t('faq.email')}</h3>
            <p className="text-gray-600 mb-4">{t('faq.sendEmail')}</p>
            <a href="mailto:contact@entclinic.vn" className="text-blue-600 font-semibold hover:underline">
              contact@entclinic.vn
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">{t('faq.stillNeedHelp')}</h2>
          <p className="mb-6 text-blue-100">
            {t('faq.supportTeam')}
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            {t('faq.contactNow')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}