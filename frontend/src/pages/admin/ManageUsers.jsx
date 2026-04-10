import React, { useEffect, useState } from "react";
import { UserPlus, Search, Edit, Trash2, User, Users, Radio } from "lucide-react";
import "../../styles/admin/ManageUser.css";
import adminUserAPI from "../../api/adminUser";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "User",
    password: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminUserAPI.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && u.isActive) ||
      (statusFilter === "Inactive" && !u.isActive);
    return matchQuery && matchRole && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter, statusFilter]);

  const PAGE_SIZE = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const newUsers = users.filter((u) => {
    if (!u.createdAt) return false;
    const createdAt = new Date(u.createdAt);
    const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Number.isFinite(daysDiff) && daysDiff <= 24;
  }).length;

  const formatDate = (value) => {
    if (!value) return "--/--/----";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--/--/----";
    return date.toLocaleDateString("vi-VN");
  };

  const openCreate = () => {
    setModalMode("create");
    setFormData({
      fullName: "",
      email: "",
      username: "",
      role: "User",
      password: "",
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      username: "",
      role: user.role || "User",
      password: "",
    });
    setShowModal(true);
  };

  const createUser = async () => {
    try {
      await adminUserAPI.create(formData);
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Tạo người dùng thất bại");
    }
  };

  const updateUser = async () => {
    try {
      await adminUserAPI.update(selectedUser.id, {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      });
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Cập nhật thất bại");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await adminUserAPI.remove(id);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Xóa thất bại");
    }
  };

  const toggleUser = async (id) => {
    try {
      await adminUserAPI.toggle(id);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Đổi trạng thái thất bại");
    }
  };

  const handleSubmit = () => {
    if (modalMode === "create") createUser();
    else updateUser();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const visiblePages = [];
  const minPage = Math.max(1, currentPage - 1);
  const maxPage = Math.min(totalPages, currentPage + 1);
  for (let i = minPage; i <= maxPage; i += 1) {
    visiblePages.push(i);
  }

  return (
    <div className="manage-users-container">
      <div className="users-header">
        <div>
          <h1 className="users-title">Quản lý Người dùng</h1>
          <p className="users-subtitle">Quản trị viên có thể quản lý vai trò và quyền truy cập của người dùng tại đây.</p>
        </div>
        <button className="btn-create-user" onClick={openCreate}>
          <UserPlus size={18} />
          <span>Thêm Người dùng</span>
        </button>
      </div>

      <div className="user-stats-grid">
        <div className="user-stat-card card-total">
          <div className="stat-head">
            <div>
              <p className="stat-caption">Tổng người dùng</p>
              <p className="stat-number">{totalUsers}</p>
              <p className="stat-footnote">+12% so với tháng trước</p>
            </div>
            <div className="stat-icon-box">
              <Users size={22} />
            </div>
          </div>
        </div>

        <div className="user-stat-card card-active">
          <div className="stat-head">
            <div>
              <p className="stat-caption">Đang hoạt động</p>
              <p className="stat-number">{activeUsers}</p>
              <p className="stat-footnote">Đang trực tuyến hiện tại</p>
            </div>
            <div className="stat-icon-box">
              <Radio size={22} />
            </div>
          </div>
        </div>

        <div className="user-stat-card card-new">
          <div className="stat-head">
            <div>
              <p className="stat-caption">Đăng ký mới</p>
              <p className="stat-number">{newUsers}</p>
              <p className="stat-footnote">Trong 24 giờ qua</p>
            </div>
            <div className="stat-icon-box">
              <UserPlus size={22} />
            </div>
          </div>
        </div>
      </div>

      <div className="search-container">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="select-group">
          <label htmlFor="roleFilter">Vai trò</label>
          <select
            id="roleFilter"
            className="filter-role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">Tất cả</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="User">User</option>
          </select>
        </div>

        <div className="select-group">
          <label htmlFor="statusFilter">Trạng thái</label>
          <select
            id="statusFilter"
            className="filter-role-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Tất cả</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Tạm khóa</option>
          </select>
        </div>
      </div>

      {error && <div className="users-error">{error}</div>}

      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người Dùng</th>
              <th>Vai Trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng Thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5">Không có người dùng</td></tr>
            ) : (
              pageUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="user-name">{user.fullName || "Người dùng"}</div>
                        <div className="user-email">{user.email || "Không có email"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${(user.role || "user").toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <label className="status-switch" title="Đổi trạng thái">
                      <input
                        type="checkbox"
                        checked={!!user.isActive}
                        onChange={() => toggleUser(user.id)}
                      />
                      <span className="status-slider" />
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn btn-edit" onClick={() => openEdit(user)} title="Chỉnh sửa">
                        <Edit size={14} />
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => removeUser(user.id)}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length > 0 && (
          <div className="table-footer">
            <p>Hiển thị {pageUsers.length} trên {filtered.length} người dùng</p>
            <div className="pagination-controls">
              <button
                type="button"
                className="page-arrow"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {visiblePages.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              {totalPages > maxPage && <span className="page-dots">...</span>}
              {totalPages > maxPage && (
                <button type="button" className="page-btn" onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </button>
              )}

              <button
                type="button"
                className="page-arrow"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalMode === "create" ? "Tạo Người Dùng" : "Chỉnh Sửa Người Dùng"}</h2>
            <div className="form-container">
              <div className="form-group">
                <label className="form-label">Họ và Tên</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>
              {modalMode === "create" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Vai Trò</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="form-input">
                  <option value="User">User</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn-submit" onClick={handleSubmit}>{modalMode === "create" ? "Tạo Mới" : "Cập Nhật"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
