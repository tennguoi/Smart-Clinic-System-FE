// src/App.jsx (ĐÃ SỬA ĐỔI)
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
import ReviewsPage from './pages/ReviewsPage'; // ĐÃ THÊM

// === AUTH PAGES ===
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ResetPassword from './components/ResetPassword';
import AdminPage from './pages/AdminPage';
import DoctorPage from './pages/DoctorPage';
import ProfilePage from './pages/ProfilePage';
// === ADMIN / STAFF PAGES ===
import DoctorManagementPage from './pages/DoctorManagementPage';
import ReceptionPage from './pages/ReceptionPage';
// import AppointmentChatbotForm from './components/chatbot/AppointmentChatbotForm'; // KHÔNG CẦN IMPORT TRỰC TIẾP Ở ĐÂY NỮA
import ChatbotAvatar from './components/chatbot/ChatbotAvatar';
import NewsDetailPage from "./pages/NewsDetailPage";
import Verify2FA from './components/Verify2FA';

function App() {
  
  return (
    <div className="min-h-screen bg-white">
      <Routes>

        {/* === AUTH ROUTES – KHÔNG CÓ NAVBAR === */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
        {/* === PUBLIC ROUTES – CÓ STICKYNAVBAR === */}
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
                <Route path="/danh-gia" element={<ReviewsPage />} /> {/* ĐÃ CÓ */}
                <Route path="/news/:id" element={<NewsDetailPage />} />
              </Routes>
                   <ChatbotAvatar />
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