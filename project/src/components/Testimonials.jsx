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
    <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề chính */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
            {t('testimonials.title')}
          </h2>
        </div>

        {/* Tóm tắt rating */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-cyan-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
            <div className="text-center mr-6">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {averageRating?.toFixed(1) || '—'}/5
              </div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-200 dark:via-gray-600 to-transparent"></div>
            <div className="text-center ml-6">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {averageRating ? Math.round((averageRating / 5) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedReviews.map((review) => (
              <div
                key={review.id}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-cyan-200 dark:hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full cursor-pointer"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 transition-colors duration-300 ${
                          i < review.rating ? 'text-yellow-400 fill-current group-hover:text-yellow-300' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-base italic line-clamp-3 mb-4 flex-1">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-3 text-base mt-2">
                    <div className="w-10 h-10 bg-cyan-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-base shadow-md flex-shrink-0 group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      {review.reviewerName.split(' ').pop()[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                        {review.reviewerName}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-1 bg-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}