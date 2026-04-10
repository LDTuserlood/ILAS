import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import "../../styles/admin/AdminLayout.css";

const UserSidebar = ({ active }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSidebarLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <button type="button" className="sidebar-brand-button" onClick={() => navigate("/")}>
          <h2>ILAS Portal</h2>
          <p>Worker Rights Management</p>
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        <button type="button" className={`nav-item${active === "dashboard" ? " active" : ""}`} onClick={() => navigate("/user/dashboard")}>
          <span className="nav-icon"><LayoutDashboard size={16} /></span>
          <span className="nav-label">Dashboard</span>
        </button>
        <button type="button" className={`nav-item${active === "search" ? " active" : ""}`} onClick={() => navigate("/search")}>
          <span className="nav-icon"><Search size={16} /></span>
          <span className="nav-label">Search</span>
        </button>
        <button type="button" className={`nav-item${active === "chatbot" ? " active" : ""}`} onClick={() => navigate("/chat/history")}>
          <span className="nav-icon"><Bot size={16} /></span>
          <span className="nav-label">Chatbot</span>
        </button>
        <button type="button" className={`nav-item${active === "form" ? " active" : ""}`} onClick={() => navigate("/user/form")}>
          <span className="nav-icon"><FileText size={16} /></span>
          <span className="nav-label">Biểu mẫu</span>
        </button>
        <button type="button" className={`nav-item${active === "settings" ? " active" : ""}`} onClick={() => navigate("/profile")}>
          <span className="nav-icon"><Settings size={16} /></span>
          <span className="nav-label">System Config</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-item footer-link" onClick={handleSidebarLogout}>
          <span className="nav-icon"><LogOut size={16} /></span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default UserSidebar;
