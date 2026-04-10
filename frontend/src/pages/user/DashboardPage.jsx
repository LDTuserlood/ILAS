import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UserSidebar from "../../components/user/UserSidebar";
import "../../styles/user/DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      navigate("/search");
      return;
    }
    navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
  };

  const displayName = user?.fullName || user?.username || "Người dùng";

  const recentActivities = [
    {
      title: "Quy định về thời giờ nghỉ ngơi",
      subtitle: "Tra cứu cách đây 2 giờ • Bộ Luật Lao Động 2019",
    },
    {
      title: "Cách tính bảo hiểm xã hội 1 lần",
      subtitle: "Tư vấn AI cách đây 1 ngày • Hoàn thành",
    },
    {
      title: "Mẫu đơn xin nghỉ việc đúng luật",
      subtitle: "Tra cứu cách đây 3 ngày • Tài nguyên",
    },
  ];

  const popularResources = [
    {
      title: "Bộ Luật Lao Động 2019",
      subtitle: "Văn bản gốc & Giải thích dễ hiểu",
    },
    {
      title: "Luật Bảo hiểm xã hội",
      subtitle: "Cập nhật chế độ thai sản, ốm đau",
    },
    {
      title: "Mẫu Hợp đồng lao động",
      subtitle: "Các điều khoản cần lưu ý",
    },
  ];

  return (
    <div className="udash-page">
      <UserSidebar active="dashboard" />

      <main className="udash-main">
        <header className="udash-topbar">
          <form className="udash-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu, luật lao động..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="udash-user-card">
            <div>
              <div className="udash-user-name">{displayName}</div>
              <div className="udash-user-role">Công nhân</div>
            </div>
            <div className="udash-avatar">👤</div>
          </div>
        </header>

        <section className="udash-hero">
          <h1>Xin chào, {displayName}!</h1>
          <p>
            Chào mừng bạn quay lại với ILAS. Chúng tôi luôn sẵn sàng hỗ trợ bạn bảo vệ quyền lợi
            hợp pháp tại nơi làm việc. Bạn cần trợ giúp gì hôm nay?
          </p>
          <div className="udash-hero-actions">
            <button type="button" onClick={() => navigate("/chat/history")}>Bắt đầu tư vấn</button>
            <button type="button" className="ghost" onClick={() => navigate("/profile")}>
              Xem hồ sơ cá nhân
            </button>
          </div>
        </section>

        <section className="udash-grid-top">
          <article className="udash-ai-card" style={{ cursor: "pointer" }} onClick={() => navigate("/chat/history")}>
            <div className="udash-card-chip">Phản hồi nhanh</div>
            <h2>Trợ giúp từ AI</h2>
            <p>
              Đặt câu hỏi về luật lao động, tiền lương hoặc bảo hiểm và nhận câu trả lời ngay lập tức
              từ AI pháp lý của chúng tôi.
            </p>
            <div style={{ pointerEvents: "none" }}>
              <button type="button" tabIndex={-1} style={{ opacity: 0.7 }}>
                Hỏi thử: "Lương làm thêm giờ tính thế nào?"
              </button>
            </div>
          </article>

          <article className="udash-law-card">
            <h2>Tra cứu Pháp luật</h2>
            <p>Thư viện văn bản pháp luật đầy đủ nhất dành cho người lao động.</p>
            <button type="button" onClick={() => navigate("/search")}>Khám phá ngay</button>
          </article>
        </section>

        <section className="udash-dual-section">
          <div>
            <div className="udash-section-header">
              <h3>Hoạt động gần đây</h3>
              <button type="button" onClick={() => navigate("/chat/history")}>Xem tất cả</button>
            </div>

            <div className="udash-list">
              {recentActivities.map((item) => (
                <article className="udash-list-item" key={item.title}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                  <span aria-hidden="true">›</span>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="udash-section-header">
              <h3>Tài nguyên phổ biến</h3>
            </div>

            <div className="udash-list">
              {popularResources.map((item) => (
                <article className="udash-resource-item" key={item.title}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                </article>
              ))}

              <button type="button" className="udash-more-btn" onClick={() => navigate("/user/form")}>
                Khám phá thêm tài liệu
              </button>
            </div>
          </div>
        </section>

        <section className="udash-legal-tip">
          <img src="/image/Law.png" alt="Mẹo pháp lý" />
          <div>
            <span className="udash-tip-badge">MẸO PHÁP LÝ</span>
            <h3>Lưu ý khi ký phụ lục hợp đồng</h3>
            <p>
              Phụ lục hợp đồng lao động có hiệu lực như hợp đồng lao động. Tuy nhiên, phụ lục không
              được sửa đổi thời hạn của hợp đồng lao động đã giao kết. Luôn yêu cầu một bản sao có
              đóng dấu để lưu trữ.
            </p>
            <button type="button" onClick={() => navigate("/help")}>
              Tìm hiểu thêm
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
