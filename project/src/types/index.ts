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
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  date: string;
}
