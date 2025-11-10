import { Routes, Route } from 'react-router-dom';
import StickyNavbar from './components/StickyNavbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import DoctorsPage from './pages/DoctorsPage';
import PricingPage from './pages/PricingPage';
import NewsPage from './pages/NewsPage';
import AppointmentPage from './pages/AppointmentPage';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import DoctorManagementPage from './pages/DoctorManagementPage';
import ReceptionPage from './pages/ReceptionPage';
import NewsDetailPage from "./pages/NewsDetailPage";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Authentication Routes – KHÔNG có StickyNavbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Public Routes – CÓ StickyNavbar */}
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
                <Route path="/news/:id" element={<NewsDetailPage />} />
              </Routes>
            </>
          }
        />

        {/* Admin/Doctor Routes – KHÔNG có StickyNavbar */}
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/doctor/*" element={<DoctorManagementPage />} />
        <Route path="/receptionist/*" element={<ReceptionPage />} />
      </Routes>
    </div>
  );
}

export default App;
