import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Footer from '../components/Footer';

const categories = ['', 'Công nghệ', 'Sức khỏe', 'Điều trị', 'Cảnh báo', 'Tư vấn'];

// Hàm tạo URL đầy đủ cho ảnh
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/400x200?text=No+Image';
  
  // Nếu đã là URL đầy đủ (http/https) thì return luôn
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu là relative URL thì thêm base URL
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
  return `${baseURL}${imageUrl}`;
};

export default function NewsPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 6;

  const loadArticles = async () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
    let url = `${baseURL}/api/public/articles?page=${page}&size=${PAGE_SIZE}`;

    if (keyword.trim() && category) {
      url = `${baseURL}/api/public/articles/search?title=${encodeURIComponent(keyword.trim())}&page=${page}&size=${PAGE_SIZE}`;
    }
    // Chỉ có từ khóa → tìm toàn bộ
    else if (keyword.trim()) {
      url = `${baseURL}/api/public/articles/search?title=${encodeURIComponent(keyword.trim())}&page=${page}&size=${PAGE_SIZE}`;
    }
    // Chỉ có chuyên mục
    else if (category) {
      url = `${baseURL}/api/public/articles/category/${encodeURIComponent(category)}?page=${page}&size=${PAGE_SIZE}`;
    }
    // Không có gì → tất cả

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Load failed');
      const data = await response.json();

      let articles = data.content || [];

      // ===> ĐIỀU CHỈNH CUỐI CÙNG Ở FRONTEND ĐỂ KẾT HỢP HOÀN HẢO <===
      if (keyword.trim() && category) {
        // Lọc thêm theo category nếu đang vừa tìm + vừa chọn chuyên mục
        articles = articles.filter(a => 
          a.category && a.category.toLowerCase().includes(category.toLowerCase())
        );
        // Tính lại totalPages vì đã lọc ở frontend
        const totalAfterFilter = Math.ceil(articles.length / PAGE_SIZE);
        setTotalPages(totalAfterFilter || 1);
      } else {
        setTotalPages(data.totalPages || 1);
      }

      setNews(articles);

      // Nếu đang ở trang cao mà không còn bài → tự động về trang 1
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

  // Giữ nguyên phần getPageNumbers của bạn
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
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Bản tin sức khỏe cập nhật mỗi ngày</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Theo dõi thông tin mới nhất về công nghệ, điều trị và chăm sóc sức khỏe Tai-Mũi-Họng.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 pl-11 shadow-sm focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500 focus:border-cyan-400 dark:focus:border-cyan-500 h-12"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
            />
            <Search className="absolute left-3 top-3.5 text-cyan-500 w-5 h-5" />
          </div>
          <select
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 w-full md:w-auto md:min-w-[220px] shadow-sm focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-500 focus:border-cyan-400 dark:focus:border-cyan-500 h-12"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat || 'Tất cả chuyên mục'}
              </option>
            ))}
          </select>
          
          {/* Nút xóa lọc */}
          {(keyword || category) && (
            <button
              onClick={() => {
                setKeyword('');
                setCategory('');
                setPage(0);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-sm transition-all h-12 whitespace-nowrap"
              title="Xóa bộ lọc"
            >
              <X className="w-5 h-5" />
              <span className="hidden md:inline">Xóa lọc</span>
            </button>
          )}
        </div>

        {/* LIST NEWS */}
        <div className="grid md:grid-cols-3 gap-6">
          {news.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-16">Không có bài viết nào.</p>
          ) : (
            news.map((a, index) => (
              <div
                key={a.id}
                onClick={() => navigate(`/news/${a.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-cyan-200 dark:hover:border-cyan-500 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-cyan-50 dark:bg-gray-700">
                  <img
                    src={getImageUrl(a.image)}
                    alt={a.title}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Nếu ảnh load lỗi, hiển thị placeholder
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                    loading="lazy"
                  />
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge */}
                  {a.category && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-800/90 text-cyan-600 dark:text-cyan-400 shadow-md group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                        {a.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-3 leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                    {a.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-base line-clamp-3 flex-1">
                    {a.content}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))
          )}
        </div>

        {/* PHÂN TRANG MỚI - ĐẸP NHƯ ẢNH */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3 select-none">
            <button onClick={() => setPage(0)} disabled={page === 0}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {'<<'}
            </button>
            <button onClick={() => setPage(page - 1)} disabled={page === 0}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {'<'}
            </button>
            {pageNumbers.map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-11 h-11 rounded-lg font-medium transition-all ${
                  p === page
                    ? 'bg-gray-800 text-white border-gray-800 shadow-md dark:bg-cyan-600 dark:border-cyan-600'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {p + 1}
              </button>
            ))}
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {'>'}
            </button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
              className="w-11 h-11 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {'>>'}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}