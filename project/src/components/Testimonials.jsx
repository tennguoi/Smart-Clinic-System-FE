'use client';

import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:8080/api/reviews/summary');
      if (!res.ok) throw new Error('Không thể tải đánh giá');
      const data = await res.json();

      setReviews(data.reviews || []);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleReviewAdded = (newReview, newRating) => {
    setReviews([newReview, ...reviews]);
    setTotalReviews(totalReviews + 1);
    setAverageRating(((averageRating * totalReviews) + newRating) / (totalReviews + 1));
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">Đang tải đánh giá...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tiêu đề + Tóm tắt */}
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Đánh Giá Khách Hàng
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">
            Bệnh Nhân Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-gray-600">
            Hơn <strong>{totalReviews.toLocaleString()}</strong> đánh giá
          </p>
        </div>

        {/* Tóm tắt + Nút Viết đánh giá (bên phải) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="inline-flex items-center bg-white rounded-xl shadow-md p-6">
            <div className="text-center mr-6">
              <div className="text-3xl font-bold text-blue-600">
                {averageRating?.toFixed(1) || '—'}/5
              </div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center ml-6">
              <div className="text-3xl font-bold text-blue-600">
                {averageRating ? Math.round((averageRating / 5) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Khuyến nghị</div>
            </div>
          </div>

          {/* NÚT VIẾT ĐÁNH GIÁ - BÊN PHẢI */}
          <div className="flex justify-end w-full md:w-auto">
            <ReviewForm onReviewAdded={handleReviewAdded} />
          </div>
        </div>

        {/* Danh sách đánh giá */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              {displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm italic line-clamp-3 mb-4">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{review.reviewerName}</p>
                      <p className="text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {review.reviewerName[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* NÚT XEM THÊM / ẨN BỚT – ĐÃ SỬA LỖI JSX */}
            {reviews.length > 6 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-blue-600 font-medium hover:underline flex items-center justify-center mx-auto gap-1"
                >
                  {showAll ? (
                    <>Ẩn bớt đánh giá</>
                  ) : (
                    <>Xem thêm {reviews.length - 6} đánh giá khác</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}