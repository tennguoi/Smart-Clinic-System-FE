// src/App.jsx
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
import ReviewsPage from './pages/ReviewsPage';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import AdminPage from './pages/AdminPage';
import DoctorPage from './pages/DoctorPage';
import ProfilePage from './pages/ProfilePage';
import ReceptionPage from './pages/ReceptionPage';
import ChatbotAvatar from './components/chatbot/ChatbotAvatar';
import NewsDetailPage from "./pages/NewsDetailPage";
import Verify2FA from './components/Verify2FA';
import CurrentPatientView from './components/doctor/CurrentPatientView'
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />

        {/* PUBLIC ROUTES */}
        <Route
          path="/*"
          element={
            <>
              <StickyNavbar />
              <div className="w-full h-16 sm:h-20 lg:h-24" aria-hidden="true"></div>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/appointment" element={<AppointmentPage />} />
                <Route path="/danh-gia" element={<ReviewsPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
              </Routes>
              <ChatbotAvatar />
            </>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* DOCTOR – CÓ NESTED ROUTE */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['ROLE_BAC_SI', 'ROLE_ADMIN']}>
              <DoctorPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorPage />} /> {/* trang mặc định */}
          <Route path="current-patient" element={<CurrentPatientView />} />
        </Route>

        {/* RECEPTION */}
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