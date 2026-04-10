import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Bot,
  ChartColumn,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import "../styles/admin/AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>ILAS Portal</h2>
          <p>Worker Rights Management</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item">
            <span className="nav-icon"><LayoutDashboard size={16} /></span>
            <span className="nav-label">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/manage-users" className="nav-item">
            <span className="nav-icon"><Users size={16} /></span>
            <span className="nav-label">Users</span>
          </NavLink>
          <NavLink to="/admin/crawl-laws" className="nav-item">
            <span className="nav-icon"><ShieldCheck size={16} /></span>
            <span className="nav-label">Legal Data</span>
          </NavLink>
          <NavLink to="/admin/chatbot" className="nav-item">
            <span className="nav-icon"><Bot size={16} /></span>
            <span className="nav-label">Chatbot</span>
          </NavLink>
          <NavLink to="/admin/reports" className="nav-item">
            <span className="nav-icon"><ChartColumn size={16} /></span>
            <span className="nav-label">Reports</span>
          </NavLink>
          <NavLink to="/admin/settings" className="nav-item">
            <span className="nav-icon"><Settings size={16} /></span>
            <span className="nav-label">System Config</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item footer-link" type="button" onClick={() => navigate("/admin/feedback")}>
            <span className="nav-icon"><HelpCircle size={16} /></span>
            <span className="nav-label">Help Center</span>
          </button>
          <button onClick={handleLogout} className="nav-item footer-link" type="button">
            <span className="nav-icon"><LogOut size={16} /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

