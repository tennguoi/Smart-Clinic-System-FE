// src/components/DoctorsSection.jsx
import { doctors } from '../data/doctors';
import { Award } from 'lucide-react';

export default function DoctorsSection() {
  return (
    <section id="doctors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Đội Ngũ Chuyên Gia
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Bác Sĩ Chuyên Khoa Hàng Đầu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với nghề, luôn cập nhật kiến thức y khoa mới nhất
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.userId}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={doctor.photoUrl}
                  alt={doctor.fullName}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {doctor.fullName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {doctor.bio}
                </p>
                <p className="text-sm text-gray-500">
                  {doctor.experienceYears} năm kinh nghiệm
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm">
              Tất cả bác sĩ đều được Bộ Y Tế chứng nhận và có chứng chỉ hành nghề hợp lệ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}