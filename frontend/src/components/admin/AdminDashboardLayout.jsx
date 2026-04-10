import React from "react";
import DashboardTopbar from "../shared/DashboardTopbar";
import "../../styles/admin/AdminDashboardLayout.css";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="admin-dashboard-layout-page">
      <main className="admin-dashboard-layout-main">
        <DashboardTopbar
          searchPlaceholder="Tìm kiếm hệ thống..."
          userRole="HỆ THỐNG ILAS"
        />
        {children}
      </main>
    </div>
  );
}
