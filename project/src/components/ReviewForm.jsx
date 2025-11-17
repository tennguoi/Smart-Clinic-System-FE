'use client';

import { Star, Send } from 'lucide-react';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8082';

export default function ReviewForm({ onReviewAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    if (!rating || !comment.trim() || !reviewerName.trim()) {
      setSubmitError('Vui lòng điền đủ sao, nội dung và tên');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          reviewerName: reviewerName.trim(),
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Gửi thất bại');
      }

      const newReview = await res.json();
      onReviewAdded(newReview, rating);

      setRating(0);
      setComment('');
      setReviewerName('');
      setShowForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Gửi thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      {/* NÚT VIẾT ĐÁNH GIÁ - NHỎ GỌN, CÙNG KIỂU VỚI TÓM TẮT */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md text-sm whitespace-nowrap"
      >
        <Star className="w-4 h-4" />
        Viết Đánh Giá
      </button>

      {/* FORM MỞ RA – CÂN ĐỐI, ĐẸP NHƯ HÌNH */}
      {showForm && (
        <div className="mt-4 w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SAO ĐÁNH GIÁ */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Ô NỘI DUNG */}
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />

              {/* Ô TÊN */}
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Tên của bạn"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              {/* NÚT GỬI + THÔNG BÁO */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-lg font-medium text-white text-sm flex items-center gap-1.5 transition-all shadow-sm ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi
                    </>
                  )}
                </button>

                <div className="text-xs">
                  {submitSuccess && (
                    <span className="text-green-600 font-medium">Gửi thành công!</span>
                  )}
                  {submitError && (
                    <span className="text-red-600">{submitError}</span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}