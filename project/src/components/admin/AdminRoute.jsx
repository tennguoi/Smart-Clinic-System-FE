// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user.roles?.includes("ROLE_ADMIN")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}