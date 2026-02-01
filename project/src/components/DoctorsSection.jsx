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
    <section id="doctors" className="py-12 bg-gradient-to-b from-white to-cyan-50/20 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        {showHeading && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('doctorsSection.title')}
            </h2>
            <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-cyan-100 dark:border-gray-700">
              <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('doctorsSection.certifiedText')}
              </span>
            </div>
          </div>
        )}

        {/* Không có dữ liệu */}
        {(!Array.isArray(data) || data.length === 0) && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            {t('doctorsSection.noDoctors')}
          </div>
        )}

        {/* Danh sách bác sĩ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.isArray(data) && data.map((doctor, i) => (
            <div
              key={`${doctor.fullName || 'doctor'}-${i}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-500 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={doctor.photoUrl || 'https://via.placeholder.com/400x300?text=Doctor'}
                  alt={doctor.fullName || t('doctorsSection.doctorAlt')}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-cyan-100 dark:bg-gray-700 backdrop-blur-sm rounded-full p-2.5 shadow-lg group-hover:bg-cyan-600 group-hover:scale-110 transition-all duration-300">
                  <Award className="w-5 h-5 text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-5 bg-white dark:bg-gray-800 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {doctor.fullName || t('doctorsSection.noName')}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">
                  {doctor.bio || '—'}
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    {typeof doctor.experienceYears === 'number' ? doctor.experienceYears : 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('doctorsSection.yearsExperience')}
                  </span>
                </div>
              </div>

              <div className="h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>

        {/* Nút Xem tất cả (chỉ hiện khi không truyền doctors từ ngoài vào) */}
        {providedCount === 0 && (
          <div className="mt-16 flex justify-center">
            <Link
              to="/doctors"
              className="group inline-flex items-center px-10 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {t('doctorsSection.viewAll')}
              <svg
                className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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