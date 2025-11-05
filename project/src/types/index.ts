export interface Service {
  id: string;
  name: string;
  category: 'kham' | 'tham-do' | 'thu-thuat' | 'goi-kham';
  price: number;
  description: string;
  duration: number;
  icon?: string;
}


export interface Doctor {
  userId: string;
  fullName: string;
  experienceYears: number;
  photoUrl: string;
  bio: string;
  twoFactorEnabled: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  date: string;
}
