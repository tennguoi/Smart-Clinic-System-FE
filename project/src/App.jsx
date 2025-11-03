import { Routes, Route } from 'react-router-dom';
import StickyNavbar from './components/StickyNavbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import PricingPage from './pages/PricingPage';
import NewsPage from './pages/NewsPage';
import AppointmentPage from './pages/AppointmentPage';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <StickyNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
      </Routes>
    </div>
  );
}

export default App;