// src/App.jsx
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
import ReviewsPage from "./pages/ReviewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import ChatbotAvatar from "./components/chatbot/ChatbotAvatar";

// Auth
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Verify2FA from "./components/Verify2FA";
import ProfilePage from "./pages/ProfilePage";
import SecurityPage from "./pages/SecurityPage";

// Dashboard Layout
import AdminPage from "./pages/AdminPage";
import DoctorPage from "./pages/DoctorPage";
import ReceptionPage from "./pages/ReceptionPage";

// Admin Components
import RevenueTable from "./components/admin/RevenueTable";
import DoctorManagement from "./components/admin/DoctorManagement";
import ServiceManagement from "./components/admin/ServiceManagement";
import ArticleManagement from "./components/admin/ArticleManagement";
import AccountManagement from "./components/admin/AccountManagement";
import ClinicManagement from "./components/admin/ClinicManagement";
import PlaceholderSection from "./components/common/PlaceholderSection";

// Doctor Components
import CurrentPatientExamination from "./components/doctor/CurrentPatientExamination";
import DoctorStatsDashboard from "./components/doctor/DoctorStatsDashboard";
// Reception Components
import AppointmentsSection from "./components/receptionist/AppointmentsSection";
import PatientRecordsSection from "./components/receptionist/PatientRecordsSection";
import ClinicRoomManagement from "./components/receptionist/ClinicRoomManagement";
import InvoicesSection from "./components/receptionist/InvoicesSection";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>

        {/* AUTH & PROFILE */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-2fa" element={<Verify2FA />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />

        {/* PUBLIC ROUTES */}
        <Route
          path="/*"
          element={
            <>
              <StickyNavbar />
              <div className="w-full h-16 sm:h-20 lg:h-24" aria-hidden="true" />
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
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<RevenueTable />} />
          <Route path="revenue" element={<RevenueTable />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="articles" element={<ArticleManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="clinic" element={<ClinicManagement />} />
          <Route path="*" element={<PlaceholderSection title="Chức năng" message="Sắp ra mắt..." />} />
        </Route>

        {/* DOCTOR */}
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
          <Route path="*" element={<div className="p-10 text-center text-2xl text-gray-500">Chức năng đang phát triển</div>} />
          <Route path="records" element={<DoctorPage />} />
          <Route path="history" element={<DoctorPage />} />
          <Route path="invoices" element={<DoctorPage />} />
          <Route path="stats" element={<DoctorPage />} />
        </Route>

        {/* RECEPTION (LỄ TÂN) – ĐÃ SỬA HOÀN CHỈNH */}
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
        </Route>

      </Routes>
    </div>
  );
}

export default App;