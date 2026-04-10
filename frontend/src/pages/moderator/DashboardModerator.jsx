import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEdit3,
  FiFileText,
  FiMessageCircle,
  FiRefreshCw,
} from "react-icons/fi";
import ModeratorDashboardLayout from "../../components/moderator/ModeratorDashboardLayout";
import "../../styles/moderator/DashboardModerator.css";

const API_ROOT = "http://localhost:8080/api/moderator";

const statusLabel = {
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  PENDING: "Đang chờ",
  RESOLVED: "Đã xử lý",
  DRAFT: "Bản nháp",
};

const statusTone = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  RESOLVED: "resolved",
};

const parseModeratorId = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Number(payload.userId ?? payload.id ?? payload.sub ?? null);
  } catch {
    return null;
  }
};

export default function DashboardModerator() {
  const [moderatorId, setModeratorId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    law: { stats: {}, recentWorks: [] },
    form: { stats: {}, recentForms: [] },
    feedback: { stats: {}, recent: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setModeratorId(parseModeratorId(localStorage.getItem("token")));
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!moderatorId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    setLoading(true);
    setError("");

    const [lawRes, formRes, feedbackRes] = await Promise.allSettled([
      axios.get(`${API_ROOT}/law-stats/${moderatorId}`, { headers }),
      axios.get(`${API_ROOT}/form-stats/${moderatorId}`, { headers }),
      axios.get(`${API_ROOT}/feedback-stats/${moderatorId}`, { headers }),
    ]);

    const nextData = {
      law: lawRes.status === "fulfilled" ? lawRes.value.data || {} : { stats: {}, recentWorks: [] },
      form: formRes.status === "fulfilled" ? formRes.value.data || {} : { stats: {}, recentForms: [] },
      feedback:
        feedbackRes.status === "fulfilled"
          ? feedbackRes.value.data || {}
          : { stats: {}, recent: [] },
    };

    if (
      lawRes.status === "rejected" &&
      formRes.status === "rejected" &&
      feedbackRes.status === "rejected"
    ) {
      setError("Không thể tải dữ liệu dashboard moderator.");
    }

    setDashboardData(nextData);
    setLoading(false);
  }, [moderatorId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = useMemo(() => {
    const lawStats = dashboardData.law.stats || {};
    const formStats = dashboardData.form.stats || {};
    const feedbackStats = dashboardData.feedback.stats || {};

    const resolvedCount =
      (lawStats.approved || 0) +
      (formStats.approved || 0) +
      (feedbackStats.resolved || 0);

    const pendingCount =
      (lawStats.pending || 0) +
      (formStats.pending || 0) +
      (feedbackStats.pending || 0);

    const requiresUpdateCount =
      (lawStats.rejected || 0) +
      (formStats.rejected || 0) +
      (formStats.draft || 0);

    const totalAssigned =
      resolvedCount +
      pendingCount +
      requiresUpdateCount;

    const completionRate =
      totalAssigned > 0 ? ((resolvedCount / totalAssigned) * 100).toFixed(1) : "0.0";

    return {
      completionRate,
      resolvedCount,
      pendingCount,
      requiresUpdateCount,
      totalAssigned,
    };
  }, [dashboardData]);

  const recentLogs = useMemo(() => {
    const lawLogs = (dashboardData.law.recentWorks || []).map((item, index) => ({
      id: `law-${item.id ?? index}`,
      action: "Cập nhật luật",
      icon: <FiEdit3 />,
      itemName: item.articleTitle || "Bài luật chưa đặt tên",
      source: "Luật",
      status: item.status || "PENDING",
    }));

    const formLogs = (dashboardData.form.recentForms || []).map((item, index) => ({
      id: `form-${item.templateId ?? index}`,
      action: "Duyệt biểu mẫu",
      icon: <FiFileText />,
      itemName: item.title || "Biểu mẫu chưa đặt tên",
      source: "Biểu mẫu",
      status: (item.status || "draft").toUpperCase(),
    }));

    const feedbackLogs = (dashboardData.feedback.recent || []).map((item, index) => ({
      id: `feedback-${item.id ?? index}`,
      action: "Xử lý phản hồi",
      icon: <FiMessageCircle />,
      itemName: item.articleTitle || item.content || "Phản hồi người dùng",
      source: "Phản hồi",
      status: item.status || "PENDING",
    }));

    return [...lawLogs, ...formLogs, ...feedbackLogs].slice(0, 6);
  }, [dashboardData]);

  const moduleWorkloads = useMemo(() => {
    const lawStats = dashboardData.law.stats || {};
    const formStats = dashboardData.form.stats || {};
    const feedbackStats = dashboardData.feedback.stats || {};

    const rows = [
      {
        name: "Luật",
        total: (lawStats.approved || 0) + (lawStats.pending || 0) + (lawStats.rejected || 0),
        pending: lawStats.pending || 0,
      },
      {
        name: "Biểu mẫu",
        total:
          (formStats.approved || 0) +
          (formStats.pending || 0) +
          (formStats.rejected || 0) +
          (formStats.draft || 0),
        pending: formStats.pending || 0,
      },
      {
        name: "Phản hồi",
        total: (feedbackStats.pending || 0) + (feedbackStats.resolved || 0),
        pending: feedbackStats.pending || 0,
      },
    ];

    const maxTotal = Math.max(1, ...rows.map((row) => row.total));

    return rows.map((row) => ({
      ...row,
      progress: Math.round((row.total / maxTotal) * 100),
    }));
  }, [dashboardData]);

  const busiestModule = useMemo(() => {
    if (moduleWorkloads.length === 0) return null;
    return [...moduleWorkloads].sort((left, right) => right.pending - left.pending)[0];
  }, [moduleWorkloads]);

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      summary,
      recentLogs,
      moduleWorkloads,
      source: dashboardData,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moderator-dashboard-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ModeratorDashboardLayout
      title="Dashboard Moderator"
      description="Tổng quan công việc theo dữ liệu thực tế của luật, biểu mẫu và phản hồi."
      actions={
        <>
          <button type="button" className="moderator-workspace-action-btn" onClick={loadDashboard} disabled={!moderatorId}>
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
                <FiCheckCircle />
              </div>
              <span className="moderator-dashboard-stat-badge positive">{summary.completionRate}%</span>
            </div>
            <h3>Tỷ lệ hoàn thành</h3>
            <strong>{summary.completionRate}%</strong>
          </article>

          <article className="moderator-dashboard-stat-card">
            <div className="moderator-dashboard-stat-top">
              <div className="moderator-dashboard-stat-icon approved">
                <FiFileText />
              </div>
              <span className="moderator-dashboard-stat-badge info">Đã xử lý</span>
            </div>
            <h3>Đầu việc đã xử lý</h3>
            <strong>{summary.resolvedCount.toLocaleString("vi-VN")}</strong>
          </article>

          <article className="moderator-dashboard-stat-card">
            <div className="moderator-dashboard-stat-top">
              <div className="moderator-dashboard-stat-icon pending">
                <FiClock />
              </div>
              <span className="moderator-dashboard-stat-badge warning">Cần theo dõi</span>
            </div>
            <h3>Đầu việc đang chờ</h3>
            <strong>{summary.pendingCount}</strong>
          </article>
        </section>

        <section className="moderator-dashboard-layout">
          <article className="moderator-dashboard-card logs">
            <div className="moderator-dashboard-section-head">
              <h2>Hoạt động gần đây</h2>
              <button type="button" className="moderator-dashboard-link-btn">
                Xem tất cả
              </button>
            </div>

            {loading ? (
              <div className="moderator-dashboard-empty">Đang tải dữ liệu moderation...</div>
            ) : error ? (
              <div className="moderator-dashboard-empty">{error}</div>
            ) : recentLogs.length === 0 ? (
              <div className="moderator-dashboard-empty">Chưa có log hoạt động gần đây.</div>
            ) : (
              <div className="moderator-dashboard-table">
                <div className="moderator-dashboard-table-header">
                  <span>Hành động</span>
                  <span>Nội dung</span>
                  <span>Nhóm</span>
                  <span>Trạng thái</span>
                </div>

                {recentLogs.map((log) => (
                  <div key={log.id} className="moderator-dashboard-table-row">
                    <div className="moderator-dashboard-row-action">
                      {log.icon}
                      <span>{log.action}</span>
                    </div>
                    <div className="moderator-dashboard-row-title">{log.itemName}</div>
                    <div className="moderator-dashboard-row-moderator">{log.source}</div>
                    <div>
                      <span className={`moderator-dashboard-status ${statusTone[log.status] || "pending"}`}>
                        {statusLabel[log.status] || log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <aside className="moderator-dashboard-card side">
            <div className="moderator-dashboard-section-head">
              <h2>Phân bổ theo mảng công việc</h2>
            </div>

            <div className="moderator-dashboard-region-list">
              {moduleWorkloads.map((module) => (
                <div key={module.name} className="moderator-dashboard-region-item">
                  <div className="moderator-dashboard-region-head">
                    <span className="moderator-dashboard-region-name">{module.name}</span>
                    <span className="moderator-dashboard-region-value">{module.total} đầu việc</span>
                  </div>
                  <div className="moderator-dashboard-workload-meta">
                    <span>Đang chờ: {module.pending}</span>
                    <span>Tổng: {module.total}</span>
                  </div>
                  <div className="moderator-dashboard-progress">
                    <span style={{ width: `${module.progress}%` }}></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="moderator-dashboard-health-box">
              <div className="moderator-dashboard-health-head">
                <FiClock />
                <span>Gợi ý điều phối</span>
              </div>
              <p>
                {busiestModule
                  ? `Mảng ${busiestModule.name} đang có nhiều đầu việc chờ xử lý nhất (${busiestModule.pending}). Ưu tiên xử lý tại mảng này để giảm tồn đọng.`
                  : "Chưa có đủ dữ liệu để đưa ra gợi ý điều phối."}
              </p>
              <p className="moderator-dashboard-health-hint">
                Tổng đầu việc hiện tại: <strong>{summary.totalAssigned}</strong> | Cần cập nhật: <strong>{summary.requiresUpdateCount}</strong>
              </p>
            </div>
          </aside>
        </section>
      </div>
    </ModeratorDashboardLayout>
  );
}
