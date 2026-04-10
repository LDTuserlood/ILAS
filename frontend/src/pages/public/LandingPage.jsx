import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/public/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="landing3-page" id="home">
      <header className="landing3-header">
        <Link to="/" className="landing3-logo" aria-label="ILAS Home">
          ILAS
        </Link>
        <nav className="landing3-nav" aria-label="Primary navigation">
          <a href="#solutions">Giải pháp</a>
          <a href="#resources">Tài nguyên</a>
          <a href="#about">Giới thiệu</a>
          <a href="#contact">Liên hệ</a>
        </nav>
        <div className="landing3-auth-links">
          {isAuthenticated ? (
            <div className="landing3-user-actions-wrap">
              <div className="landing3-user-badge" aria-label="User info">
                <span className="landing3-user-avatar" aria-hidden="true">👤</span>
                <span className="landing3-user-greeting">Xin chào, {user?.fullName || user?.username}</span>
              </div>
              <div className="landing3-user-actions">
                <Link to="/user/dashboard" className="landing3-dashboard-link">
                  Bảng điều khiển
                </Link>
                <button type="button" className="landing3-logout-link" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="landing3-login-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="landing3-signup-link">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="landing3-hero">
        <div className="landing3-hero-left">
          <span className="landing3-pill">Đồng hành vì công lý toàn cầu</span>
          <h1>
            Nơi bảo vệ số cho <span>quyền lợi người lao động.</span>
          </h1>
          <p>
            Việc tiếp cận luật lao động quốc tế không nên là rào cản. ILAS mang đến sự minh bạch
            pháp lý và hỗ trợ chuyên gia mà người lao động xứng đáng có được, ở bất kỳ đâu trên thế giới.
          </p>

          <div className="landing3-hero-actions">
            <Link to={isAuthenticated ? "/user/dashboard" : "/register"} className="landing3-primary-btn">
              {isAuthenticated ? "Đi tới bảng điều khiển" : "Bảo vệ quyền lợi của tôi"}
            </Link>
            <a href="#about" className="landing3-ghost-btn">
              Cách thức hoạt động
            </a>
          </div>
        </div>

        <div className="landing3-hero-right" aria-label="Hero illustration">
          <div className="landing3-hero-card">
            <img src="/image/Law.png" alt="Đội ngũ hỗ trợ pháp lý" />
          </div>
          <article className="landing3-float-card">
            <h3>Giải quyết vụ việc</h3>
            <p>Hơn 15.000 vụ việc được xử lý theo tiêu chuẩn pháp lý toàn cầu trong năm 2024.</p>
          </article>
        </div>
      </section>

      <section className="landing3-services" id="solutions">
        <h2>Dịch vụ của chúng tôi</h2>
        <p>
          Bộ công cụ tích hợp giúp đơn giản hóa quy trình pháp lý phức tạp và tiếp sức cho hành
          trình nghề nghiệp của bạn.
        </p>

        <div className="landing3-service-grid">
          <article className="landing3-card landing3-card-wide">
            <h3>Tìm kiếm pháp lý bằng AI</h3>
            <p>
              Truy cập tức thì vào cơ sở dữ liệu chuyên sâu về luật lao động quốc tế, được đối chiếu
              với đặc thù pháp lý tại từng địa phương.
            </p>
            <Link to="/search">Dùng thử tìm kiếm thông minh</Link>
          </article>

          <article className="landing3-card landing3-card-accent">
            <h3>Tư vấn chuyên gia</h3>
            <p>Kết nối với luật sư lao động tại 45 quốc gia để được tư vấn 1:1.</p>
            <button type="button">Đặt lịch tư vấn</button>
          </article>

          <article className="landing3-card">
            <h3>Kho tài nguyên</h3>
            <p>Mẫu hợp đồng, thư khiếu nại và cẩm nang đàm phán đầy đủ, dễ áp dụng.</p>
          </article>

          <article className="landing3-card landing3-card-wide landing3-card-soft">
            <h3>Theo dõi tuân thủ</h3>
            <p>
              Cảnh báo tự động khi luật lao động địa phương thay đổi và ảnh hưởng đến ngành nghề
              hoặc vị trí công việc của bạn.
            </p>
            <button type="button">Nhận cảnh báo</button>
          </article>
        </div>
      </section>

      <section className="landing3-trust" id="about">
        <div className="landing3-trust-image-wrap">
          <img src="/image/Law.png" alt="Hướng dẫn pháp lý đáng tin cậy" className="landing3-trust-image" />
        </div>

        <div className="landing3-trust-content">
          <h2>
            Vì sao người lao động tin tưởng <span>ILAS</span>
          </h2>
          <ul>
            <li>
              <h3>Bảo vệ khách quan</h3>
              <p>Chúng tôi độc lập với lợi ích doanh nghiệp và các cơ quan quản lý.</p>
            </li>
            <li>
              <h3>Mạng lưới toàn cầu</h3>
              <p>Chuyên môn pháp lý tại hơn 45 quốc gia, đi kèm bối cảnh địa phương.</p>
            </li>
            <li>
              <h3>Chi phí minh bạch</h3>
              <p>Gói dịch vụ theo cấp độ, giúp hỗ trợ pháp lý chất lượng cao trở nên dễ tiếp cận hơn.</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="landing3-cta" id="resources">
        <h2>Bảo vệ tương lai của bạn ngay hôm nay.</h2>
        <p>
          Tham gia cùng hàng nghìn người lao động đã tìm lại sự an tâm nhờ tư vấn pháp lý chuyên
          nghiệp. Buổi tư vấn đầu tiên hoàn toàn miễn phí.
        </p>
        <div className="landing3-cta-actions">
          <Link to="/register" className="landing3-cta-main-btn">
            Tạo tài khoản miễn phí
          </Link>
          <a href="#contact" className="landing3-cta-ghost-btn">
            Liên hệ tư vấn
          </a>
        </div>
        <div className="landing3-cta-note">
          <span>Dữ liệu an toàn</span>
          <span>Tuân thủ GDPR</span>
          <span>Chuyên gia đã xác minh</span>
        </div>
      </section>

      <footer className="landing3-footer" id="contact">
        <div className="landing3-footer-columns">
          <div>
            <h3>ILAS</h3>
            <p>Định hình tiêu chuẩn mới về khả năng tiếp cận pháp lý cho lực lượng lao động toàn cầu.</p>
          </div>
          <div>
            <h4>Giải pháp</h4>
            <a href="#solutions">Tìm kiếm AI</a>
            <a href="#solutions">Mạng lưới luật sư</a>
            <a href="#solutions">Quản lý vụ việc</a>
            <a href="#solutions">Doanh nghiệp</a>
          </div>
          <div>
            <h4>Tài nguyên</h4>
            <a href="#resources">Cẩm nang pháp lý</a>
            <a href="#resources">Hội thảo trực tuyến</a>
            <a href="#resources">Biểu mẫu</a>
            <a href="#resources">Quyền riêng tư</a>
          </div>
          <div>
            <h4>Bản tin</h4>
            <p>Cập nhật các thay đổi mới nhất của luật lao động toàn cầu.</p>
            <form className="landing3-newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Địa chỉ email" aria-label="Địa chỉ email" />
              <button type="submit" aria-label="Đăng ký nhận tin">
                &gt;
              </button>
            </form>
          </div>
        </div>

        <div className="landing3-footer-bottom">
          <span>© 2024 International Legal Assistance for Workers ILAS. Bảo lưu mọi quyền.</span>
          <div>
            <a href="#privacy">Chính sách quyền riêng tư</a>
            <a href="#terms">Điều khoản dịch vụ</a>
            <a href="#cookies">Chính sách cookie</a>
            <a href="#accessibility">Trợ năng</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
