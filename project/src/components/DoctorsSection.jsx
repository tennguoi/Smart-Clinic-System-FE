// src/components/DoctorsSection.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { getDoctors } from '../api/doctorApi';

export default function DoctorsSection({ doctors = [], showHeading = true }) {
  const [internalDoctors, setInternalDoctors] = useState(null);

  const providedCount = Array.isArray(doctors) ? doctors.length : 0;
  const data = providedCount > 0 ? doctors : (Array.isArray(internalDoctors) ? internalDoctors : []);

  useEffect(() => {
    if (providedCount === 0) {
      getDoctors()
        .then((arr) => {
          setInternalDoctors(Array.isArray(arr) ? arr : []);
        })
        .catch(() => setInternalDoctors([]));
    }
  }, [providedCount]);

  return (
    <section id="doctors" className="py-3 md:py-6 bg-gradient-to-b from-white to-cyan-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bác Sĩ Chuyên Khoa Hàng Đầu
            </h2>
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-cyan-100">
              <Award className="w-5 h-5 text-cyan-600" />
              <span className="text-sm text-gray-700">
                Tất cả bác sĩ đều được Bộ Y Tế chứng nhận và có chứng chỉ hành nghề hợp lệ
              </span>
            </div>
          </div>
        )}

        {(!Array.isArray(data) || data.length === 0) && (
          <div className="text-center text-gray-500 py-12">Không có bác sĩ nào để hiển thị.</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.isArray(data) && data.map((doctor, i) => (
            <div
              key={`${doctor.fullName || 'doctor'}-${i}`}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={doctor.photoUrl || 'https://via.placeholder.com/400x300?text=Doctor'}
                  alt={doctor.fullName || 'Bác sĩ'}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-br from-cyan-500 to-emerald-500 backdrop-blur-sm rounded-full p-2.5 shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                  {doctor.fullName || 'Chưa có tên'}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {doctor.bio || '—'}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-cyan-600 font-semibold">
                    {typeof doctor.experienceYears === 'number' ? doctor.experienceYears : 0}
                  </span>
                  <span className="text-gray-500">năm kinh nghiệm</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {providedCount === 0 && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/doctors"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-full font-semibold hover:from-cyan-600 hover:to-emerald-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105 duration-300"
            >
              Xem tất cả bác sĩ
            </Link>
          </div>
        )}

        <div className="mt-12" />
      </div>
    </section>
  );
}