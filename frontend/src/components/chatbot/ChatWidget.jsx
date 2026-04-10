import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/chatbot/ChatWidget.css";
import { sendChatMessage, getChatHistory } from "../../api/chatbotAPI";
import ReactMarkdown from "react-markdown";

export default function ChatWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const isFullChat = location.pathname.startsWith("/chat/history");

  const [open, setOpen] = useState(
    () => localStorage.getItem("chat_open") === "true"
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // =========================
  // PERSIST OPEN STATE
  // =========================
  useEffect(() => {
    localStorage.setItem("chat_open", open);
  }, [open]);

  // =========================
  // LOAD USER ID
  // =========================
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(parseInt(id));
  }, []);

  // =========================
  // LOAD CHAT HISTORY
  // =========================
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const logs = await getChatHistory(userId);
        const formatted = logs.flatMap((l) => [
          { sender: "user", text: l.question },
          { sender: "bot", text: l.answer },
        ]);
        setMessages(formatted);
      } catch (e) {
        console.error("Load history error:", e);
      }
    })();
  }, [userId]);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async () => {
    if (!input.trim() || !userId || loading) return;

    const text = input;
    setInput("");
    setMessages((p) => [...p, { sender: "user", text }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userId, text, true);
      setMessages((p) => [...p, { sender: "bot", text: res.answer }]);
    } catch {
      setMessages((p) => [
        ...p,
        { sender: "bot", text: "❌ Lỗi hệ thống nội bộ. Vui lòng thử lại sau." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OPEN FULL CHAT
  // =========================
  const handleExpand = () => {
    setOpen(false);
    navigate("/chat/history");
  };

  // =========================
  // RENDER
  // =========================
  if (isFullChat) return null;

  return (
    <>
      {/* CHAT BUBBLE */}
      <button className="chat-bubble" onClick={() => setOpen((p) => !p)}>
        💬
      </button>

      {/* CHAT WINDOW */}
      <div className={`chat-window ${open ? "open" : ""}`}>
        {/* HEADER */}
        <div className="chat-header">
          <span>AI Legal Assistant</span>

          <div className="header-actions">
            <button className="icon-btn" onClick={handleExpand} title="Phóng to">
              ↗
            </button>
            <button
              className="icon-btn close"
              onClick={() => setOpen(false)}
              title="Đóng"
            >
              ✖
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="chat-body">
          {messages.map((m, i) => {
            const isError =
              m.sender === "bot" &&
              (m.text?.includes("❌") || m.text?.includes("Lỗi"));

            return (
              <div key={i} className={`message-wrapper ${m.sender}`}>
                <div className="avatar">
                  {m.sender === "user" ? "🧑" : "🤖"}
                </div>

                <div
                  className={`chat-message ${m.sender} ${
                    isError ? "error" : ""
                  }`}
                >
                  {m.sender === "bot" ? (
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="message-wrapper bot">
              <div className="avatar">🤖</div>
              <div className="chat-message bot">⏳ Đang trả lời...</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="chat-input">
          <input
            value={input}
            placeholder="Nhập câu hỏi..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} disabled={loading}>
            Gửi
          </button>
        </div>
      </div>
    </>
  );
}
