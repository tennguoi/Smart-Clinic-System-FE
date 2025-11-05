// src/data/doctors.ts
import { Doctor } from '../types';

export const doctors: Doctor[] = [
  {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    fullName: 'Nguyễn Minh Khánh',
    experienceYears: 15,
    photoUrl: 'https://img.lovepik.com/element/40203/0838.png_1200.png',
    bio: 'Bác sĩ chuyên khoa Tai-Mũi-Họng với 15 năm kinh nghiệm, chuyên điều trị các bệnh lý phức tạp về tai, mũi, họng.',
    twoFactorEnabled: true,
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    fullName: 'Trần Thị B',
    experienceYears: 10,
    photoUrl: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'Bác sĩ Tai-Mũi-Họng tận tâm, chuyên về nội soi và điều trị viêm xoang.',
    twoFactorEnabled: false,
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440002',
    fullName: 'Lê Văn C',
    experienceYears: 8,
    photoUrl: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'Bác sĩ chuyên khoa Tai-Mũi-Họng, có kinh nghiệm trong phẫu thuật và điều trị bệnh lý tai.',
    twoFactorEnabled: true,
  },
  {
    userId: '550e8400-e29b-41d4-a716-446655440003',
    fullName: 'Phạm Thị D',
    experienceYears: 7,
    photoUrl: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=800',
    bio: 'Bác sĩ trẻ, nhiệt huyết, chuyên về điều trị bệnh lý họng và thanh quản.',
    twoFactorEnabled: false,
  },
];