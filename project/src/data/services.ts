import { Service } from '../types';

export const entServices: Service[] = [
  {
    id: 'kham-tai',
    name: 'Khám Tai',
    category: 'kham',
    price: 200000,
    description: 'Khám và tư vấn các vấn đề về tai: viêm tai, ù tai, giảm thính lực',
    duration: 30,
    icon: 'ear'
  },
  {
    id: 'kham-mui',
    name: 'Khám Mũi',
    category: 'kham',
    price: 200000,
    description: 'Khám và điều trị viêm mũi, viêm xoang, nghẹt mũi, chảy máu cam',
    duration: 30,
    icon: 'wind'
  },
  {
    id: 'kham-hong',
    name: 'Khám Họng',
    category: 'kham',
    price: 200000,
    description: 'Khám viêm họng, viêm amidan, polyp thanh quản',
    duration: 30,
    icon: 'activity'
  },
  {
    id: 'noi-soi-tai',
    name: 'Nội Soi Tai',
    category: 'tham-do',
    price: 350000,
    description: 'Nội soi tai với thiết bị hiện đại, chẩn đoán chính xác các bệnh lý tai',
    duration: 20,
    icon: 'search'
  },
  {
    id: 'noi-soi-mui-xoang',
    name: 'Nội Soi Mũi - Xoang',
    category: 'tham-do',
    price: 400000,
    description: 'Nội soi chẩn đoán viêm mũi xoang, polyp mũi, khối u vùng mũi xoang',
    duration: 25,
    icon: 'scan'
  },
  {
    id: 'noi-soi-thanh-quan',
    name: 'Nội Soi Thanh Quản',
    category: 'tham-do',
    price: 450000,
    description: 'Nội soi thanh quản đánh giá chức năng giọng nói và các bệnh lý thanh quản',
    duration: 25,
    icon: 'video'
  },
  {
    id: 'do-thu-luc',
    name: 'Đo Thính Lực',
    category: 'tham-do',
    price: 300000,
    description: 'Đo và đánh giá khả năng nghe, phát hiện sớm các vấn đề về thính giác',
    duration: 45,
    icon: 'volume-2'
  },
  {
    id: 'lay-ray-tai',
    name: 'Lấy Ráy Tai',
    category: 'thu-thuat',
    price: 150000,
    description: 'Lấy ráy tai an toàn, vệ sinh tai sạch sẽ',
    duration: 15,
    icon: 'droplet'
  },
  {
    id: 'chi-mau-cam',
    name: 'Cầm Máu Cam',
    category: 'thu-thuat',
    price: 250000,
    description: 'Xử lý chảy máu cam cấp tính và mạn tính',
    duration: 20,
    icon: 'heart-pulse'
  },
  {
    id: 'cat-amidan',
    name: 'Cắt Amidan',
    category: 'thu-thuat',
    price: 5000000,
    description: 'Phẫu thuật cắt amidan với công nghệ Plasma, ít đau, hồi phục nhanh',
    duration: 60,
    icon: 'scissors'
  },
  {
    id: 'goi-kham-tong-quat',
    name: 'Gói Khám Tổng Quát ENT',
    category: 'goi-kham',
    price: 800000,
    description: 'Khám toàn diện Tai-Mũi-Họng, bao gồm nội soi và đo thính lực',
    duration: 90,
    icon: 'package'
  },
  {
    id: 'goi-kham-gia-dinh',
    name: 'Gói Khám Gia Đình ENT',
    category: 'goi-kham',
    price: 2500000,
    description: 'Gói khám cho 4 người trong gia đình, tiết kiệm 20%',
    duration: 120,
    icon: 'users'
  }
];

export const getCategoryLabel = (category: Service['category']): string => {
  const labels: Record<Service['category'], string> = {
    'kham': 'Khám Bệnh',
    'tham-do': 'Thăm Dò',
    'thu-thuat': 'Thủ Thuật',
    'goi-kham': 'Gói Khám'
  };
  return labels[category];
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};
