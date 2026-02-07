// src/pages/DoctorsPage.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDoctors } from '../api/doctorApi';
import DoctorsSection from '../components/DoctorsSection';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function DoctorsPage() {
  const { t } = useTranslation();

  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => {
    getDoctors()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setAllDoctors(arr);
        setDoctors(arr.slice(0, PAGE_SIZE));
      })
      .catch((e) => {
        console.error(e);
        setError(t('doctorsPage.error'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    const start = page * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setDoctors(allDoctors.slice(start, end));
  }, [page, allDoctors]);

  const totalPages = Math.ceil(allDoctors.length / PAGE_SIZE);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (page <= 2) {
        pages.push(0, 1, 2, 3, 4);
      } else if (page >= totalPages - 3) {
        for (let i = totalPages - 5; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(page - 2, page - 1, page, page + 1, page + 2);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
          {t('doctorsPage.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-32 text-center">
        <p className="text-2xl text-red-600 dark:text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <section className="bg-gradient-to-br from-cyan-50/50 via-blue-50/40 to-emerald-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 -mt-4 sm:-mt-6 lg:-mt-8 pt-16 sm:pt-20 lg:pt-24 pb-16 shadow-[0_30px_60px_-30px_rgba(15,118,110,0.2)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
            {t('doctorsPage.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            {t('doctorsPage.subtitle')}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full"></div>
        </div>
      </section>

      <DoctorsSection doctors={doctors} showHeading={false} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center py-16 gap-4 select-none">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent dark:hover:bg-gradient-to-r disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
            title={t('doctorsPage.pagination.first')}
          >
            <ChevronsLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent dark:hover:bg-gradient-to-r disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
            title={t('doctorsPage.pagination.previous')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl ${
                p === page
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-2 border-transparent shadow-cyan-500/50 scale-110'
                  : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-cyan-400 dark:hover:border-cyan-500'
              }`}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent dark:hover:bg-gradient-to-r disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
            title={t('doctorsPage.pagination.next')}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-transparent dark:hover:bg-gradient-to-r disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 shadow-md hover:shadow-xl"
            title={t('doctorsPage.pagination.last')}
          >
            <ChevronsRight className="w-6 h-6" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}