// src/pages/NewsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/400x200?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
  return `${baseURL}${imageUrl}`;
};

export default function NewsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 6;

  // Danh mục song ngữ – value là tiếng Việt (vì backend lưu tiếng Việt)
  const categoryOptions = [
    { value: '', label: t('newsPage.allCategories') },
    { value: 'Công nghệ', label: t('newsPage.categories.technology') },
    { value: 'Sức khỏe', label: t('newsPage.categories.health') },
    { value: 'Điều trị', label: t('newsPage.categories.treatment') },
    { value: 'Cảnh báo', label: t('newsPage.categories.warning') },
    { value: 'Tư vấn', label: t('newsPage.categories.advice') },
  ];

  // Helper để hiển thị tên danh mục đúng ngôn ngữ hiện tại
  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    const map = {
      'Công nghệ': 'technology',
      'Sức khỏe': 'health',
      'Điều trị': 'treatment',
      'Cảnh báo': 'warning',
      'Tư vấn': 'advice',
    };
    const key = map[cat];
    return key ? t(`newsPage.categories.${key}`) : cat;
  };

  const loadArticles = async () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    let url = `${baseURL}/api/public/articles?page=${page}&size=${PAGE_SIZE}`;

    if (keyword.trim() && category) {
      url = `${baseURL}/api/public/articles/search?title=${encodeURIComponent(keyword.trim())}&page=${page}&size=${PAGE_SIZE}`;
    } else if (keyword.trim()) {
      url = `${baseURL}/api/public/articles/search?title=${encodeURIComponent(keyword.trim())}&page=${page}&size=${PAGE_SIZE}`;
    } else if (category) {
      url = `${baseURL}/api/public/articles/category/${encodeURIComponent(category)}?page=${page}&size=${PAGE_SIZE}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Load failed');
      const data = await response.json();

      let articles = data.content || [];

      if (keyword.trim() && category) {
        articles = articles.filter(a =>
          a.category && a.category.toLowerCase().includes(category.toLowerCase())
        );
        const totalAfterFilter = Math.ceil(articles.length / PAGE_SIZE);
        setTotalPages(totalAfterFilter || 1);
      } else {
        setTotalPages(data.totalPages || 1);
      }

      setNews(articles);

      if (page !== 0 && articles.length === 0) {
        setPage(0);
      }
    } catch (error) {
      console.error(error);
      setNews([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [page, category, keyword]);

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages - 1, start + 5);
    if (end - start + 1 < 6) {
      start = Math.max(0, end - 5);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {t('newsPage.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('newsPage.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder={t('newsPage.searchPlaceholder')}
              className="w-full border border-gray-200 rounded-xl py-3 px-4 pl-11 shadow-sm focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 h-12"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
            <Search className="absolute left-3 top-3.5 text-cyan-500 w-5 h-5" />
          </div>

          {/* Dropdown danh mục - đã song ngữ */}
          <select
            className="border border-gray-200 rounded-xl py-3 px-4 w-full md:w-auto md:min-w-[220px] shadow-sm focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 h-12"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Clear Filter Button */}
          {(keyword || category) && (
            <button
              onClick={() => {
                setKeyword('');
                setCategory('');
                setPage(0);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-sm transition-all h-12 whitespace-nowrap"
              title={t('newsPage.clearFilter')}
            >
              <X className="w-5 h-5" />
              <span className="hidden md:inline">{t('newsPage.clear')}</span>
            </button>
          )}
        </div>

        {/* News List */}
        <div className="grid md:grid-cols-3 gap-6">
          {news.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500 py-16 text-lg">
              {t('newsPage.noArticles')}
            </p>
          ) : (
            news.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/news/${a.id}`)}
                className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-cyan-200 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-cyan-50">
                  <img
                    src={getImageUrl(a.image)}
                    alt={a.title}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Category Badge - đã song ngữ */}
                  {a.category && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-cyan-600 shadow-md group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                        {getCategoryLabel(a.category)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 leading-tight group-hover:text-cyan-600 transition-colors duration-300">
                    {a.title}
                  </h2>
                  <p className="text-gray-600 text-base line-clamp-3 flex-1">
                    {a.content}
                  </p>
                </div>

                {/* Accent Line */}
                <div className="h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3 select-none">
            <button onClick={() => setPage(0)} disabled={page === 0} className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title={t('newsPage.pagination.first')}>
              <ChevronsLeft className="w-5 h-5" />
            </button>

            <button onClick={() => setPage(page - 1)} disabled={page === 0} className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title={t('newsPage.pagination.previous')}>
              <ChevronLeft className="w-5 h-5" />
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

            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title={t('newsPage.pagination.next')}>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="w-11 h-11 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title={t('newsPage.pagination.last')}>
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}