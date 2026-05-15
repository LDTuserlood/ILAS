import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiDownload,
  FiMessageCircle,
  FiRefreshCw,
  FiThumbsUp,
} from "react-icons/fi";
import ModeratorDashboardLayout from "../../components/moderator/ModeratorDashboardLayout";
import "../../styles/moderator/DashboardModerator.css";

const CHATBOT_API = "http://localhost:8080/api/chatbot";

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

const reviewLabel = {
  NEW: "Cần kiểm tra",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã xử lý",
};

const reviewTone = {
  NEW: "rejected",
  IN_PROGRESS: "pending",
  RESOLVED: "resolved",
};

export default function DashboardModerator() {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [reportedLogs, setReportedLogs] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, logsRes, reportedRes, topRes] = await Promise.all([
        axios.get(`${CHATBOT_API}/admin/stats`),
        axios.get(`${CHATBOT_API}/admin/logs`),
        axios.get(`${CHATBOT_API}/admin/reported`),
        axios.get(`${CHATBOT_API}/top-questions`),
      ]);

      setStats(statsRes.data || {});
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setReportedLogs(Array.isArray(reportedRes.data) ? reportedRes.data : []);
      setTopQuestions(Array.isArray(topRes.data) ? topRes.data : []);
    } catch (requestError) {
      console.error("Load chatbot quality dashboard failed:", requestError);
      setError("Không thể tải dữ liệu chất lượng chatbot.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recentQuestions = useMemo(() => logs.slice(0, 6), [logs]);

  const satisfactionRate = Number(stats.satisfactionRate ?? 100);
  const hasReports = Number(stats.reportedResponses || 0) > 0;
  const reportedCount = Number(stats.reportedResponses || 0);
  const openReportCount = Number(stats.openReports || 0);
  const resolvedReportCount = Math.max(0, reportedCount - openReportCount);

  const handleReview = async (chatId, reviewStatus) => {
    try {
      setActionLoadingId(chatId);
      await axios.post(`${CHATBOT_API}/admin/logs/${chatId}/review`, {
        reviewStatus,
        note: reviewStatus === "RESOLVED" ? "Moderator đã kiểm tra phản hồi của người dùng." : "",
      });
      await loadDashboard();
    } finally {
      setActionLoadingId(null);
    }
  };

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      stats,
      reportedLogs,
      recentQuestions,
      topQuestions,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moderator-ai-quality-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ModeratorDashboardLayout
      title="Dashboard Moderator"
      description="Theo dõi câu hỏi người dùng, phản hồi chất lượng AI và các câu trả lời bị đánh dấu không đúng."
      actions={
        <>
          <button type="button" className="moderator-workspace-action-btn" onClick={loadDashboard}>
            <FiRefreshCw />
            Làm mới
          </button>
          <button type="button" className="moderator-workspace-action-btn primary" onClick={exportReport}>
            <FiDownload />
            Xuất báo cáo JSON
          </button>
        </>
      }
    >
      <div className="moderator-dashboard">
        <section className="moderator-dashboard-stat-grid">
          <article className="moderator-dashboard-stat-card">
            <div className="moderator-dashboard-stat-top">
              <div className="moderator-dashboard-stat-icon accuracy">
                <FiThumbsUp />
              </div>
              <span className={`moderator-dashboard-stat-badge ${hasReports ? "warning" : "positive"}`}>
                {hasReports ? "Có phản đối" : "Ổn định"}
              </span>
            </div>
            <h3>Tỷ lệ hài lòng</h3>
            <strong>{satisfactionRate.toFixed(1)}%</strong>
          </article>

          <article className="moderator-dashboard-stat-card">
            <div className="moderator-dashboard-stat-top">
              <div className="moderator-dashboard-stat-icon approved">
                <FiMessageCircle />
              </div>
              <span className="moderator-dashboard-stat-badge info">Tổng log</span>
            </div>
            <h3>Câu hỏi người dùng</h3>
            <strong>{Number(stats.totalQuestions || 0).toLocaleString("vi-VN")}</strong>
          </article>

          <article className="moderator-dashboard-stat-card">
            <div className="moderator-dashboard-stat-top">
              <div className="moderator-dashboard-stat-icon pending">
                <FiAlertTriangle />
              </div>
              <span className="moderator-dashboard-stat-badge warning">Mở: {openReportCount}</span>
            </div>
            <h3>Tổng phản đối</h3>
            <strong>{reportedCount.toLocaleString("vi-VN")}</strong>
            <p className="moderator-dashboard-stat-detail">
              Đã xử lý: <b>{resolvedReportCount.toLocaleString("vi-VN")}</b>
            </p>
          </article>
        </section>

        <section className="moderator-dashboard-layout">
          <article className="moderator-dashboard-card logs">
            <div className="moderator-dashboard-section-head">
              <h2>Câu trả lời bị phản đối</h2>
              <span className="moderator-dashboard-link-btn">{reportedLogs.length} mục</span>
            </div>

            {loading ? (
              <div className="moderator-dashboard-empty">Đang tải dữ liệu chatbot...</div>
            ) : error ? (
              <div className="moderator-dashboard-empty">{error}</div>
            ) : reportedLogs.length === 0 ? (
              <div className="moderator-dashboard-empty">
                Chưa có câu trả lời nào bị người dùng phản đối. Tỷ lệ hài lòng đang được tính là 100%.
              </div>
            ) : (
              <div className="moderator-dashboard-table ai-quality">
                <div className="moderator-dashboard-table-header">
                  <span>Người hỏi</span>
                  <span>Câu hỏi</span>
                  <span>Lý do phản đối</span>
                  <span>Trạng thái</span>
                  <span>Hành động</span>
                </div>

                {reportedLogs.map((log) => {
                  const reviewStatus = log.reviewStatus || "NEW";
                  return (
                    <div key={log.id} className="moderator-dashboard-table-row">
                      <div className="moderator-dashboard-row-action">
                        <FiMessageCircle />
                        <span>{log.user || "Guest"}</span>
                      </div>
                      <div className="moderator-dashboard-row-title">{log.question}</div>
                      <div className="moderator-dashboard-row-moderator">
                        {log.feedbackReason || "Người dùng đánh dấu câu trả lời không đúng."}
                      </div>
                      <div>
                        <span className={`moderator-dashboard-status ${reviewTone[reviewStatus] || "pending"}`}>
                          {reviewLabel[reviewStatus] || reviewStatus}
                        </span>
                      </div>
                      <div className="moderator-dashboard-row-actions">
                        {reviewStatus !== "IN_PROGRESS" && reviewStatus !== "RESOLVED" && (
                          <button
                            type="button"
                            onClick={() => handleReview(log.id, "IN_PROGRESS")}
                            disabled={actionLoadingId === log.id}
                          >
                            Nhận xử lý
                          </button>
                        )}
                        {reviewStatus !== "RESOLVED" && (
                          <button
                            type="button"
                            className="primary"
                            onClick={() => handleReview(log.id, "RESOLVED")}
                            disabled={actionLoadingId === log.id}
                          >
                            Đã kiểm tra
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <aside className="moderator-dashboard-card side">
            <div className="moderator-dashboard-section-head">
              <h2>Tổng quan AI</h2>
            </div>

            <div className="moderator-dashboard-region-list">
              <div className="moderator-dashboard-region-item">
                <div className="moderator-dashboard-region-head">
                  <span className="moderator-dashboard-region-name">Hữu ích</span>
                  <span className="moderator-dashboard-region-value">{stats.helpfulResponses || 0}</span>
                </div>
                <div className="moderator-dashboard-progress">
                  <span style={{ width: `${Math.min(100, satisfactionRate)}%` }}></span>
                </div>
              </div>

              <div className="moderator-dashboard-region-item">
                <div className="moderator-dashboard-region-head">
                  <span className="moderator-dashboard-region-name">Bị phản đối</span>
                  <span className="moderator-dashboard-region-value">{stats.reportedResponses || 0}</span>
                </div>
                <div className="moderator-dashboard-progress danger">
                  <span style={{ width: `${Math.min(100, 100 - satisfactionRate)}%` }}></span>
                </div>
              </div>

              <div className="moderator-dashboard-region-item">
                <div className="moderator-dashboard-region-head">
                  <span className="moderator-dashboard-region-name">Chưa đánh giá</span>
                  <span className="moderator-dashboard-region-value">{stats.unratedResponses || 0}</span>
                </div>
              </div>
            </div>

            <div className="moderator-dashboard-health-box">
              <div className="moderator-dashboard-health-head">
                <FiBarChart2 />
                <span>Top câu hỏi</span>
              </div>
              {topQuestions.length === 0 ? (
                <p>Chưa có đủ dữ liệu câu hỏi để tổng hợp.</p>
              ) : (
                <div className="moderator-dashboard-top-list">
                  {topQuestions.slice(0, 5).map((item, index) => (
                    <div key={`${item.question}-${index}`} className="moderator-dashboard-top-item">
                      <span>{item.question || item.questionClean}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>

        <article className="moderator-dashboard-card logs">
          <div className="moderator-dashboard-section-head">
            <h2>Câu hỏi gần đây</h2>
            <FiCheckCircle />
          </div>

          {recentQuestions.length === 0 ? (
            <div className="moderator-dashboard-empty">Chưa có câu hỏi chatbot nào.</div>
          ) : (
            <div className="moderator-dashboard-table recent-ai">
              <div className="moderator-dashboard-table-header">
                <span>Người hỏi</span>
                <span>Câu hỏi</span>
                <span>Đánh giá</span>
                <span>Thời gian</span>
              </div>
              {recentQuestions.map((log) => (
                <div key={log.id} className="moderator-dashboard-table-row">
                  <div className="moderator-dashboard-row-action">
                    <FiMessageCircle />
                    <span>{log.user || "Guest"}</span>
                  </div>
                  <div className="moderator-dashboard-row-title">{log.question}</div>
                  <div>
                    <span
                      className={`moderator-dashboard-status ${
                        log.feedbackStatus === "REPORTED"
                          ? "rejected"
                          : log.feedbackStatus === "HELPFUL"
                            ? "resolved"
                            : "pending"
                      }`}
                    >
                      {log.feedbackStatus === "REPORTED"
                        ? "Không đúng"
                        : log.feedbackStatus === "HELPFUL"
                          ? "Hữu ích"
                          : "Chưa đánh giá"}
                    </span>
                  </div>
                  <div className="moderator-dashboard-row-moderator">{formatDate(log.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </ModeratorDashboardLayout>
  );
}
