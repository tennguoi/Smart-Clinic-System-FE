// src/pages/HomePage.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import CoreValues from '../components/CoreValues';
import ServicesSection from '../components/ServicesSection';
import DoctorsSection from '../components/DoctorsSection';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function HomePage() {
  const { t } = useTranslation();

  useEffect(() => {
    // SEO: Update document title
    document.title = t('seo.title');
    
    // SEO: Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('seo.description'));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = t('seo.description');
      document.head.appendChild(meta);
    }
  }, [t]);

  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <CoreValues />
      <ServicesSection />
      <DoctorsSection />

      {/* PHẦN ĐÁNH GIÁ – BẮT BUỘC HIỆN */}
      <div className="bg-gray-50">
        <Testimonials />
      </div>
      <Footer />
    </main>
  );
}