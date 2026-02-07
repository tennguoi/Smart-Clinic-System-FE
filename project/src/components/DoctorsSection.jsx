// src/components/DoctorsSection.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { getDoctors } from '../api/doctorApi';
import { useTranslation } from 'react-i18next';

export default function DoctorsSection({ doctors = [], showHeading = true }) {
  const { t } = useTranslation();
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
    <section id="doctors" className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        {showHeading && (
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('doctorsSection.title')}
            </h2>
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-white/90 to-white/80 dark:from-gray-800/90 dark:to-gray-800/80 backdrop-blur-md px-8 py-4 rounded-full shadow-xl border-2 border-cyan-200 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                {t('doctorsSection.certifiedText')}
              </span>
            </div>
            <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full mt-6"></div>
          </div>
        )}

        {/* Không có dữ liệu */}
        {(!Array.isArray(data) || data.length === 0) && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            {t('doctorsSection.noDoctors')}
          </div>
        )}

        {/* Danh sách bác sĩ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {Array.isArray(data) && data.map((doctor, i) => (
            <div
              key={`${doctor.fullName || 'doctor'}-${i}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 flex flex-col h-full cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={doctor.photoUrl || 'https://via.placeholder.com/400x300?text=Doctor'}
                  alt={doctor.fullName || t('doctorsSection.doctorAlt')}
                  className="w-full h-56 object-cover group-hover:scale-125 transition-transform duration-700"
                />
                <div className="absolute top-5 right-5 bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-gray-700 dark:to-gray-600 backdrop-blur-sm rounded-2xl p-3 shadow-xl group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                  <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                  {doctor.fullName || t('doctorsSection.noName')}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
                  {doctor.bio || '—'}
                </p>
                <div className="flex items-center space-x-3 text-base">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-lg">
                    {typeof doctor.experienceYears === 'number' ? doctor.experienceYears : 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {t('doctorsSection.yearsExperience')}
                  </span>
                </div>
              </div>

              <div className="h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Nút Xem tất cả (chỉ hiện khi không truyền doctors từ ngoài vào) */}
        {providedCount === 0 && (
          <div className="mt-20 flex justify-center">
            <Link
              to="/doctors"
              className="group inline-flex items-center px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
            >
              {t('doctorsSection.viewAll')}
              <svg
                className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        <div className="mt-12" />
      </div>
    </section>
  );
}