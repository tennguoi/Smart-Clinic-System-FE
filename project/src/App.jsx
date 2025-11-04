import { Routes, Route } from 'react-router-dom';
import StickyNavbar from './components/StickyNavbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import PricingPage from './pages/PricingPage';
import NewsPage from './pages/NewsPage';
import AppointmentPage from './pages/AppointmentPage';
import AdminPage from './pages/AdminPage'; // Thêm import

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* StickyNavbar chỉ hiển thị ở các trang public */}
      <Routes>
        {/* Public Routes – có Navbar */}
        <Route
          path="/*"
          element={
            <>
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
            </>
          }
        />

        {/* Admin Route – KHÔNG có Navbar */}
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
