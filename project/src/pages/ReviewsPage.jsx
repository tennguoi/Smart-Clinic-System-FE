// src/pages/ReviewsPage.jsx
import { Star, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getReviews } from '../lib/api';

const SERVICES = ['Tất cả', 'Nhi khoa', 'Nha khoa', 'Nội khoa', 'Da liễu', 'Sản phụ khoa'];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service: 'Tất cả',
    search: '',
    page: 1,
    limit: 6
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviews(filters);
        setReviews(data.reviews || []);
        setStats(data.stats || { average: 0, total: 0 });
        setTotalPages(Math.ceil((data.stats?.total || 0) / filters.limit));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const anonymizeName = (name) => {
    if (!name) return 'Ẩn danh';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.charAt(0) + '***';
    const last = parts.pop();
    return parts.map(p => p.charAt(0) + '***').join(' ') + ' ' + last;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 pt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Đánh Giá Từ Bệnh Nhân
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Hàng ngàn bệnh nhân đã tin tưởng và chia sẻ trải nghiệm tại phòng khám của chúng tôi.
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-10 mb-16">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border-2 border-blue-100 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">{stats.average || '0.0'}</div>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Điểm trung bình</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border-2 border-green-100 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{stats.total || 0}</div>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Tổng đánh giá</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border-2 border-yellow-100 dark:border-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-300 transform">
            <div className="text-5xl font-bold text-yellow-500">★ ★ ★ ★ ★</div>
            <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Dựa trên phản hồi thực</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl mb-12 border-2 border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">Chọn dịch vụ</label>
              <select
                value={filters.service}
                onChange={e => setFilters(prev => ({ ...prev, service: e.target.value, page: 1 }))}
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all duration-300"
              >
                {SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-5 top-5 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, nội dung..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-14 pr-5 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 text-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 text-gray-500 dark:text-gray-400">
            <p className="text-2xl font-medium">Không tìm thấy đánh giá nào.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {reviews.map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-500 hover:-translate-y-2 hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    {r.verified && (
                      <span className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-sm px-3 py-1.5 rounded-full font-bold border border-green-200 dark:border-green-800">
                        Đã xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed text-lg">"{r.content}"</p>
                  <div className="text-base">
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{anonymizeName(r.name)}</p>
                    <p className="text-gray-500 dark:text-gray-400">{r.service} • {formatDate(r.date)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="px-6 py-3 text-lg font-bold text-gray-700 dark:text-gray-300">
                  Trang {filters.page} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}