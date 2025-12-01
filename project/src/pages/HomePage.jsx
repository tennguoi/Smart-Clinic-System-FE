// src/pages/HomePage.jsx
import { useEffect } from 'react';
import Hero from '../components/Hero';
import CoreValues from '../components/CoreValues';
import ServicesSection from '../components/ServicesSection';
import DoctorsSection from '../components/DoctorsSection';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function HomePage() {
  useEffect(() => {
    // SEO: Update document title
    document.title = 'Phòng Khám Tai-Mũi-Họng | Chăm Sóc Sức Khỏe ENT Chuyên Nghiệp';
    
    // SEO: Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Phòng khám chuyên khoa Tai-Mũi-Họng uy tín với đội ngũ bác sĩ giàu kinh nghiệm, thiết bị hiện đại. Đặt lịch khám ngay!');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Phòng khám chuyên khoa Tai-Mũi-Họng uy tín với đội ngũ bác sĩ giàu kinh nghiệm, thiết bị hiện đại. Đặt lịch khám ngay!';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Hero />
      <CoreValues />
      <ServicesSection />
      <DoctorsSection />

      {/* PHẦN ĐÁNH GIÁ – BẮT BUỘC HIỆN */}
      <div className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <Testimonials />
      </div>
      <Footer />
    </main>
  );
}