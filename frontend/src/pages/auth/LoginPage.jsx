import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccess, showError } from "../../utils/notifications";
import "../../styles/auth/Login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = "Username hoặc email không được để trống";
    }

    if (!formData.password) {
      newErrors.password = "Password không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        // Lấy user từ result.user
        const user = result.user;

        // Lưu token & thông tin người dùng
        localStorage.setItem("token", user.token);
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("username", user.username);
        localStorage.setItem("fullName", user.fullName);
        localStorage.setItem("role", user.role);

        // Hiển thị thông báo thành công
        await showSuccess("Chào mừng bạn quay trở lại!", "Đăng nhập thành công");

        // Chuẩn hóa role để điều hướng đúng
        const role = (user.role || "").trim().toUpperCase();

        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (role === "EDITOR" || role === "MODERATOR") {
          navigate("/moderator/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        // Hiển thị lỗi từ backend
        await showError(result.message || "Đăng nhập thất bại!", "Lỗi đăng nhập");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMessage = error.message || error.response?.data?.message || "Không thể kết nối đến server";
      await showError(errorMessage, "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login3-shell">
      <header className="login3-header">
        <Link to="/" className="login3-logo" aria-label="ILAS Home">
          ILAS
        </Link>

        <nav className="login3-nav" aria-label="Primary navigation">
          <a href="#solutions">Giải pháp</a>
          <a href="#resources">Tài nguyên</a>
          <a href="#about">Giới thiệu</a>
          <a href="#contact">Liên hệ</a>
        </nav>

        <div className="login3-top-actions">
          <Link to="/login" className="login3-login-link">
            Đăng nhập
          </Link>
          <Link to="/register" className="login3-signup-link">
            Đăng ký
          </Link>
        </div>
      </header>

      <main className="login3-main">
        <section className="login3-hero" aria-label="Platform introduction">
          <span className="login3-pill">Đồng hành vì công lý toàn cầu</span>
          <h1>
            Nơi bảo vệ số cho <span>quyền lợi người lao động.</span>
          </h1>
          <p>
            Tiếp cận tư vấn pháp lý, hỗ trợ vụ việc và tiêu chuẩn lao động xuyên biên giới trên một
            nền tảng bảo mật duy nhất.
          </p>

          <div className="login3-hero-actions">
            <Link to="/register" className="login3-primary-btn">
              Bảo vệ quyền lợi của tôi
            </Link>
            <a href="#about" className="login3-ghost-btn">
              Cách thức hoạt động
            </a>
          </div>
        </section>

        <section className="login3-card" aria-label="Sign in form">
          <h2>Chào mừng bạn quay lại</h2>
          <p>Đăng nhập để tiếp tục sử dụng nền tảng hỗ trợ pháp lý ILAS.</p>

          <form onSubmit={handleSubmit} className="login3-form" noValidate>
            <label className="login3-label" htmlFor="identifier">
              Tên đăng nhập hoặc email
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="tenban@congty.com"
              className="login3-input"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.identifier && <span className="error-message">{errors.identifier}</span>}

            <div className="login3-pass-row">
              <label className="login3-label" htmlFor="password">
                Mật khẩu
              </label>
              <a href="#forgot" className="login3-forgot">
                Quên mật khẩu?
              </a>
            </div>

            <div className="login3-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="........"
                className="login3-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
                aria-label="Mật khẩu"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login3-eye"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}

            <label className="login3-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>

            <button type="submit" className="login3-btn" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="login3-signup-text">
              Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
            </p>
          </form>
        </section>
      </main>

      <footer className="login3-footer" id="contact">
        <span>&copy; 2024 International Legal Assistance for Workers (ILAS). Bảo lưu mọi quyền.</span>
        <div>
          <a href="#privacy">Chính sách quyền riêng tư</a>
          <a href="#terms">Điều khoản dịch vụ</a>
          <a href="#cookies">Chính sách cookie</a>
          <a href="#accessibility">Trợ năng</a>
        </div>
      </footer>
    </div>
  );
}
