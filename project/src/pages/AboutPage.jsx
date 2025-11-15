import { Award, Users, Target, Heart, ShieldCheck, Activity } from 'lucide-react';
import Footer from '../components/Footer';

const statCards = [
  { icon: Award, label: 'Năm kinh nghiệm', value: '15+' },
  { icon: Users, label: 'Bệnh nhân phục vụ', value: '50K+' },
  { icon: Target, label: 'Tỉ lệ hài lòng', value: '98%' },
  { icon: Activity, label: 'Hỗ trợ liên tục', value: '24/7' },
];

const coreValues = [
  {
    title: 'Sứ mệnh',
    desc: 'Mang đến dịch vụ chăm sóc Tai-Mũi-Họng chuẩn quốc tế với chi phí hợp lý và trải nghiệm tận tâm.',
  },
  {
    title: 'Tầm nhìn',
    desc: 'Trở thành phòng khám thông minh dẫn đầu về công nghệ và chất lượng khám chữa ENT tại Việt Nam.',
  },
  {
    title: 'Giá trị cốt lõi',
    desc: 'Chuyên nghiệp – Minh bạch – Nhân ái. Luôn đặt sức khỏe bệnh nhân ở vị trí trung tâm.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/40 to-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 py-16 md:py-20">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-cyan-200/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-10 w-80 h-80 bg-emerald-200/30 blur-3xl rounded-full" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              15 năm dẫn đầu trong chăm sóc Tai-Mũi-Họng toàn diện
            </h1>
            <p className="text-lg text-gray-700">
              Chúng tôi kết hợp đội ngũ chuyên gia đầu ngành với hệ thống khám chữa bệnh thông minh, mang đến trải nghiệm
              chuẩn mực từ khâu tư vấn, chẩn đoán đến điều trị và theo dõi sau khám.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {statCards.slice(0, 2).map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-5 backdrop-blur-sm hover:shadow-lg transition"
                >
                  <Icon className="w-6 h-6 text-cyan-600 mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/4021808/pexels-photo-4021808.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Phòng khám thông minh"
              className="w-full h-[420px] object-cover rounded-[32px] shadow-2xl ring-4 ring-white/70"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-cyan-100 px-6 py-4 flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-emerald-600" />
              <div>
                <p className="font-semibold text-gray-900">Bộ Y Tế chứng nhận</p>
                <p className="text-sm text-gray-600">Trang thiết bị chuẩn quốc tế</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-gray-900">Chúng tôi khác biệt như thế nào?</h2>
            <p className="text-gray-700 leading-relaxed">
              Phòng khám thông minh ứng dụng nền tảng số để đồng bộ toàn bộ hành trình khám chữa bệnh. Hồ sơ, kết quả cận
              lâm sàng, kế hoạch điều trị đều được lưu trữ an toàn, giúp bác sĩ và bệnh nhân theo dõi tiến trình chỉ với
              vài thao tác.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Hệ thống quản trị lịch hẹn thời gian thực giúp giảm tối đa thời gian chờ. Bệnh nhân có thể đặt lịch online,
              nhận nhắc hẹn tự động, đồng thời nhận tư vấn hậu khám qua nền tảng chăm sóc từ xa.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {statCards.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md hover:shadow-xl transition"
              >
                <Icon className="w-7 h-7 text-cyan-600 mb-4" />
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <p className="text-sm text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {coreValues.map((value) => (
            <div
              key={value.title}
              className="rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-emerald-50 border border-cyan-100 p-8 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-700 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
