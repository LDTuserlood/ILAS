import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getChatHistory, sendChatMessage } from "../../api/chatbotAPI";
import ReactMarkdown from "react-markdown";
import UserSidebar from "../user/UserSidebar";
import "../../styles/user/DashboardPage.css";
import "../../styles/chatbot/ChatHistory.css";

function shortTitle(question = "") {
  const text = (question || "Cuộc trò chuyện mới").trim();
  if (text.length <= 36) return text;
  return `${text.slice(0, 36)}...`;
}

function toDateValue(value) {
  return value ? new Date(value).getTime() || 0 : 0;
}

function formatChipDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function formatMessageTime(value) {
  if (!value) return "Vừa gửi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa gửi";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatHistoryPage() {
  const [conversations, setConversations] = useState({});
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const scrollRef = useRef(null);
  const draftConversationRef = useRef(null);
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "Người dùng";

  const conversationList = useMemo(() => {
    return Object.values(conversations)
      .sort((a, b) => toDateValue(b.updatedAt) - toDateValue(a.updatedAt));
  }, [conversations]);

  const selectedLogs = selectedConversationId
    ? conversations[selectedConversationId]?.logs || []
    : [];

  const suggestionChips = [
    "Mức trợ cấp thôi việc là bao nhiêu?",
    "Thủ tục khiếu nại tại ILAS",
    "Mẫu đơn kiện sai quy trình",
  ];

  const createConversationId = () => `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const getDeletedConversationStorageKey = () => `chat-deleted-conversations-${userId || "guest"}`;

  const getDeletedConversationIds = () => {
    try {
      const raw = localStorage.getItem(getDeletedConversationStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveDeletedConversationIds = (ids) => {
    localStorage.setItem(getDeletedConversationStorageKey(), JSON.stringify(ids));
  };

  const loadHistory = async () => {
    if (!userId) return;

    try {
      const logs = await getChatHistory(userId);
      const next = {};
      const deletedConversationIds = new Set(getDeletedConversationIds());

      logs.forEach((l) => {
        const createdAt = l.createdAt || l.created_at || new Date().toISOString();
        const fallbackLegacyGroup = `legacy-${new Date(createdAt).toLocaleDateString("vi-VN")}`;
        const conversationId = (l.conversationId || "").trim() || fallbackLegacyGroup;

        if (deletedConversationIds.has(conversationId)) {
          return;
        }

        if (!next[conversationId]) {
          next[conversationId] = {
            id: conversationId,
            title: shortTitle(l.question),
            createdAt,
            updatedAt: createdAt,
            logs: [],
          };
        }

        next[conversationId].logs.push(l);
        if (toDateValue(createdAt) > toDateValue(next[conversationId].updatedAt)) {
          next[conversationId].updatedAt = createdAt;
        }
      });

      Object.values(next).forEach((c) => {
        c.logs.sort((a, b) => toDateValue(a.createdAt || a.created_at) - toDateValue(b.createdAt || b.created_at));
      });

      setConversations(next);
      setSelectedConversationId((prev) => {
        if (prev && next[prev]) return prev;
        const latest = Object.values(next).sort((a, b) => toDateValue(b.updatedAt) - toDateValue(a.updatedAt))[0];
        return latest ? latest.id : null;
      });
    } catch (e) {
      console.error("Lỗi load chat history:", e);
    }
  };

  const handleDeleteConversation = (conversationId) => {
    if (!conversationId || loading) return;

    const confirmed = window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này không?");
    if (!confirmed) return;

    const deletedIds = getDeletedConversationIds();
    if (!deletedIds.includes(conversationId)) {
      saveDeletedConversationIds([...deletedIds, conversationId]);
    }

    setConversations((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });

    setSelectedConversationId((prev) => {
      if (prev !== conversationId) return prev;
      const remaining = conversationList.filter((c) => c.id !== conversationId);
      return remaining[0]?.id || null;
    });

    if (draftConversationRef.current === conversationId) {
      draftConversationRef.current = null;
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversationId, conversations]);

  const handleSend = async () => {
    if (!input.trim() || loading || !userId) return;

    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      let conversationId = selectedConversationId;

      if (!conversationId) {
        conversationId = createConversationId();
        draftConversationRef.current = conversationId;
        const nowIso = new Date().toISOString();
        setConversations((prev) => ({
          ...prev,
          [conversationId]: {
            id: conversationId,
            title: shortTitle(question),
            createdAt: nowIso,
            updatedAt: nowIso,
            logs: [],
          },
        }));
        setSelectedConversationId(conversationId);
      }

      const data = await sendChatMessage(userId, question, true, conversationId);
      const nowIso = new Date().toISOString();
      const newLog = {
        conversationId,
        question,
        answer: data?.answer || "⚠️ AI chưa trả về nội dung.",
        createdAt: nowIso,
      };

      setConversations((prev) => {
        const existing = prev[conversationId] || {
          id: conversationId,
          title: shortTitle(question),
          createdAt: nowIso,
          updatedAt: nowIso,
          logs: [],
        };

        return {
          ...prev,
          [conversationId]: {
            ...existing,
            title: existing.logs.length === 0 ? shortTitle(question) : existing.title,
            updatedAt: nowIso,
            logs: [...existing.logs, newLog],
          },
        };
      });

      if (draftConversationRef.current === conversationId) {
        draftConversationRef.current = null;
      }
    } catch {
      alert("Không thể gửi câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const conversationId = createConversationId();
    const nowIso = new Date().toISOString();
    draftConversationRef.current = conversationId;

    setConversations((prev) => ({
      ...prev,
      [conversationId]: {
        id: conversationId,
        title: "Cuộc trò chuyện mới",
        createdAt: nowIso,
        updatedAt: nowIso,
        logs: [],
      },
    }));

    setSelectedConversationId(conversationId);
    setInput("");
  };

  return (
    <div className="udash-page chatassist-shell">
      <UserSidebar active="chatbot" />

      <main className="chatassist-main">
        <div className="chatassist-content">
          <section className="chatassist-history-bar">
            <button type="button" className="chatassist-history-chip" onClick={handleNewChat}>
              New Chat
            </button>
            {conversationList.map((conv) => (
              <div
                key={conv.id}
                className={`chatassist-history-chip-wrap ${selectedConversationId === conv.id ? "active" : ""}`}
              >
                <button
                  type="button"
                  className={`chatassist-history-chip ${selectedConversationId === conv.id ? "active" : ""}`}
                  onClick={() => {
                    draftConversationRef.current = null;
                    setSelectedConversationId(conv.id);
                  }}
                  title={conv.title}
                >
                  {conv.title}
                  {conv.updatedAt ? ` • ${formatChipDate(conv.updatedAt)}` : ""}
                </button>

                <button
                  type="button"
                  className="chatassist-history-chip-delete"
                  aria-label={`Xóa cuộc trò chuyện ${conv.title}`}
                  title="Xóa cuộc trò chuyện"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                >
                  ×
                </button>
              </div>
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
                Chưa có tin nhắn trong cuộc trò chuyện này. Hãy bắt đầu bằng một câu hỏi mới.
              </div>
            )}

            {selectedLogs.map((chatLog, index) => (
              <div key={`${selectedConversationId || "chat"}-${index}`} className="chatassist-block">
                <article className="chatassist-message user">
                  <p>{chatLog.question}</p>
                </article>
                <div className="chatassist-timestamp">{formatMessageTime(chatLog.createdAt || chatLog.created_at)}</div>

                <div className="chatassist-bot-label">LEGALASSIST AI</div>
                <article className="chatassist-message bot">
                  <div className="chatassist-markdown">
                    <ReactMarkdown>{chatLog.answer}</ReactMarkdown>
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
