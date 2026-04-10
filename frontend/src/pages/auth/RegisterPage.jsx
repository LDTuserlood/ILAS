import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showSuccess, showError } from "../../utils/notifications";
import "../../styles/auth/Register.css";

/* ================= CONSTANT ================= */
const NAME_REGEX = /^[A-Za-zÀ-ỹ\s]+$/;
const PHONE_REGEX = /^0\d+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 32;

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const newErrors = {};
    const { fullName, email, password, confirmPassword, phone } = formData;

    // Full name
    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    } else if (!NAME_REGEX.test(fullName)) {
      newErrors.fullName =
        "Họ và tên chỉ được chứa chữ cái, không số, không ký tự đặc biệt";
    }

    // Email
    if (!email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Password
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else {
      if (password.length < PASSWORD_MIN) {
        newErrors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự`;
      } else if (password.length > PASSWORD_MAX) {
        newErrors.password = `Mật khẩu tối đa ${PASSWORD_MAX} ký tự`;
      } else if (/\s/.test(password)) {
        newErrors.password = "Mật khẩu không được chứa khoảng trắng";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ in hoa";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ số";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
      } else if (password === password.toLowerCase()) {
        newErrors.password = "Mật khẩu không được chỉ gồm chữ thường";
      } else if (password === fullName || password === email) {
        newErrors.password = "Mật khẩu không được trùng với họ tên hoặc email";
      }
    }

    // Confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    // Phone
    if (phone) {
      if (!PHONE_REGEX.test(phone)) {
        newErrors.phone =
          "Số điện thoại phải bắt đầu bằng 0 và chỉ chứa chữ số";
      } else if (phone.length < 10) {
        newErrors.phone = "Số điện thoại tối thiểu 10 chữ số";
      } else if (phone.length > 11) {
        newErrors.phone = "Số điện thoại tối đa 11 chữ số";
      }
    }

    if (!agreed) {
      newErrors.agreed = "Bạn cần đồng ý với điều khoản trước khi tiếp tục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUsername = () => {
    const baseFromEmail = formData.email.split("@")[0] || "user";
    const normalized = baseFromEmail
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 12);
    return `${normalized || "user"}${Date.now().toString().slice(-4)}`;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName,
        username: formData.username || createUsername(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (!result.success) {
        if (result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          await showError(result.message || "Đăng ký thất bại", "Lỗi đăng ký");
        }
        return;
      }

      // Hiển thị thông báo thành công
      await showSuccess("Tài khoản của bạn đã được tạo thành công!", "Đăng ký thành công");
      
      // Điều hướng sau khi đăng ký thành công
      const role = result.user?.role || "User";
      const roleUpper = role.trim().toUpperCase();
      
      if (roleUpper === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (roleUpper === "EDITOR" || roleUpper === "MODERATOR") {
        navigate("/moderator/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const errorMessage = error.message || "Có lỗi xảy ra, vui lòng thử lại";
      await showError(errorMessage, "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="register-v2-shell">
      <main className="register-v2-main">
        <section className="register-v2-left" aria-label="ILAS introduction">
          <Link to="/" className="register-v2-brand" aria-label="ILAS Home">
            <img src="/image/icon.png" alt="ILAS" className="register-v2-brand-icon" />
            <span>ILAS</span>
          </Link>

          <div className="register-v2-content">
            <h1>
              Bảo vệ công lý cho <span>mọi người lao động,</span> ở mọi nơi.
            </h1>
            <p>
              Tham gia cộng đồng toàn cầu cam kết vì tiêu chuẩn pháp lý quốc tế và bảo vệ quyền
              lợi người lao động.
            </p>

            <div className="register-v2-feature-row" aria-label="Platform highlights">
              <article className="register-v2-feature-item">
                <h3>An toàn pháp lý</h3>
                <p>Quản lý vụ việc với lớp bảo mật mã hóa.</p>
              </article>
              <article className="register-v2-feature-item">
                <h3>Mạng lưới toàn cầu</h3>
                <p>Kết nối chuyên gia tại hơn 150 quốc gia.</p>
              </article>
            </div>
          </div>
        </section>

        <aside className="register-v2-right" aria-label="Create account form">
          <div className="register-v2-right-inner">
            <h2>Tạo tài khoản của bạn</h2>
            <p className="register-v2-subtitle">Chào mừng đến với không gian hỗ trợ pháp lý an toàn.</p>

            <form onSubmit={handleSubmit} className="register-v2-form" noValidate>
              <label className="register-v2-label" htmlFor="fullName">
                Họ và tên
              </label>
              <div className="register-v2-field">
                <span className="register-v2-icon" aria-hidden="true">👤</span>
                <input
                  id="fullName"
                  className="register-v2-input"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}

              <label className="register-v2-label" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="register-v2-field">
                <span className="register-v2-icon" aria-hidden="true">@</span>
                <input
                  id="username"
                  className="register-v2-input"
                  name="username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="error-message">{errors.username}</span>}

              <label className="register-v2-label" htmlFor="email">
                Địa chỉ email
              </label>
              <div className="register-v2-field">
                <span className="register-v2-icon" aria-hidden="true">✉</span>
                <input
                  id="email"
                  className="register-v2-input"
                  name="email"
                  placeholder="tenban@congty.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}

              <div className="register-v2-grid-2">
                <div>
                  <label className="register-v2-label" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="register-v2-field register-v2-password-field">
                    <span className="register-v2-icon" aria-hidden="true">🔒</span>
                    <input
                      id="password"
                      className="register-v2-input"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="........"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button type="button" className="register-v2-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div>
                  <label className="register-v2-label" htmlFor="confirmPassword">
                    Xác nhận mật khẩu
                  </label>
                  <div className="register-v2-field register-v2-password-field">
                    <span className="register-v2-icon" aria-hidden="true">🔁</span>
                    <input
                      id="confirmPassword"
                      className="register-v2-input"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="........"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="register-v2-eye"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <label className="register-v2-label" htmlFor="phone">
                Số điện thoại (không bắt buộc)
              </label>
              <div className="register-v2-field">
                <span className="register-v2-icon" aria-hidden="true">☎</span>
                <input
                  id="phone"
                  className="register-v2-input"
                  name="phone"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}

              <label className="register-v2-agreement">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span>
                  Tôi đồng ý với <a href="#terms">Điều khoản dịch vụ</a> và <a href="#privacy">Chính sách quyền riêng tư</a>.
                </span>
              </label>
              {errors.agreed && <span className="error-message">{errors.agreed}</span>}

              <button className="register-v2-btn" disabled={loading}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản  →"}
              </button>

              <div className="register-v2-divider" />
            </form>

            <p className="register-v2-signin">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </aside>
      </main>

      <footer className="register-v2-footer">
        <span>© 2024 International Legal Assistance for Workers (ILAS). Bảo lưu mọi quyền.</span>
        <div className="register-v2-footer-links">
          <a href="#privacy">Chính sách quyền riêng tư</a>
          <a href="#terms">Điều khoản dịch vụ</a>
          <a href="#cookies">Chính sách cookie</a>
          <a href="#accessibility">Trợ năng</a>
        </div>
      </footer>
    </div>
  );
}
