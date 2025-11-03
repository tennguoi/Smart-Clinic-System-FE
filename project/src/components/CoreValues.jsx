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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
                <value.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
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