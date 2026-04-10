import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/landing/Header.css";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const role = user?.role?.toUpperCase() || "GUEST";
  const isModeratorRole = role === "EDITOR" || role === "MODERATOR";

  // Menu chia theo role
  const menus =
    isModeratorRole
      ? [
          { to: "/moderator/dashboard", label: "Dashboard" },
          { to: "/moderator/simplify", label: "Soạn thảo" },
          { to: "/moderator/forms", label: "Biểu mẫu" },
          { to: "/moderator/feedback", label: "Phản hồi" },
        ]
      : [
          { to: "/", label: "Trang chủ" },
          { to: "/search", label: "Tìm kiếm" },
          ...(isAuthenticated ? [{ to: "/user/form", label: "Biểu mẫu" }] : []),
          { to: "/about", label: "Giới thiệu" },
          { to: "/help", label: "Liên hệ" },
        ];

  // Dropdown
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className={`lp-header ${isModeratorRole ? "editor-header" : ""}`}>
      <div className="lp-header-content">
        <Link to="/">
          <img src="/image/logo.png" alt="ILAS Logo" className="lp-logo" />
        </Link>

        {/* Menu điều hướng */}
        <nav className="lp-nav">
          {menus.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/*  Dropdown người dùng */}
        <div className="lp-header-btns">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className={`user-dropdown-toggle ${isDropdownOpen ? "active" : ""}`}
                onClick={toggleDropdown}
              >
                <span className="user-name">
                  Xin chào, {user?.fullName || user?.username}
                </span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <Link
                    to={isModeratorRole ? "/moderator/dashboard" : "/user/dashboard"}
                    className="dropdown-item"
                    onClick={closeDropdown}
                  >
                    📊 Dashboard
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={closeDropdown}>
                    👤 Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="lp-btn lp-btn-outline">
                Đăng nhập
              </Link>
              <Link to="/register" className="lp-btn lp-btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

