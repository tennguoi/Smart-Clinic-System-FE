// src/pages/DoctorsPage.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDoctors } from '../api/doctorApi';
import DoctorsSection from '../components/DoctorsSection';
import Footer from '../components/Footer';

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
        <p className="mt-6 text-xl text-gray-600">{t('doctorsPage.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-32 text-center">
        <p className="text-2xl text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 -mt-4 sm:-mt-6 lg:-mt-8 pt-10 sm:pt-12 lg:pt-14 pb-10 shadow-[0_25px_50px_-25px_rgba(15,118,110,0.15)]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t('doctorsPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('doctorsPage.subtitle')}
          </p>
        </div>
      </section>

      {/* Danh sách bác sĩ */}
      <DoctorsSection doctors={doctors} showHeading={false} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center py-12 gap-3 select-none">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title={t('doctorsPage.pagination.first')}
          >
            First
          </button>

          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-11 h-11 rounded-lg font-medium transition-all ${
                p === page
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>

          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title={t('doctorsPage.pagination.last')}
          >
            Last
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}