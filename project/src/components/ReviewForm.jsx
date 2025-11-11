// src/components/ReviewForm.jsx
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ĐÃ CÓ JWT

export default function ReviewForm({ onReviewSubmitted }) {
  const { user } = useAuth(); // LẤY USER ĐÃ ĐĂNG NHẬP
  const [form, setForm] = useState({
    service: '',
    content: '',
    rating: 0
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const services = ['Nhi khoa', 'Nha khoa', 'Nội khoa', 'Da liễu', 'Sản phụ khoa'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service || !form.content || form.rating === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: form.service,
          content: form.content,
          rating: form.rating
        })
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ service: '', content: '', rating: 0 });
        setTimeout(() => setSuccess(false), 3000);
        onReviewSubmitted?.(); // TẢI LẠI ĐÁNH GIÁ
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // CHỈ HIỆN NẾU ĐÃ LOGIN

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-12">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Chia sẻ trải nghiệm của bạn
      </h3>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Cảm ơn bạn! Đánh giá đã được gửi.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ đã khám</label>
          <select
            value={form.service}
            onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn dịch vụ</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá sao</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                className="p-1"
              >
                <Star
                  className={`w-7 h-7 ${star <= form.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
          <textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Hãy chia sẻ cảm nhận của bạn..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || form.rating === 0 || !form.service || !form.content}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang gửi...
            </>
          ) : (
            'Gửi đánh giá'
          )}
        </button>
      </form>
    </div>
  );
}