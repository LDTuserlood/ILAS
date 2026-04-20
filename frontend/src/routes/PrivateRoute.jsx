import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 1. Đọc role, in hoa, xóa khoảng trắng thừa
  let userRole = user.role ? String(user.role).toUpperCase().trim() : "UNDEFINED";

  // 2. Tự động cắt bỏ tiền tố "ROLE_" nếu Backend Spring Boot có gắn vào
  // Biến "ROLE_MODERATOR" thành "MODERATOR"
  if (userRole.startsWith("ROLE_")) {
    userRole = userRole.substring(5); 
  }

  // 🔥 In ra Console để debug xem chúng ta đang nhận được chữ gì
  console.log(`🛡️ Kiểm tra Quyền - Bạn đang là: [${userRole}] | Trang này yêu cầu:`, allowedRoles);

  // 3. So sánh quyền
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn("⛔ Cấm vào! Bạn không có quyền truy cập trang này.");
    return <Navigate to="/login" replace />;
  }

  return children;
}