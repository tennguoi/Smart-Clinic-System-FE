// src/components/Testimonials.jsx
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return t('testimonials.noDate');
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return t('testimonials.today');
    if (diffInDays === 1) return t('testimonials.yesterday');
    if (diffInDays < 7) return t('testimonials.daysAgo', { count: diffInDays });
    if (diffInDays < 30) return t('testimonials.weeksAgo', { count: Math.floor(diffInDays / 7) });
    if (diffInDays < 365) return t('testimonials.monthsAgo', { count: Math.floor(diffInDays / 30) });
    return t('testimonials.yearsAgo', { count: Math.floor(diffInDays / 365) });
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:8082/api/public/reviews/summary');
      if (!res.ok) throw new Error(t('testimonials.errorLoad'));
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

  if (loading) {
    return (
      <section className="py-6 md:py-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('testimonials.loading')}
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  const displayedReviews = reviews.slice(0, 8);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-blue-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề chính */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Tóm tắt rating */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-cyan-200 dark:border-gray-700 p-8 hover:shadow-3xl hover:scale-105 transition-all duration-300">
            <div className="text-center mr-8">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                {averageRating?.toFixed(1) || '—'}/5
              </div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
            </div>
            <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-cyan-300 dark:via-gray-600 to-transparent"></div>
            <div className="text-center ml-8">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                {averageRating ? Math.round((averageRating / 5) * 100) : 0}%
              </div>
              <div className="text-base text-gray-600 dark:text-gray-400 font-medium mt-1">
                {t('testimonials.recommendation')}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách đánh giá */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('testimonials.noReviews')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-500 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 flex flex-col h-full cursor-pointer"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 transition-colors duration-300 ${
                          i < review.rating ? 'text-yellow-400 fill-current group-hover:text-yellow-500 group-hover:scale-110' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-lg italic line-clamp-3 mb-6 flex-1 leading-relaxed">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-4 text-base mt-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-lg shadow-lg flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:text-white group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                      {review.reviewerName.split(' ').pop()[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 transition-all duration-300">
                        {review.reviewerName}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 h-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}