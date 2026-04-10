import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenSquare,
} from "lucide-react";
import "../../styles/admin/AdminLayout.css";

const navItems = [
  { key: "dashboard", label: "Dashboard", path: "/moderator/dashboard", icon: LayoutDashboard },
  { key: "simplify", label: "Quản lý luật", path: "/moderator/simplify", icon: PenSquare },
  { key: "forms", label: "Biểu mẫu", path: "/moderator/forms", icon: FileText },
  { key: "feedback", label: "Phản hồi", path: "/moderator/feedback", icon: MessageSquare },
];

export default function EditorSidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSidebarLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-brand-button"
          onClick={() => navigate("/")}
        >
          <h2>ILAS Portal</h2>
          <p>Worker Rights Management</p>
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Editor navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-item${active === item.key ? " active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon"><item.icon size={16} /></span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className={`nav-item footer-link${active === "help" ? " active" : ""}`}
          onClick={() => navigate("/moderator/help")}
        >
          <span className="nav-icon"><HelpCircle size={16} /></span>
          <span className="nav-label">Help Center</span>
        </button>
        <button type="button" className="nav-item footer-link" onClick={handleSidebarLogout}>
          <span className="nav-icon"><LogOut size={16} /></span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}