// src/utils/formatPrice.js
export const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') return '0 ₫';

  let num;
  if (typeof value === 'string') {
    // Xử lý chuỗi BigDecimal từ backend: "150000.00"
    num = parseFloat(value);
  } else if (typeof value === 'number') {
    num = value;
  } else {
    num = Number(value);
  }

  if (isNaN(num)) return '0 ₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};