import { useEffect, useState } from 'react';
import { getDoctors } from '../api/doctorApi';
import DoctorsSection from '../components/DoctorsSection';
import Footer from '../components/Footer';

export default function DoctorsPage() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => {
    getDoctors()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setAllDoctors(arr);
        setDoctors(arr.slice(0, PAGE_SIZE));
      })
      .catch((e) => setErr(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, []);

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
    return <div className="py-20 text-center text-gray-900 dark:text-white">Đang tải bác sĩ...</div>;
  }

  if (err) {
    return <div className="py-20 text-center text-red-600">Lỗi: {err}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 -mt-4 sm:-mt-6 lg:-mt-8 pt-10 sm:pt-12 lg:pt-14 pb-10 shadow-[0_25px_50px_-25px_rgba(15,118,110,0.15)] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gặp gỡ các bác sĩ thông minh</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Danh sách được cập nhật theo thời gian thực, giúp bạn đặt lịch đúng bác sĩ chỉ với một cú click.
          </p>
        </div>
      </section>

      <DoctorsSection doctors={doctors} showHeading={false} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center pb-12 gap-3 select-none">
          <button 
            onClick={() => setPage(0)} 
            disabled={page === 0}
            className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {'<<'}
          </button>
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 0}
            className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {'<'}
          </button>
          {pageNumbers.map((p) => (
            <button 
              key={p} 
              onClick={() => setPage(p)}
              className={`w-11 h-11 rounded-lg font-medium transition-all ${
                p === page
                  ? 'bg-gray-800 dark:bg-cyan-600 text-white border-gray-800 dark:border-cyan-600 shadow-md'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p + 1}
            </button>
          ))}
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={page >= totalPages - 1}
            className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {'>'}
          </button>
          <button 
            onClick={() => setPage(totalPages - 1)} 
            disabled={page >= totalPages - 1}
            className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {'>>'}
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}