import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Filter,
  MessageSquare,
  ShieldAlert,
  Trash2,
  User,
} from "lucide-react";
import "../../styles/admin/feedback.css";

const API_URL = "http://localhost:8080/api/editor/feedback";

const sourceFilters = [
  { value: "moderator", label: "Từ moderator" },
];

const statusFilters = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "new", label: "Chưa xử lý" },
  { value: "forwarded", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
];

const issueTypeMap = {
  ai_answer_wrong: "AI trả lời sai",
  ai_hallucination: "AI bịa nội dung",
  ai_timeout: "AI phản hồi chậm / timeout",
  ai_source_missing: "AI thiếu nguồn tham chiếu",
  other: "Lỗi khác",
};

const severityMap = {
  low: "Thấp",
  normal: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
};

const contextMap = {
  chatbot_moderator: "Chatbot (Moderator)",
  detail_page: "Trang chi tiết luật",
  search_page: "Trang tìm kiếm luật",
  other: "Khác",
};

function normalizeStatus(status) {
  const raw = String(status || "").toLowerCase();
  if (raw === "forwarded" || raw === "pending") return "forwarded";
  if (raw === "resolved") return "resolved";
  return "new";
}

function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseMetadata(content = "") {
  const text = String(content);
  const isModeratorFeedback = /\[(GỬI ADMIN|AI_FEEDBACK)\]/i.test(text);
  const issueType = text.match(/\[Loại lỗi AI\]\s*([^\n\r]+)/i)?.[1]?.trim() || "";
  const severity = text.match(/\[Mức độ\]\s*([^\n\r]+)/i)?.[1]?.trim() || "";
  const context = text.match(/\[Bối cảnh\]\s*([^\n\r]+)/i)?.[1]?.trim() || "";

  const cleanedLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^\[(GỬI ADMIN|AI_FEEDBACK)\]/i.test(line) && !/^\[(Loại lỗi AI|Mức độ|Bối cảnh)\]/i.test(line));

  return {
    isModeratorFeedback,
    issueType,
    severity,
    context,
    detail: cleanedLines.join(" "),
  };
}

export default function Feedback() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("moderator");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = (res.data || []).map((item) => {
        const metadata = parseMetadata(item.content);
        const source = metadata.isModeratorFeedback ? "moderator" : "user";

        return {
          ...item,
          source,
          sourceLabel: metadata.isModeratorFeedback ? "Moderator" : "Người dùng",
          status: normalizeStatus(item.status),
          createdAtText: formatDate(item.createdAt),
          issueType: metadata.issueType,
          severity: metadata.severity,
          context: metadata.context,
          detail: metadata.detail || item.content,
          displayName: item.user || "Khách",
        };
      });

      setFeedbacks(normalized);
    } catch (err) {
      console.error(err);
      alert("Không thể tải feedback. Hãy kiểm tra quyền ADMIN hoặc kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleForward = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/${id}/forward`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadFeedbacks();
    } catch (err) {
      console.error(err);
      alert("Không thể chuyển tiếp feedback.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolve = async (id) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadFeedbacks();
    } catch (err) {
      console.error(err);
      alert("Không thể cập nhật trạng thái feedback.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa feedback này?")) {
      return;
    }

    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadFeedbacks();
    } catch (err) {
      console.error(err);
      alert("Không thể xóa feedback.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const matchesSource = item.source === "moderator" && item.source === sourceFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const haystack = [item.displayName, item.content, item.detail, item.issueType, item.context]
        .join(" ")
        .toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesSource && matchesStatus && matchesSearch;
    });
  }, [feedbacks, search, sourceFilter, statusFilter]);

  const stats = useMemo(() => {
    const moderator = feedbacks.filter((item) => item.source === "moderator");
    return {
      total: moderator.length,
      moderator: moderator.length,
      unresolved: moderator.filter((item) => item.status !== "resolved").length,
    };
  }, [feedbacks]);

  return (
    <div className="feedback-inbox-page">
      <div className="feedback-inbox-header">
        <div>
          <p className="feedback-inbox-kicker">Admin inbox</p>
          <h1>Tiếp nhận feedback từ moderator</h1>
          <p className="feedback-inbox-subtitle">
            Chỉ các feedback về luật do moderator gửi lên từ Help Center sẽ xuất hiện ở đây để
            admin theo dõi, phân loại và xử lý.
          </p>
        </div>

        <button className="feedback-refresh-btn" type="button" onClick={loadFeedbacks}>
          <ArrowRight size={16} />
          Làm mới
        </button>
      </div>

      <div className="feedback-stats-grid">
        <StatCard icon={MessageSquare} label="Tổng phản hồi" value={stats.total} tone="blue" />
        <StatCard icon={ShieldAlert} label="Từ moderator" value={stats.moderator} tone="indigo" />
        <StatCard icon={AlertTriangle} label="Chưa xử lý" value={stats.unresolved} tone="amber" />
      </div>

      <div className="feedback-toolbar">
        <div className="feedback-search-wrap">
          <Filter size={16} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, nội dung, loại lỗi..."
          />
        </div>

        <div className="feedback-filter-group">
          {sourceFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`feedback-filter-btn ${sourceFilter === item.value ? "active" : ""}`}
              onClick={() => setSourceFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="feedback-filter-group">
          {statusFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`feedback-filter-btn ${statusFilter === item.value ? "active" : ""}`}
              onClick={() => setStatusFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="feedback-inbox-card">
        {loading ? (
          <div className="feedback-empty-state">Đang tải feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="feedback-empty-state">
            Không có feedback phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="feedback-list">
            {filteredFeedbacks.map((item) => (
              <article key={item.id} className="feedback-item">
                <div className="feedback-item-header">
                  <div className="feedback-item-title-group">
                    <div className="feedback-user-line">
                      <User size={16} />
                      <span>{item.displayName}</span>
                    </div>
                    <div className="feedback-meta-line">
                      <span className={`feedback-source-badge ${item.source}`}>
                        {item.sourceLabel}
                      </span>
                      <span className={`feedback-status-badge ${item.status}`}>
                        {item.status === "resolved"
                          ? "Đã xử lý"
                          : item.status === "forwarded"
                            ? "Đang xử lý"
                            : "Chưa xử lý"}
                      </span>
                    </div>
                  </div>

                  <div className="feedback-time-line">
                    <Calendar size={14} />
                    <span>{item.createdAtText}</span>
                  </div>
                </div>

                <div className="feedback-item-body">
                  {item.source === "moderator" ? (
                    <div className="feedback-tags-row">
                      {item.issueType ? (
                        <span className="feedback-tag">{issueTypeMap[item.issueType] || item.issueType}</span>
                      ) : null}
                      {item.severity ? (
                        <span className="feedback-tag secondary">Ưu tiên: {severityMap[item.severity] || item.severity}</span>
                      ) : null}
                      {item.context ? (
                        <span className="feedback-tag secondary">Bối cảnh: {contextMap[item.context] || item.context}</span>
                      ) : null}
                    </div>
                  ) : null}

                  <p>{item.detail}</p>
                </div>

                <div className="feedback-item-footer">
                  <div className="feedback-action-hint">
                    {item.source === "moderator"
                      ? "Feedback này đến từ Help Center của moderator."
                      : "Phản hồi từ người dùng hệ thống."}
                  </div>

                  <div className="feedback-actions">
                    {item.status === "resolved" ? (
                      <span className="feedback-done-pill">
                        <CheckCircle2 size={16} /> Đã xử lý
                      </span>
                    ) : item.status === "forwarded" ? (
                      <button
                        type="button"
                        className="feedback-action-btn primary"
                        onClick={() => handleResolve(item.id)}
                        disabled={actionLoadingId === item.id}
                      >
                        {actionLoadingId === item.id ? "Đang cập nhật..." : "Đánh dấu hoàn tất"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="feedback-action-btn primary"
                        onClick={() => handleForward(item.id)}
                        disabled={actionLoadingId === item.id}
                      >
                        {actionLoadingId === item.id ? "Đang cập nhật..." : "Nhận xử lý"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="feedback-action-btn danger"
                      onClick={() => handleDelete(item.id)}
                      disabled={actionLoadingId === item.id}
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`feedback-stat-card ${tone}`}>
      <div className="feedback-stat-icon">
        <Icon size={18} />
      </div>
      <div>
        <div className="feedback-stat-value">{value}</div>
        <div className="feedback-stat-label">{label}</div>
      </div>
    </div>
  );
}
