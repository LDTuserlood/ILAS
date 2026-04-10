import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getChatHistory, sendChatMessage } from "../../api/chatbotAPI";
import ReactMarkdown from "react-markdown";
import UserSidebar from "../user/UserSidebar";
import "../../styles/user/DashboardPage.css";
import "../../styles/chatbot/ChatHistory.css";

export default function ChatHistoryPage() {
  const [groupedHistory, setGroupedHistory] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const scrollRef = useRef(null);
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "Người dùng";

  const historyDates = useMemo(() => Object.keys(groupedHistory), [groupedHistory]);
  const selectedLogs = selectedDate ? groupedHistory[selectedDate] || [] : [];
  const suggestionChips = [
    "Mức trợ cấp thôi việc là bao nhiêu?",
    "Thủ tục khiếu nại tại ILAS",
    "Mẫu đơn kiện sai quy trình",
  ];

  const loadHistory = async () => {
    if (!userId) return;

    try {
      const logs = await getChatHistory(userId);
      const grouped = {};

      logs.forEach((l) => {
        const time = l.createdAt || l.created_at;
        if (!time) return;

        const date = new Date(time).toLocaleDateString("vi-VN");
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(l);
      });

      setGroupedHistory(grouped);

      const dates = Object.keys(grouped);
      if (dates.length > 0) {
        setSelectedDate((prev) => prev || dates[dates.length - 1]);
      }
    } catch (e) {
      console.error("Lỗi load chat history:", e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedDate, groupedHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading || !userId) return;

    const question = input;
    setInput("");
    setLoading(true);

    try {
      await sendChatMessage(userId, question, true);
      await loadHistory();
    } catch {
      alert("Không thể gửi câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setSelectedDate(null);
    setInput("");
  };

  return (
    <div className="udash-page chatassist-shell">
      <UserSidebar active="chatbot" />

      <main className="chatassist-main">
        <header className="udash-topbar chatassist-topbar">
          <div className="chatassist-topbar-title">
            <span>LegalAssist AI</span>
            <span className="chatassist-status-pill">ACTIVE SECURE</span>
          </div>
          <div className="udash-user-card">
            <div>
              <div className="udash-user-name">{displayName}</div>
              <div className="udash-user-role">Công nhân</div>
            </div>
            <div className="udash-avatar">👤</div>
          </div>
        </header>

        <div className="chatassist-content">
          <section className="chatassist-history-bar">
            <button type="button" className={`chatassist-history-chip ${selectedDate === null ? "active" : ""}`} onClick={handleNewChat}>
              New Chat
            </button>
            {historyDates.map((date) => (
              <button
                key={date}
                type="button"
                className={`chatassist-history-chip ${selectedDate === date ? "active" : ""}`}
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </button>
            ))}
          </section>

          <div className="chatassist-thread" ref={scrollRef}>
            <div className="chatassist-bot-label">LEGALASSIST AI</div>
            <article className="chatassist-message bot intro">
              <p>
                Xin chào! Tôi là trợ lý pháp lý ảo của ILAS. Tôi có thể giúp bạn giải đáp các thắc mắc
                về quyền lợi lao động, hợp đồng và các quy định pháp luật hiện hành tại Việt Nam.
              </p>
              <p>Bạn đang cần hỗ trợ về vấn đề gì hôm nay?</p>
            </article>

            {selectedLogs.length === 0 && (
              <div className="chatassist-empty-state">
                Chưa có lịch sử chat nào. Hãy bắt đầu cuộc trò chuyện mới.
              </div>
            )}

            {selectedLogs.map((chatLog, index) => (
              <div key={`${selectedDate || "chat"}-${index}`} className="chatassist-block">
                <article className="chatassist-message user">
                  <p>{chatLog.question}</p>
                </article>
                <div className="chatassist-timestamp">Vừa gửi</div>

                <div className="chatassist-bot-label">LEGALASSIST AI</div>
                <article className="chatassist-message bot">
                  <div className="chatassist-markdown">
                    <ReactMarkdown>{chatLog.answer}</ReactMarkdown>
                  </div>

                  <div className="chatassist-reference-card">
                    <div className="chatassist-reference-title">Labor Code 2019</div>
                    <p>
                      Điều 36, quyền đơn phương chấm dứt hợp đồng lao động của người sử dụng lao động.
                      Người sử dụng lao động phải báo trước ít nhất 30 ngày đối với hợp đồng xác định thời hạn 12-36 tháng.
                    </p>
                    <button type="button" className="chatassist-reference-link">
                      Xem toàn bộ văn bản
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <section className="chatassist-suggestions">
            {suggestionChips.map((chip) => (
              <button key={chip} type="button" className="chatassist-suggestion-chip" onClick={() => setInput(chip)}>
                {chip}
              </button>
            ))}
          </section>

          <div className="chatassist-input-shell">
            <button type="button" className="chatassist-icon-btn" aria-label="Attach file">
              📎
            </button>
            <textarea
              className="chatassist-input"
              placeholder="Hỏi về quyền lợi lao động của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button type="button" className="chatassist-icon-btn" aria-label="Voice input">
              🎤
            </button>
            <button type="button" className="chatassist-send-btn" onClick={handleSend} disabled={loading}>
              {loading ? "..." : "➜"}
            </button>
          </div>

          <div className="chatassist-footer-note">
            PHẢN HỒI BỞI LEGALASSIST AI • DỮ LIỆU CẬP NHẬT THÁNG 10/2023
          </div>
        </div>
      </main>
    </div>
  );
}
