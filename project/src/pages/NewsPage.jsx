// src/pages/NewsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Footer from '../components/Footer';

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

  const categoryOptions = [
    { value: '', label: t('newsPage.allCategories') },
    { value: 'Công nghệ', label: t('newsPage.categories.technology') },
    { value: 'Sức khỏe', label: t('newsPage.categories.health') },
    { value: 'Điều trị', label: t('newsPage.categories.treatment') },
    { value: 'Cảnh báo', label: t('newsPage.categories.warning') },
    { value: 'Tư vấn', label: t('newsPage.categories.advice') },
  ];

  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    const map = {
      'Công Nghệ': 'technology',
      'Sức khỏe': 'health',
      'Điều Trị': 'treatment',
      'Cảnh báo': 'warning',
      'Tư Vấn': 'advice',

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
      console.log('Dữ liệu bài viết từ API:', data.content);
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
    <div className="bg-gradient-to-b from-white via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <section className="bg-gradient-to-br from-cyan-50/50 via-blue-50/40 to-emerald-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
            {t('newsPage.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            {t('newsPage.subtitle')}
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20 pt-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder={t('newsPage.searchPlaceholder')}
              className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl py-4 px-6 pl-14 shadow-lg focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 focus:border-cyan-400 dark:focus:border-cyan-500 transition-all duration-300 text-lg"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
            <Search className="absolute left-5 top-5 text-cyan-500 w-6 h-6" />
          </div>

          <select
            className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl py-4 px-6 w-full md:w-auto md:min-w-[240px] shadow-lg focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-500/30 focus:border-cyan-400 dark:focus:border-cyan-500 transition-all duration-300 text-lg font-medium"
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

          {(keyword || category) && (
            <button
              onClick={() => {
                setKeyword('');
                setCategory('');
                setPage(0);
              }}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 transform font-semibold text-lg whitespace-nowrap"
              title={t('newsPage.clearFilter')}
            >
              <X className="w-6 h-6" />
              <span className="hidden md:inline">{t('newsPage.clear')}</span>
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-20 text-xl font-medium">
              {t('newsPage.noArticles')}
            </p>
          ) : (
            news.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/news/${a.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-500 flex flex-col h-full"
              >
                <div className="relative h-56 overflow-hidden bg-cyan-50 dark:bg-gray-700">
                  <img
                    src={getImageUrl(a.image)}
                    alt={a.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-125 group-hover:rotate-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {a.category && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-white/95 dark:bg-gray-800/95 text-cyan-600 dark:text-cyan-400 shadow-xl group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:text-white group-hover:scale-125 transition-all duration-500">
                        {getCategoryLabel(a.category)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-7 flex-1 flex flex-col bg-white dark:bg-gray-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-500">
                    {a.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-lg line-clamp-3 flex-1 leading-relaxed">
                    {a.content?.replace(/<[^>]+>/g, '')}
                  </p>
                </div>

                <div className="h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3 select-none">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={t('newsPage.pagination.first')}
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={t('newsPage.pagination.previous')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-11 h-11 rounded-lg font-medium transition-all ${p === page
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
              title={t('newsPage.pagination.next')}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={t('newsPage.pagination.last')}
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}