import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';

export default function Contact() {
  const { clinicInfo } = useClinic();

  const clinicAddress = clinicInfo?.address?.trim() || '';
  const clinicPhone = clinicInfo?.phone?.trim() || '';
  const clinicEmail = clinicInfo?.email?.trim() || '';
  const hasContactInfo = !!(clinicAddress || clinicPhone || clinicEmail);

  return (
    <section id="contact" className="py-10 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Thông Tin Liên Hệ
          </h2>
          <p className="text-lg text-gray-700">
            Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {!hasContactInfo && (
              <div className="p-4 rounded-xl border border-dashed border-gray-300 text-gray-500">
                Chưa có thông tin liên hệ. Vui lòng cập nhật tại trang quản trị.
              </div>
            )}
            {clinicAddress && (
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-cyan-50/50 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Địa Chỉ</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {clinicAddress}
                  </p>
                </div>
              </div>
            )}

            {clinicPhone && (
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-cyan-50/50 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Điện Thoại</h3>
                  <p className="text-gray-700">
                    Hotline: <a href={`tel:${clinicPhone.replace(/\s/g, '')}`} className="text-cyan-600 hover:text-emerald-600 hover:underline font-semibold">{clinicPhone}</a>
                  </p>
                </div>
              </div>
            )}

            {clinicEmail && (
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-cyan-50/50 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-700">
                    <a href={`mailto:${clinicEmail}`} className="text-cyan-600 hover:text-emerald-600 hover:underline font-semibold">
                      {clinicEmail}
                    </a>
                  </p>
                </div>
              </div>
            )}

            {(clinicInfo?.morningStartTime || clinicInfo?.afternoonStartTime) && (
              <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-cyan-50/50 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Giờ Làm Việc</h3>
                  <div className="text-gray-600 space-y-1">
                    {clinicInfo.morningStartTime && clinicInfo.morningEndTime && (
                      <p>
                        <span className="font-medium">Buổi sáng:</span> {clinicInfo.morningStartTime} - {clinicInfo.morningEndTime}
                      </p>
                    )}
                    {clinicInfo.afternoonStartTime && clinicInfo.afternoonEndTime && (
                      <p>
                        <span className="font-medium">Buổi chiều:</span> {clinicInfo.afternoonStartTime} - {clinicInfo.afternoonEndTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {clinicPhone && (
              <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 border-2 border-cyan-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-3">Hỗ Trợ Khẩn Cấp</h3>
                <p className="text-gray-700 mb-4">
                  Nếu bạn gặp tình trạng khẩn cấp, vui lòng gọi ngay:
                </p>
                <a
                  href={`tel:${clinicPhone.replace(/\s/g, '')}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform duration-300"
                >
                  <Phone className="w-5 h-5" />
                  <span>{clinicPhone}</span>
                </a>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-cyan-100/30 to-emerald-100/30 rounded-2xl overflow-hidden h-[500px] shadow-xl border-2 border-cyan-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.954387384135!2d106.69919631480082!3d10.732119192330907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbea5fe3db1%3A0xfae94aca5709003f!2sNguyen%20Van%20Linh%2C%20District%207%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1629789123456!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Map location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}