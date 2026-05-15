import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { lawAPI } from "../../api/law";
import "../../styles/user/UserSearchDetail.css";

const normalizeMode = (mode) => (mode === "summary" ? "summary" : "detail");

const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "--";

const splitContent = (content) => {
  if (!content) return [];
  return String(content)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const shortText = (value, max = 220) => {
  if (!value) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const UserSearchDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const searchBasePath = location.pathname.startsWith("/user") ? "/user/search" : "/search";

  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const mode = normalizeMode(searchParams.get("mode"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lawData, setLawData] = useState(null);
  const [articleData, setArticleData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [openChapter, setOpenChapter] = useState("all");
  const [openArticleId, setOpenArticleId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistoryLocal, setChatHistoryLocal] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id || id === "undefined" || !type) {
        setError("Thiếu hoặc sai thông tin ID/loại dữ liệu.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setLawData(null);
      setArticleData(null);
      setArticles([]);

      try {
        if (type === "article") {
          const articleResponse = await lawAPI.getArticleById(id);
          if (!articleResponse.success || !articleResponse.data) {
            setError("Không tìm thấy thông tin điều luật.");
            return;
          }

          const article = articleResponse.data;
          setArticleData(article);

          const lawResponse = await lawAPI.getLawById(article.lawId);
          if (lawResponse.success) setLawData(lawResponse.data);

          const articlesResponse = await lawAPI.getArticlesByLawId(article.lawId);
          if (articlesResponse.success && Array.isArray(articlesResponse.data)) {
            setArticles(articlesResponse.data);
          }
          setOpenArticleId(article.articleId);
          return;
        }

        const lawResponse = await lawAPI.getLawById(id);
        if (!lawResponse.success || !lawResponse.data) {
          setError("Không tìm thấy thông tin bộ luật.");
          return;
        }

        setLawData(lawResponse.data);

        const articlesResponse = await lawAPI.getArticlesByLawId(id);
        if (articlesResponse.success && Array.isArray(articlesResponse.data)) {
          setArticles(articlesResponse.data);
        }
      } catch (loadError) {
        console.error("Error loading data:", loadError);
        setError(loadError?.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);
    loadData();
  }, [id, type]);

  const chapterGroups = useMemo(() => {
    const map = new Map();
    articles.forEach((article) => {
      const key = article.chapterId || "none";
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: article.chapterTitle || "Chưa phân chương",
          articles: [],
        });
      }
      map.get(key).articles.push(article);
    });
    return Array.from(map.values());
  }, [articles]);

  const visibleGroups = useMemo(() => {
    if (openChapter === "all") return chapterGroups;
    return chapterGroups.filter((chapter) => String(chapter.id) === String(openChapter));
  }, [chapterGroups, openChapter]);

  const lawSummary = useMemo(() => {
    if (!lawData) return [];
    const sampleArticles = articles.slice(0, 4).map((article) => article.articleTitle).filter(Boolean);
    return [
      `${lawData.title} là văn bản pháp luật ${lawData.code ? `số ${lawData.code}` : ""}, có hiệu lực từ ${formatDate(lawData.effectiveDate)}.`,
      `Dữ liệu hiện có ${chapterGroups.length} chương và ${articles.length} điều để người dùng tra cứu hoặc hỏi chatbot.`,
      sampleArticles.length
        ? `Một số nội dung nổi bật: ${sampleArticles.join("; ")}.`
        : "Bộ luật này hiện chưa có danh sách điều luật chi tiết trong hệ thống.",
      "Nếu cần hỏi tình huống cụ thể, hãy chuyển sang Chatbot để AI trả lời theo dữ liệu của bộ luật này.",
    ];
  }, [lawData, articles, chapterGroups.length]);

  const title = type === "article" ? articleData?.articleTitle : lawData?.title;
  const subtitle = lawData
    ? `${lawData.lawType || "Văn bản"} - ${lawData.code || "Chưa có số hiệu"} - Hiệu lực: ${formatDate(lawData.effectiveDate)}`
    : "";

  const switchMode = (nextMode) => {
    const lawId = type === "article" ? articleData?.lawId : id;
    if (!lawId) return;
    navigate(`${searchBasePath}/detail?id=${lawId}&type=law&mode=${nextMode}`);
  };

  const sendChat = async () => {
    const question = chatInput.trim();
    if (!question) return;
    const uid = user?.userId || parseInt(localStorage.getItem("userId"), 10) || null;
    const contextPrefix = lawData?.title ? `Trong ${lawData.title}: ` : "";
    const payload = { userId: uid, question: `${contextPrefix}${question}`, saveLog: true };

    setChatHistoryLocal((history) => [...history, { sender: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const answer = data?.answer || "Rất tiếc, hệ thống chưa trả lời được câu hỏi này.";
      setChatHistoryLocal((history) => [...history, { sender: "bot", text: answer }]);
    } catch (chatError) {
      console.error("Chatbot ask failed", chatError);
      setChatHistoryLocal((history) => [...history, { sender: "bot", text: "Có lỗi khi kết nối tới chatbot." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChat();
    }
  };

  if (loading) {
    return (
      <div className="userdetail-page">
        <div className="userdetail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="userdetail-page">
        <div className="userdetail-error">
          <h3>Lỗi</h3>
          <p>{error}</p>
          <button className="userdetail-back-btn" onClick={() => navigate(searchBasePath)}>
            Quay lại tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="userdetail-page">
      <UserSidebar active="search" />

      <main className="userdetail-main">
        <section className="userdetail-workspace">
          <div className="userdetail-center">
            <div className="userdetail-title-row">
              <div>
                <button className="userdetail-back-link" type="button" onClick={() => navigate(searchBasePath)}>
                  Quay lại tra cứu
                </button>
                <h1>{mode === "summary" ? "Tóm tắt bộ luật" : "Chi tiết văn bản"}</h1>
                <p>{title}</p>
              </div>
              <div className="userdetail-mode-actions">
                <button className={mode === "detail" ? "active" : ""} onClick={() => switchMode("detail")}>
                  Xem chi tiết
                </button>
                <button className={mode === "summary" ? "active" : ""} onClick={() => switchMode("summary")}>
                  Tóm tắt bộ luật
                </button>
              </div>
            </div>

            <div className="userdetail-meta-strip">
              <span>{subtitle}</span>
              <span>{chapterGroups.length} chương</span>
              <span>{articles.length} điều</span>
            </div>

            {mode === "summary" ? (
              <article className="userdetail-summary-page">
                <h2>{lawData?.title}</h2>
                <div className="summary-content-body">
                  {lawSummary.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
                <button className="userdetail-chat-cta" onClick={() => navigate("/chat/history")}>
                  Hỏi chi tiết trong Chatbot
                </button>
              </article>
            ) : (
              <div className="userdetail-law-reader">
                <aside className="userdetail-chapter-list">
                  <button className={openChapter === "all" ? "active" : ""} onClick={() => setOpenChapter("all")}>
                    Tất cả ({articles.length})
                  </button>
                  {chapterGroups.map((chapter) => (
                    <button
                      key={chapter.id}
                      className={String(openChapter) === String(chapter.id) ? "active" : ""}
                      onClick={() => setOpenChapter(chapter.id)}
                    >
                      {chapter.title} ({chapter.articles.length})
                    </button>
                  ))}
                </aside>

                <section className="userdetail-article-reader">
                  {type === "article" && articleData ? (
                    <article className="law-reader-article selected">
                      <h2>{articleData.articleTitle}</h2>
                      <div className="userdetail-content-body expanded">
                        {splitContent(articleData.content).map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </article>
                  ) : null}

                  {visibleGroups.map((chapter) => (
                    <div className="law-reader-chapter" key={chapter.id}>
                      <h2>{chapter.title}</h2>
                      {chapter.articles.map((article) => {
                        const expanded = openArticleId === article.articleId;
                        return (
                          <article className="law-reader-article" key={article.articleId}>
                            <button
                              className="law-reader-article-title"
                              type="button"
                              onClick={() => setOpenArticleId(expanded ? null : article.articleId)}
                            >
                              <strong>{article.articleNumber || "Điều"}</strong>
                              <span>{article.articleTitle || "Chưa có tiêu đề"}</span>
                            </button>
                            {expanded ? (
                              <div className="userdetail-content-body expanded">
                                {splitContent(article.content).map((line, index) => (
                                  <p key={index}>{line}</p>
                                ))}
                              </div>
                            ) : (
                              <p className="law-reader-preview">{shortText(article.content)}</p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>

          <aside className="userdetail-chat-column">
            <div className="chat-column-header">Legal Assistant</div>
            <div className="chat-column-body">
              {chatHistoryLocal.map((message, index) => (
                <div key={index} className={`chat-msg ${message.sender}`}>
                  <div className="chat-msg-text">{message.text}</div>
                </div>
              ))}
              {chatHistoryLocal.length === 0 && (
                <div className="chat-msg bot">
                  <div className="chat-msg-text">
                    Bạn có thể hỏi chi tiết về tình huống cụ thể sau khi xem tóm tắt hoặc nội dung luật.
                  </div>
                </div>
              )}
            </div>

            <div className="userdetail-chatbot-form">
              <textarea
                className="userdetail-chatbot-input"
                placeholder="Hỏi chi tiết về bộ luật này..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={handleChatKey}
                rows={1}
              />
              <button className="userdetail-chatbot-send" onClick={sendChat} disabled={chatLoading}>
                {chatLoading ? "..." : "➤"}
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default UserSearchDetail;
