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
    <section id="doctors" className="py-12 bg-gradient-to-b from-white to-cyan-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
              className="group bg-white rounded-xl border border-gray-200 hover:border-cyan-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={doctor.photoUrl || 'https://via.placeholder.com/400x300?text=Doctor'}
                  alt={doctor.fullName || 'Bác sĩ'}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-cyan-100 backdrop-blur-sm rounded-full p-2.5 shadow-lg group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                  <Award className="w-5 h-5 text-cyan-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-5 bg-white flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                  {doctor.fullName || 'Chưa có tên'}
                </h3>
                <p className="text-base text-gray-600 mb-3 line-clamp-2 flex-1">
                  {doctor.bio || '—'}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-cyan-600 font-semibold">
                    {typeof doctor.experienceYears === 'number' ? doctor.experienceYears : 0}
                  </span>
                  <span className="text-gray-500">năm kinh nghiệm</span>
                </div>
              </div>
              <div className="h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>

        {providedCount === 0 && (
          <div className="mt-16 flex justify-center">
            <Link
              to="/doctors"
              className="group inline-flex items-center px-10 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Xem tất cả bác sĩ
              <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        <div className="mt-12" />
      </div>
    </section>
  );
}