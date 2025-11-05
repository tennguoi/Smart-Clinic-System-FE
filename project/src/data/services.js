// src/data/services.js
export const entServices = [
  {
    serviceId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Khám Tai Mũi Họng Tổng Quát',
    description: 'Khám và chẩn đoán các vấn đề Tai Mũi Họng',
    category: 'Consultation',
    price: 200000.00,
    isActive: true,
  },
  {
    serviceId: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Nội Soi Tai Mũi Họng',
    description: 'Thăm dò bằng nội soi để đánh giá tình trạng',
    category: 'Test',
    price: 500000.00,
    isActive: true,
  },
  {
    serviceId: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Hút Mủ Tai',
    description: 'Thủ thuật làm sạch mủ tai',
    category: 'Procedure',
    price: 300000.00,
    isActive: true,
  },
  {
    serviceId: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Khám Sức Khỏe Định Kỳ',
    description: 'Gói khám tổng quát cho sức khỏe',
    category: 'Consultation',
    price: 1000000.00,
    isActive: false,
  },
];

export const getCategoryLabel = (category) => {
  const categories = {
    Consultation: 'Khám Bệnh',
    Test: 'Thăm Dò',
    Procedure: 'Thủ Thuật',
  };
  return categories[category] || category;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};