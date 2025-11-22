// src/App.jsx
import { Routes, Route } from "react-router-dom";
import StickyNavbar from "./components/StickyNavbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages (Giữ nguyên...)
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

// Auth (Giữ nguyên...)
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Verify2FA from "./components/Verify2FA";
import ProfilePage from "./pages/ProfilePage";
import SecurityPage from "./pages/SecurityPage";

// Dashboard Layout (Giữ nguyên...)
import AdminPage from "./pages/AdminPage";
import DoctorPage from "./pages/DoctorPage";
import ReceptionPage from "./pages/ReceptionPage";

// Admin Components
import RevenueTable from "./components/admin/RevenueTable";
import DoctorManagement from "./components/admin/DoctorManagement";
import ServiceManagement from "./components/admin/ServiceManagement";
import ArticleManagement from "./components/admin/ArticleManagement";
import AccountManagement from "./components/admin/AccountManagement";
import PlaceholderSection from "./components/common/PlaceholderSection";

// --- 1. IMPORT COMPONENT THỐNG KÊ VÀO ĐÂY ---
import Statistics from "./pages/StatisticsPage";

// Doctor & Reception Components (Giữ nguyên...)
import CurrentPatientExamination from "./components/doctor/CurrentPatientExamination";
import StatisticsPage from "./pages/StatisticsPage";
// ... (các import khác giữ nguyên)

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* ... Các Route Login, Public giữ nguyên ... */}

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        >
          {/* Trang chủ mặc định khi vào /admin -> Hiện Doanh thu (RevenueTable) */}
          <Route index element={<RevenueTable />} />
          
          {/* --- 2. THÊM ROUTE CHO THỐNG KÊ Ở ĐÂY --- */}
          <Route path="statistics" element={<StatisticsPage />} />  {/* <--- THÊM DÒNG NÀY */}

          {/* Các route khác giữ nguyên */}
          <Route path="revenue" element={<RevenueTable />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="articles" element={<ArticleManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="*" element={<PlaceholderSection title="Chức năng" message="Sắp ra mắt..." />} />
        </Route>

        {/* ... Các Route Doctor, Reception giữ nguyên ... */}

      </Routes>
    </div>
  );
}

export default App;