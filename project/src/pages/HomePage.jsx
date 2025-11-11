// src/pages/HomePage.jsx
import Hero from '../components/Hero';
import CoreValues from '../components/CoreValues';
import ServicesSection from '../components/ServicesSection';
import DoctorsSection from '../components/DoctorsSection';
import Testimonials from '../components/Testimonials'; // ĐÃ IMPORT
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <Hero />
      <CoreValues />
      <ServicesSection />
      <DoctorsSection />

      {/* PHẦN ĐÁNH GIÁ – BẮT BUỘC HIỆN */}
      <div className="bg-gray-50">
        <Testimonials />
      </div>

      <Contact />
      <Footer />
    </div>
  );
}