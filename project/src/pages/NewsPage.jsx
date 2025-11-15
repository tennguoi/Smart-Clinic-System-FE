import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Footer from '../components/Footer';

const categories = ['', 'Công nghệ', 'Sức khỏe', 'Điều trị', 'Cảnh báo', 'Tư vấn'];

export default function NewsPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const loadArticles = async () => {
    let url = `http://localhost:8082/api/public/articles?page=${page}&size=6`;
    if (category) {
      url = `http://localhost:8082/api/public/articles/category/${encodeURIComponent(category)}`;
    }
    if (keyword) {
      url = `http://localhost:8082/api/public/articles/search?title=${encodeURIComponent(keyword)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to load articles (${response.status})`);
      }
      const data = await response.json();
      setNews(data.content ? data.content : data);
    } catch (error) {
      console.error('Error loading articles:', error);
      setNews([]);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [category, keyword, page]);

  return (
    <div className="bg-gradient-to-b from-white via-cyan-50/30 to-white min-h-screen">
      <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex px-4 py-1.5 rounded-full bg-white shadow text-sm font-semibold text-cyan-700">
            Tin tức y khoa
          </span>
          <h1 className="text-4xl font-bold text-gray-900">Bản tin sức khỏe cập nhật mỗi ngày</h1>
          <p className="text-gray-600 text-lg">
            Theo dõi thông tin mới nhất về công nghệ, điều trị và chăm sóc sức khỏe Tai-Mũi-Họng.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              className="w-full border border-gray-200 rounded-xl py-3 px-4 pl-11 shadow-sm focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 h-12"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-cyan-500 w-5 h-5" />
          </div>

          <select
            className="border border-gray-200 rounded-xl py-3 px-4 w-full md:w-auto md:min-w-[220px] shadow-sm focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 h-12"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat ? cat : 'Tất cả chuyên mục'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {news.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition transform hover:-translate-y-1"
            >
              <img
                src={a.image || 'https://via.placeholder.com/400x200'}
                alt={a.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-6 text-left space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{a.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">{a.content}</p>
                <button
                  onClick={() => navigate(`/news/${a.id}`)}
                  className="text-cyan-600 hover:text-emerald-600 font-semibold inline-flex items-center gap-1"
                >
                  Đọc thêm →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10 space-x-3">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-xl hover:bg-white transition disabled:opacity-40"
          >
            Trang trước
          </button>

          <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded-xl hover:bg-white transition">
            Trang sau
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
