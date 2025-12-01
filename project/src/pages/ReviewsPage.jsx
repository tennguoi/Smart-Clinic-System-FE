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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Đánh Giá Từ Bệnh Nhân
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hàng ngàn bệnh nhân đã tin tưởng và chia sẻ trải nghiệm tại phòng khám của chúng tôi.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
            <div className="text-4xl font-bold text-blue-600">{stats.average || '0.0'}</div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Điểm trung bình</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
            <div className="text-4xl font-bold text-green-600">{stats.total || 0}</div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Tổng đánh giá</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
            <div className="text-4xl font-bold text-yellow-500">★ ★ ★ ★ ★</div>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Dựa trên phản hồi thực</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chọn dịch vụ</label>
              <select
                value={filters.service}
                onChange={e => setFilters(prev => ({ ...prev, service: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SERVICES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, nội dung..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <p className="text-xl">Không tìm thấy đánh giá nào.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reviews.map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    {r.verified && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-medium">
                        Đã xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic leading-relaxed">"{r.content}"</p>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">{anonymizeName(r.name)}</p>
                    <p className="text-gray-500 dark:text-gray-400">{r.service} • {formatDate(r.date)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trang {filters.page} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}