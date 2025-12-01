// src/pages/ReviewsPage.jsx
import { Star, Search, Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// API gọi tới backend Spring Boot (public)
const api = {
  getReviews: async ({ page = 1, limit = 6, search = '' }) => {
    const params = new URLSearchParams({
      page: page - 1,
      size: limit,
      ...(search && { search })
    });

    const res = await fetch(`http://localhost:8082/api/admin/reviews?${params}`);
    if (!res.ok) throw new Error("Lỗi tải đánh giá");
    return res.json();
  },

  getSummary: async () => {
    const res = await fetch("http://localhost:8082/api/admin/reviews");
    if (!res.ok) return { averageRating: 0, totalReviews: 0 };
    const page = await res.json();
    return {
      averageRating: page.totalElements > 0 ? 
        page.content.reduce((sum, r) => sum + r.rating, 0) / page.totalElements : 0,
      totalReviews: page.totalElements
    };
  }
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Load dữ liệu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load danh sách
        const data = await api.getReviews({ page, limit: 6, search });
        setReviews(data.content || []);
        setTotalPages(data.totalPages || 1);

        // Load thống kê (nếu chưa có thì tính từ page hiện tại)
        if (page === 1) {
          const summary = await api.getSummary();
          setStats(summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, search]);

  // Ẩn tên thật (chỉ hiện tên đầu + ***)
  const anonymizeName = (name) => {
    if (!name) return "Khách hàng";
    const parts = name.trim().split(" ");
    if (parts.length <= 1) return name.charAt(0) + "***";
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first} ${"*".repeat(last.length > 3 ? last.length - 2 : 1)}${last.slice(-2)}`;
  };

  // Format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Render sao
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Đánh Giá Từ Hàng Ngàn Bệnh Nhân
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cảm ơn bạn đã tin tưởng đồng hành cùng chúng tôi. Mỗi đánh giá là động lực để chúng tôi tốt hơn mỗi ngày
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center gap-1 mb-3">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-gray-600 font-medium">Điểm trung bình</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl font-bold text-green-600 mb-3">
              {stats.totalReviews.toLocaleString("vi-VN")}
            </div>
            <p className="text-gray-600 font-medium">Tổng số đánh giá</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl font-bold text-purple-600 mb-3">100%</div>
            <p className="text-gray-600 font-medium">Phản hồi thực từ bệnh nhân</p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc nội dung đánh giá..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition shadow-md"
            />
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Chưa có đánh giá nào phù hợp</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" title="Đã xác thực" />
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                    "{review.comment || "Khách hàng hài lòng với dịch vụ"}"
                  </p>

                  {/* Info */}
                  <div className="border-t pt-4">
                    <p className ="font-bold text-gray-900 text-lg">
                      {anonymizeName(review.reviewerName)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition font-medium"
                >
                  <ChevronLeft className="w-5 h-5" /> Trước
                </button>

                <span className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
                  Trang {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition font-medium"
                >
                  Sau <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}