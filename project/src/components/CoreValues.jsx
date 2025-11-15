import { Award, Microscope, Heart } from 'lucide-react';

export default function CoreValues() {
  const values = [
    {
      icon: Award,
      title: 'Đội Ngũ Chuyên Môn',
      description: 'Bác sĩ chuyên khoa I, II với nhiều năm kinh nghiệm điều trị'
    },
    {
      icon: Microscope,
      title: 'Thiết Bị Hiện Đại',
      description: 'Trang thiết bị y tế tiên tiến, công nghệ chẩn đoán và điều trị mới nhất'
    },
    {
      icon: Heart,
      title: 'Dịch Vụ Tận Tâm',
      description: 'Chăm sóc chu đáo, thân thiện, luôn đặt sức khỏe bệnh nhân lên hàng đầu'
    }
  ];

  const gradientColors = [
    'from-cyan-500 to-emerald-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
  ];

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-cyan-50 hover:to-emerald-50 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-100 hover:border-cyan-200 transform hover:-translate-y-2"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientColors[index]} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <value.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-700 transition-colors">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}