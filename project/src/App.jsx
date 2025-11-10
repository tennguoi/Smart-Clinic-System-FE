import { Routes, Route } from 'react-router-dom';
import StickyNavbar from './components/StickyNavbar';
import ProtectedRoute from './components/ProtectedRoute';
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
import DoctorPage from './pages/DoctorPage';
import ReceptionPage from './pages/ReceptionPage';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Authentication Routes – KHÔNG có StickyNavbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
              </Routes>
            </>
          }
        />

        {/* Protected Routes – KHÔNG có StickyNavbar */}
        {/* Admin Route - Chỉ cho ROLE_ADMIN */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor Route - Cho ROLE_BAC_SI và ROLE_ADMIN */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_BAC_SI', 'ROLE_ADMIN']}>
              <DoctorPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Reception Route - Cho ROLE_TIEP_TAN và ROLE_ADMIN */}
        <Route 
          path="/reception/*" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_TIEP_TAN', 'ROLE_ADMIN']}>
              <ReceptionPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
