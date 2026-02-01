import FullServicesPage from '../components/FullServicesPage';
import Footer from '../components/Footer';

export default function ServicesPage() {
  return (
    <div className="pt-20 bg-gradient-to-b from-cyan-50 via-white to-cyan-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <FullServicesPage />
      <Footer />
    </div>
  );
}