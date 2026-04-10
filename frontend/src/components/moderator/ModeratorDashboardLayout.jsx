import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import ModeratorSidebar from "./ModeratorSidebar";
import DashboardTopbar from "../shared/DashboardTopbar";
import "../../styles/moderator/ModeratorDashboardLayout.css";

export default function ModeratorDashboardLayout({
  title,
  description,
  actions,
  children,
}) {
  return (
    <div className="moderator-dashboard-layout-page">
      <ModeratorSidebar active="dashboard" />

      <main className="moderator-dashboard-layout-main">
        <DashboardTopbar
          searchPlaceholder="Tìm kiếm trong dashboard..."
          userRole="Moderator"
        />

        <section className="moderator-dashboard-layout-header">
          <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="moderator-dashboard-layout-header-actions">{actions}</div> : null}
        </section>

        {children}
      </main>
    </div>
  );
}
