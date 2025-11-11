// src/components/Testimonials.jsx
import { Star, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getReviews } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Testimonials({ onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews({ limit: 3 });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Gọi lại khi có đánh giá mới (từ form)
  useEffect(() => {
    if (onReviewSubmitted) loadReviews();
  }, [onReviewSubmitted]);

  // Format ngày: 01/11/2025
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Ẩn danh tên: Nguyễn Văn A → N*** V** A
  const anonymizeName = (name) => {
    if (!name) return 'Ẩn danh';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return name.charAt(0) + '***';
    const last = parts.pop();
    return parts.map(p => p.charAt(0) + '***').join(' ') + ' ' + last;
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Bệnh Nhân Nói Gì Về Chúng Tôi
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map(r => (
            <div
              key={r.id}
              className="bg-gray-50 p-6 rounded-xl border hover:shadow-lg transition-shadow"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="italic text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                "{r.content}"
              </p>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {anonymizeName(r.name)}
                </p>
                <p className="text-gray-500">
                  {r.service} • {formatDate(r.created_at || r.date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/danh-gia"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Xem tất cả đánh giá
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}