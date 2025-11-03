import { Award, Stethoscope } from 'lucide-react';
import { doctors } from '../data/doctors';
import Footer from '../components/Footer';

export default function DoctorsPage() {
  return (
    <div className="pt-20">
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Đội Ngũ Bác Sĩ Chuyên Khoa
            </h1>
            <p className="text-xl text-gray-600">
              Các bác sĩ giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="relative overflow-hidden h-80">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {doctor.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-2">
                  {doctor.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {doctor.specialty}
                </p>
                <p className="text-sm text-gray-500 flex items-center space-x-1">
                  <Stethoscope className="w-4 h-4" />
                  <span>{doctor.experience}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
          <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Chứng Nhận & Năng Lực
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Tất cả bác sĩ đều được Bộ Y Tế chứng nhận, có chứng chỉ hành nghề hợp lệ và được đào tạo liên tục theo các phương pháp điều trị mới nhất.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}