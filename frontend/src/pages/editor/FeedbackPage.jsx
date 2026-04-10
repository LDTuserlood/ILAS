import React, { useEffect, useState } from "react";
import EditorWorkspace from "../../components/editor/EditorWorkspace";
import "../../styles/editor/FeedbackPage.css";
import {
  getAllFeedbackEditor,
  markFeedbackForwarded,
  markFeedbackResolved
} from "../../api/feedbackEditorAPI";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const extractLawTarget = (content = "") => {
    const text = String(content);
    const match = text.match(/\[Đối tượng\]\s*([^\n\r]+)/i);
    return match ? match[1].trim() : "Không rõ điều luật";
  };

  const formatDate = (value) => {
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
  };

  const normalizeStatus = (status = "") => {
    const raw = String(status).toUpperCase();
    if (raw === "RESOLVED") return "RESOLVED";
    if (raw === "FORWARDED" || raw === "PENDING") {
      return "FORWARDED";
    }
    if (raw === "NEW" || raw === "UNPROCESSED") {
      return "NEW";
    }
    return "NEW";
  };

  const loadData = async () => {
    setLoading(true);
    const data = await getAllFeedbackEditor();

    const normalized = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          lawTitle: item.lawTitle || item.law || item.articleTitle || extractLawTarget(item.content),
          userName: item.userName || item.user || item.username || "Ẩn danh",
          date: item.date || formatDate(item.createdAt),
          status: normalizeStatus(item.status),
        }))
      : [];

    setFeedbacks(normalized);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkDone = async (id) => {
    try {
      setActionLoadingId(id);
      await markFeedbackResolved(id);
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartProcessing = async (id) => {
    try {
      setActionLoadingId(id);
      await markFeedbackForwarded(id);
      await loadData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchStatus =
      filter === "ALL" ||
      (filter === "NEW" && f.status === "NEW") ||
      (filter === "FORWARDED" && f.status === "FORWARDED") ||
      (filter === "RESOLVED" && f.status === "RESOLVED");

    const matchSearch =
      (f.content || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.lawTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      (f.userName || "").toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderFeedbackContent = (rawContent = "", rowId) => {
    const lines = String(rawContent)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const fullText = lines.join(" ");
    const issue = (fullText.match(/\[Loại sai sót\]\s*([^\[]+)/i)?.[1] || "").trim();
    const priority = (fullText.match(/\[Mức độ ưu tiên\]\s*([^\[]+)/i)?.[1] || "").trim();
    const target = (fullText.match(/\[Đối tượng\]\s*([^\[]+)/i)?.[1] || "").trim();
    const isModerator = /\[GỬI MODERATOR\]/i.test(fullText);

    const details = lines.filter((line) => !(line.startsWith("[") && line.includes("]")));
    const detailText = details.join(" ");
    const canExpand = detailText.length > 140;
    const isExpanded = !!expandedRows[rowId];

    return (
      <div className="feedback-content-wrap">
        {(isModerator || issue || priority) && (
          <div className="feedback-meta-row">
            {isModerator && <span className="feedback-meta-chip moderator">Moderator</span>}
            {issue && <span className="feedback-meta-chip meta">Lỗi: {issue}</span>}
            {priority && <span className="feedback-meta-chip meta">Ưu tiên: {priority}</span>}
          </div>
        )}

        {target && <div className="feedback-target">Đối tượng: {target}</div>}

        {details.length > 0 && <p className={`feedback-detail-text ${isExpanded ? "expanded" : "clamped"}`}>{detailText}</p>}

        {canExpand && (
          <button type="button" className="feedback-expand-btn" onClick={() => toggleExpand(rowId)}>
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>
    );
  };

  return (
    <EditorWorkspace
      active="feedback"
      title="Feedback Triage"
      description="Theo dõi phản hồi người dùng, lọc theo trạng thái và xử lý nhanh các yêu cầu còn tồn đọng."
    >
      <section className="editor-workspace-panel">
        <div className="feedback-container">

          <div className="feedback-header">
            <div className="feedback-actions">
              <input
                type="text"
                placeholder="Tìm theo nội dung hoặc điều luật..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />

              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                <option value="NEW">Chưa xử lý</option>
                <option value="FORWARDED">Đang xử lý</option>
                <option value="RESOLVED">Đã xử lý</option>
              </select>

              <button className="btn-refresh" onClick={loadData}>
                ⟳
              </button>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <p className="loading">Đang tải phản hồi...</p>
            ) : (
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th className="col-law">Điều luật</th>
                    <th className="col-user">Người gửi</th>
                    <th className="col-content">Nội dung</th>
                    <th className="col-date">Ngày gửi</th>
                    <th className="col-status">Trạng thái</th>
                    <th className="col-action">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-data">
                        Không có phản hồi nào.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f) => (
                      <tr key={f.id}>
                        <td className="feedback-law">{f.lawTitle}</td>
                        <td className="feedback-user">{f.userName}</td>
                        <td className="feedback-content">{renderFeedbackContent(f.content, f.id)}</td>
                        <td className="feedback-date">{f.date}</td>
                        <td className="feedback-status-cell">
                          <span
                            className={`status-badge ${
                              f.status === "RESOLVED"
                                ? "done"
                                : f.status === "FORWARDED"
                                  ? "processing"
                                  : "pending"
                            }`}
                          >
                            {f.status === "RESOLVED"
                              ? "Đã xử lý"
                              : f.status === "FORWARDED"
                                ? "Đang xử lý"
                                : "Chưa xử lý"}
                          </span>
                        </td>
                        <td className="feedback-action-cell">
                          {f.status === "RESOLVED" ? (
                            <span className="action-done">Đã xử lý</span>
                          ) : f.status === "FORWARDED" ? (
                            <button
                              className="btn-mark"
                              onClick={() => handleMarkDone(f.id)}
                              disabled={actionLoadingId === f.id}
                            >
                              {actionLoadingId === f.id ? "Đang cập nhật..." : "Hoàn tất xử lý"}
                            </button>
                          ) : (
                            <button
                              className="btn-mark btn-start"
                              onClick={() => handleStartProcessing(f.id)}
                              disabled={actionLoadingId === f.id}
                            >
                              {actionLoadingId === f.id ? "Đang cập nhật..." : "Nhận xử lý"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </EditorWorkspace>
  );
}
