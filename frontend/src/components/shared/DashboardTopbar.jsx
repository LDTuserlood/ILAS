import React, { useState } from "react";
import { FiBell, FiSearch, FiSettings } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/shared/DashboardTopbar.css";

export default function DashboardTopbar({
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  onSearchSubmit,
  userRole = "Người dùng",
}) {
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "User";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && onSearchSubmit) {
      e.preventDefault();
      onSearchSubmit(searchText);
    }
  };

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-search">
        <FiSearch size={16} />
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder={searchPlaceholder}
        />
      </div>

      <div className="dashboard-topbar-tools">
        <button type="button" className="dashboard-topbar-icon-btn" aria-label="Notifications">
          <FiBell size={18} />
        </button>
        <button type="button" className="dashboard-topbar-icon-btn" aria-label="Settings">
          <FiSettings size={18} />
        </button>

        <div className="dashboard-topbar-user-chip">
          <div className="dashboard-topbar-user-info">
            <div className="dashboard-topbar-user-name">{displayName}</div>
            <div className="dashboard-topbar-user-role">{userRole}</div>
          </div>
          <div className="dashboard-topbar-avatar">{avatarLetter}</div>
        </div>
      </div>
    </header>
  );
}
