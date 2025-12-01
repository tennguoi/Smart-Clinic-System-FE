import { Routes, Route } from "react-router-dom";
import StickyNavbar from "./components/StickyNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import DoctorsPage from "./pages/DoctorsPage";
import PricingPage from "./pages/PricingPage";
import NewsPage from "./pages/NewsPage";
import AppointmentPage from "./pages/AppointmentPage";
import ReviewsPage from "./pages/admin/ReviewsPage";           // Trang khách xem đánh giá
import NewsDetailPage from "./pages/NewsDetailPage";
import ChatbotAvatar from "./components/chatbot/ChatbotAvatar";

// Auth
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Verify2FA from "./components/Verify2FA";
import ProfilePage from "./pages/ProfilePage";
import VerifyOTP from "./components/VerifyOTP";
import ResetPassword from "./components/ResetPassword";

// Dashboard Layout
import AdminPage from "./pages/AdminPage";
import StatisticsPage from "./components/admin/Statistics";
import DoctorPage from "./pages/DoctorPage";
import ReceptionPage from "./pages/ReceptionPage";

// Admin Components
import DoctorManagement from "./components/admin/DoctorManagement";
import ServiceManagement from "./components/admin/ServiceManagement";
import ArticleManagement from "./components/admin/ArticleManagement";
import AccountManagement from "./components/admin/AccountManagement";
import ClinicManagement from "./components/admin/ClinicManagement";

// QUAN TRỌNG: THÊM TRANG QUẢN LÝ ĐÁNH GIÁ ADMIN
import AdminReviewsPage from "./pages/admin/ReviewsPage";   // Đã làm ở tin nhắn trước

// Doctor Components
import CurrentPatientExamination from "./components/doctor/CurrentPatientExamination";
import DoctorStatsDashboard from "./components/doctor/DoctorStatsDashboard";
import MedicalRecordsSection from "./components/doctor/MedicalRecordsSection";
import MedicalRecordHistory from "./components/doctor/MedicalRecordHistory";

// Reception Components
import AppointmentsSection from "./components/receptionist/AppointmentsSection";
import PatientRecordsSection from "./components/receptionist/PatientRecordsSection";
import ClinicRoomManagement from "./components/receptionist/ClinicRoomManagement";
import InvoicesSection from "./components/receptionist/InvoicesSection";
import PaymentPage from "./pages/payment/PaymentPage";

import PlaceholderSection from "./components/common/PlaceholderSection";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>

        {/* ==================== AUTH & PROFILE ==================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* ==================== PUBLIC ROUTES (có Navbar + Chatbot) ==================== */}
        <Route
          path="/*"
          element={
            <>
              <StickyNavbar />
              <div className="w-full h-24" aria-hidden="true" /> {/* Khoảng trống cho navbar fixed */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/appointment" element={<AppointmentPage />} />
                <Route path="/danh-gia" element={<ReviewsPage />} />        {/* Trang khách xem đánh giá */}
                <Route path="/news/:id" element={<NewsDetailPage />} />
              </Routes>
              <ChatbotAvatar />
            </>
          }
        />

        {/* ==================== ADMIN DASHBOARD ==================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<StatisticsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="clinic" element={<ClinicManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="articles" element={<ArticleManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="appointments" element={<AppointmentsSection />} />
          <Route path="rooms" element={<ClinicRoomManagement />} />
          <Route path="medical-records" element={<MedicalRecordHistory />} />
          <Route path="invoices" element={<InvoicesSection isDoctorView={true} />} />
          <Route path="doctors" element={<DoctorManagement />} />

          {/* TRANG QUẢN LÝ ĐÁNH GIÁ ADMIN – ĐÃ HOÀN CHỈNH */}
          <Route path="reviews" element={<AdminReviewsPage />} />

          <Route path="*" element={<PlaceholderSection title="Chức năng" message="Sắp ra mắt..." />} />
        </Route>

        {/* ==================== DOCTOR DASHBOARD ==================== */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["ROLE_BAC_SI", "ROLE_ADMIN"]}>
              <DoctorPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<CurrentPatientExamination />} />
          <Route path="current-patient" element={<CurrentPatientExamination />} />
          <Route path="stats" element={<DoctorStatsDashboard />} />
          <Route path="records" element={<MedicalRecordsSection />} />
          <Route path="history" element={<MedicalRecordHistory />} />
          <Route path="invoices" element={<InvoicesSection isDoctorView={true} />} />
          <Route path="*" element={
            <div className="flex items-center justify-center h-96 text-center">
              <div>
                <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
                <p className="text-xl text-gray-600">Chức năng đang phát triển...</p>
              </div>
            </div>
          } />
        </Route>

        {/* ==================== RECEPTION DASHBOARD ==================== */}
        <Route
          path="/reception"
          element={
            <ProtectedRoute allowedRoles={["ROLE_TIEP_TAN", "ROLE_ADMIN"]}>
              <ReceptionPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppointmentsSection />} />
          <Route path="appointments" element={<AppointmentsSection />} />
          <Route path="records" element={<PatientRecordsSection />} />
          <Route path="rooms" element={<ClinicRoomManagement />} />
          <Route path="invoices" element={<InvoicesSection />} />
          <Route path="payment/:billId" element={<PaymentPage />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;