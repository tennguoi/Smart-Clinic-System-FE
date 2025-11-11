// src/lib/api.js
export const getReviews = async (params = {}) => {
  const searchParams = new URLSearchParams({
    service: params.service || 'Tất cả',
    search: params.search || '',
    page: params.page || 1,
    limit: params.limit || 6,
  });

  const res = await fetch(`http://localhost:8082/api/public/reviews?${searchParams}`);
  if (!res.ok) throw new Error('Lỗi tải đánh giá');
  return res.json();
};