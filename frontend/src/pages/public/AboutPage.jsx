import React, { useState, useEffect, useRef } from "react";
import "../../styles/public/AboutPage.css";

const AboutPage = () => {
  // Counter animation states
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [statsCounts, setStatsCounts] = useState({
    users: 0,
    questions: 0,
    documents: 0,
    satisfaction: 0
  });
  const [isStatsAnimating, setIsStatsAnimating] = useState(false);
  const [isStatsCompleted, setIsStatsCompleted] = useState(false);
  
  const statsRef = useRef(null);

  // Target values for stats
  const statsTargetValues = {
    users: 1000,
    questions: 600,
    documents: 500,
    satisfaction: 99
  };

  // Animation duration in milliseconds
  const statsAnimationDuration = 2000;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection Observer triggered:', entry.isIntersecting, 'isStatsVisible:', isStatsVisible);
        if (entry.isIntersecting && !isStatsVisible) {
          console.log('Starting animation from intersection observer');
          setIsStatsVisible(true);
          startStatsAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      console.log('Observing stats section');
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isStatsVisible]);

  const startStatsAnimation = () => {
    console.log('Starting stats animation with targets:', statsTargetValues);
    setIsStatsAnimating(true);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / statsAnimationDuration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const newUsers = Math.floor(statsTargetValues.users * easeOutCubic);
      const newQuestions = Math.floor(statsTargetValues.questions * easeOutCubic);
      const newDocuments = Math.floor(statsTargetValues.documents * easeOutCubic);
      const newSatisfaction = Math.floor(statsTargetValues.satisfaction * easeOutCubic);
      
      const counts = {
        users: isNaN(newUsers) ? 0 : newUsers,
        questions: isNaN(newQuestions) ? 0 : newQuestions,
        documents: isNaN(newDocuments) ? 0 : newDocuments,
        satisfaction: isNaN(newSatisfaction) ? 0 : newSatisfaction
      };
      
      console.log('Animation progress:', progress, 'Counts:', counts);
      setStatsCounts(counts);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation completed
        console.log('Animation completed');
        setIsStatsAnimating(false);
        setIsStatsCompleted(true);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Về chúng tôi</h1>
          <p className="about-hero-subtitle">
            Hệ thống hỗ trợ pháp lý toàn diện cho người lao động Việt Nam
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="about-container">
        {/* Introduction Section */}
        <section className="about-section">
          <div className="about-section-content">
            <h2>Giới thiệu chung</h2>
            <div className="about-intro">
              <p>
                ILAS (Legal Support System for Workers) là một nền tảng công nghệ tiên tiến 
                được phát triển nhằm hỗ trợ người lao động và tổ chức công đoàn tại Việt Nam 
                trong việc tra cứu, tìm hiểu và áp dụng các quy định pháp luật lao động.
              </p>
              <p>
                Với sứ mệnh "Công bằng pháp lý cho mọi người lao động", chúng tôi cam kết 
                cung cấp các dịch vụ tư vấn pháp lý miễn phí, dễ tiếp cận và chính xác, 
                giúp người lao động bảo vệ quyền lợi hợp pháp của mình.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="about-section about-mission">
          <div className="about-section-content">
            <div className="mission-grid">
              <div className="mission-card">
                <div className="mission-icon">🎯</div>
                <h3>Sứ mệnh</h3>
                <p>
                  Cung cấp nền tảng công nghệ toàn diện để hỗ trợ người lao động 
                  tiếp cận thông tin pháp lý một cách dễ dàng, nhanh chóng và chính xác.
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">👁️</div>
                <h3>Tầm nhìn</h3>
                <p>
                  Trở thành hệ thống hỗ trợ pháp lý hàng đầu tại Việt Nam, 
                  góp phần xây dựng một môi trường lao động công bằng và minh bạch.
                </p>
              </div>
              <div className="mission-card">
                <div className="mission-icon">💎</div>
                <h3>Giá trị cốt lõi</h3>
                <p>
                  Công bằng, minh bạch, chính xác và dễ tiếp cận. 
                  Chúng tôi đặt quyền lợi người lao động lên hàng đầu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-section">
          <div className="about-section-content">
            <h2>Tính năng nổi bật</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <h4>Tìm kiếm thông minh</h4>
                <p>
                  Công nghệ AI tiên tiến giúp tìm kiếm và tra cứu văn bản pháp luật 
                  một cách nhanh chóng và chính xác.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <h4>Trợ lý AI</h4>
                <p>
                  Hệ thống chatbot thông minh có thể trả lời các câu hỏi pháp lý 
                  phức tạp 24/7.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📄</div>
                <h4>Biểu mẫu miễn phí</h4>
                <p>
                  Cung cấp các mẫu đơn, biểu mẫu pháp lý chuẩn để người lao động 
                  sử dụng khi cần thiết.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <h4>Thư viện pháp luật</h4>
                <p>
                  Cơ sở dữ liệu pháp luật lao động đầy đủ, được cập nhật thường xuyên 
                  và dễ dàng tra cứu.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <h4>Tư vấn chuyên nghiệp</h4>
                <p>
                  Kết nối với các luật sư và chuyên gia pháp lý có kinh nghiệm 
                  trong lĩnh vực lao động.
                </p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h4>Đa nền tảng</h4>
                <p>
                  Hỗ trợ đầy đủ trên web, mobile, tablet với giao diện thân thiện 
                  và dễ sử dụng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="about-section about-stats" ref={statsRef}>
          <div className="about-section-content">
            <h2>Thành tựu của chúng tôi</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className={`stat-number counter-number ${isStatsAnimating ? 'animating' : ''} ${isStatsCompleted ? 'completed' : ''}`}>
                  {isNaN(statsCounts.users) ? '0' : statsCounts.users.toLocaleString()}+
                </div>
                <div className="stat-label">Người dùng đã tin tưởng</div>
              </div>
              <div className="stat-item">
                <div className={`stat-number counter-number ${isStatsAnimating ? 'animating' : ''} ${isStatsCompleted ? 'completed' : ''}`}>
                  {isNaN(statsCounts.questions) ? '0' : statsCounts.questions.toLocaleString()}+
                </div>
                <div className="stat-label">Câu hỏi đã được giải đáp</div>
              </div>
              <div className="stat-item">
                <div className={`stat-number counter-number ${isStatsAnimating ? 'animating' : ''} ${isStatsCompleted ? 'completed' : ''}`}>
                  {isNaN(statsCounts.documents) ? '0' : statsCounts.documents.toLocaleString()}+
                </div>
                <div className="stat-label">Văn bản pháp luật</div>
              </div>
              <div className="stat-item">
                <div className={`stat-number counter-number ${isStatsAnimating ? 'animating' : ''} ${isStatsCompleted ? 'completed' : ''}`}>
                  {isNaN(statsCounts.satisfaction) ? '0' : statsCounts.satisfaction}%
                </div>
                <div className="stat-label">Độ hài lòng của người dùng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section">
          <div className="about-section-content">
            <h2>Đội ngũ phát triển</h2>
            <div className="team-intro">
              <p>
                Chúng tôi là một nhóm các chuyên gia công nghệ, luật sư và chuyên gia 
                pháp lý có kinh nghiệm, cùng nhau xây dựng nên hệ thống hỗ trợ pháp lý 
                toàn diện này.
              </p>
            </div>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👨‍💼</div>
                <h4>Nguyễn Tấn Tín</h4>
                <p className="member-role">Trưởng nhóm phát triển</p>
                <p className="member-desc">
                  Chuyên gia công nghệ với 10+ năm kinh nghiệm trong lĩnh vực AI và Machine Learning.
                </p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍💼</div>
                <h4>Đỗ Đăng Hưng</h4>
                <p className="member-role">Chuyên gia pháp lý</p>
                <p className="member-desc">
                  Luật sư có kinh nghiệm 15+ năm trong lĩnh vực luật lao động và bảo vệ quyền lợi người lao động.
                </p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍💻</div>
                <h4>Lê Minh Hiếu</h4>
                <p className="member-role">Kỹ sư phần mềm</p>
                <p className="member-desc">
                  Chuyên gia phát triển web và mobile với kinh nghiệm trong các dự án lớn.
                </p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👨‍💻</div>
                <h4>Nguyễn Thái Quang Huy</h4>
                <p className="member-role">Kỹ sư phần mềm</p>
                <p className="member-desc">
                  Chuyên gia phát triển web và mobile với kinh nghiệm trong các dự án lớn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section about-contact">
          <div className="about-section-content">
            <h2>Liên hệ với chúng tôi</h2>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>support@ilas.vn</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Điện thoại</h4>
                  <p>0123 456 789(Miễn phí)</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Địa chỉ</h4>
                  <p>Đại học Duy Tân, Đà Nẵng</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

