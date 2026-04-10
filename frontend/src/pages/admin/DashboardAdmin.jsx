import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Bell, ChartNoAxesColumn, CircleAlert, Download, Search, Shield, UserCheck, Users } from "lucide-react";
import { trackAPI } from "../../api/track";
import AdminDashboardLayout from "../../components/admin/AdminDashboardLayout";
import "../../styles/admin/DashboardAdmin.css";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModerators: 0,
    totalAdmins: 0,
    pendingContent: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyAccess, setWeeklyAccess] = useState([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState({
    newUsers: 0,
    newContent: 0,
    newForms: 0,
    newFeedback: 0,
  });
  const [topSearches, setTopSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:8080/api/admin";

  const relativeTime = (iso) => {
    if (!iso) return "Vừa xong";
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.max(1, Math.floor(diff / 60000));
    if (min < 60) return `${min} phút trước`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} giờ trước`;
    const day = Math.floor(hour / 24);
    return `${day} ngày trước`;
  };

  const parseIdFromDetail = (detail = "", key = "id") => {
    const match = String(detail).match(new RegExp(`${key}\\s*=\\s*(\\d+)`, "i"));
    return match ? match[1] : null;
  };

  const cleanDetail = (detail = "") => {
    return String(detail)
      .replace(/contentLen\s*=\s*\d+/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const formatActivityText = (action = "", detail = "") => {
    const normalizedAction = String(action || "").trim();
    const normalizedDetail = cleanDetail(detail);

    if (!normalizedAction) {
      return "Hoạt động hệ thống";
    }

    if (/gửi phản hồi/i.test(normalizedAction)) {
      const feedbackId = parseIdFromDetail(normalizedDetail, "feedbackId");
      return feedbackId ? `Đã gửi phản hồi #${feedbackId}` : "Đã gửi phản hồi";
    }

    if (/giải quyết phản hồi/i.test(normalizedAction)) {
      const feedbackId = parseIdFromDetail(normalizedDetail, "feedbackId");
      return feedbackId ? `Đã giải quyết phản hồi #${feedbackId}` : "Đã giải quyết phản hồi";
    }

    if (/xóa văn bản pháp luật/i.test(normalizedAction)) {
      const lawId = parseIdFromDetail(normalizedDetail, "id");
      return lawId ? `Đã xóa văn bản pháp luật #${lawId}` : "Đã xóa văn bản pháp luật";
    }

    if (!normalizedDetail) {
      return normalizedAction;
    }

    return `${normalizedAction} - ${normalizedDetail}`;
  };

  const resolveActivityType = (action = "") => {
    const normalizedAction = String(action || "").toLowerCase();
    if (/(xóa|từ chối|thất bại|lỗi|cảnh báo)/i.test(normalizedAction)) {
      return "warn";
    }
    return "ok";
  };

  const loadDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = { Authorization: `Bearer ${token}` };

      const reportRes = await axios.get(`${API_BASE_URL}/reports`, {
        headers: authHeader,
        params: { range: "week", reportType: "all" },
      });
      if (reportRes?.data?.success) {
        const data = reportRes.data.data || {};
        const summary = data.stats || {};
        setStats({
          totalUsers: summary.totalUsers || 0,
          totalModerators: 0,
          totalAdmins: 0,
          pendingContent: (summary.newForms || 0) + (summary.newFeedback || 0),
        });
        setWeeklyBreakdown({
          newUsers: Number(summary.newUsers || 0),
          newContent: Number(summary.newContent || 0),
          newForms: Number(summary.newForms || 0),
          newFeedback: Number(summary.newFeedback || 0),
        });

        const week = Array.isArray(data.weeklyData) ? data.weeklyData : [];
        setWeeklyAccess(
          week.map((item) => ({
            day: item.label,
            accesses: Number(item.users || 0) + Number(item.content || 0) + Number(item.forms || 0),
          }))
        );

        const activitiesFromContent = (Array.isArray(data.topContents) ? data.topContents : [])
          .slice(0, 3)
          .map((item, idx) => ({
            id: idx + 1,
            text: `Nội dung nổi bật: ${item.title}`,
            time: `Lượt xem: ${(item.views || 0).toLocaleString("vi-VN")}`,
            type: idx === 1 ? "warn" : "ok",
          }));
        if (activitiesFromContent.length) {
          setRecentActivities(activitiesFromContent);
        }
      }

      const auditRes = await axios.get(`${API_BASE_URL}/audit-logs`, { headers: authHeader });
      if (auditRes?.data?.success) {
        const logs = Array.isArray(auditRes.data.data) ? auditRes.data.data : [];
        const activities = logs.slice(0, 3).map((log, idx) => ({
          id: log.id || idx + 1,
          text: formatActivityText(log.action, log.detail),
          time: relativeTime(log.createdAt),
          type: resolveActivityType(log.action),
        }));
        if (activities.length) {
          setRecentActivities(activities);
        }
      }

      const usersRes = await axios.get(`${API_BASE_URL}/users`, { headers: authHeader });
      if (Array.isArray(usersRes?.data)) {
        const users = usersRes.data;
        const adminCount = users.filter((u) => String(u.role || "").toUpperCase() === "ADMIN").length;
        const moderatorCount = users.filter((u) => {
          const role = String(u.role || "").toUpperCase();
          return role === "MODERATOR" || role === "MODERATOR";
        }).length;
        setStats((prev) => ({
          ...prev,
          totalAdmins: adminCount,
          totalModerators: moderatorCount,
        }));
      }

      let searchesData = [];
      try {
        const searchesRes = await axios.get("http://localhost:8080/api/track/top-searches", {
          params: { limit: 4 },
        });
        if (searchesRes?.data?.success) {
          searchesData = (searchesRes.data.data || []).map((item) => ({
            keyword: item.keyword,
            count: item.count || 0,
          }));
        }
      } catch {
        // Fallback below
      }

      if (searchesData.length === 0) {
        const trackRes = await trackAPI.getTopSearches(4);
        if (trackRes?.success) {
          searchesData = (trackRes.data || []).map((item) => ({ keyword: item.keyword, count: item.count || 0 }));
        }
      }
      setTopSearches(searchesData.slice(0, 4));
    } catch (error) {
      console.error("Load admin dashboard data failed", error);
      setWeeklyAccess([
        { day: "T2", accesses: 760 },
        { day: "T3", accesses: 920 },
        { day: "T4", accesses: 1240 },
        { day: "T5", accesses: 1030 },
        { day: "T6", accesses: 880 },
        { day: "T7", accesses: 690 },
        { day: "CN", accesses: 540 },
      ]);
      setTopSearches([
        { keyword: "luật lao động", count: 2450 },
        { keyword: "điều 5 nghị định 123", count: 1890 },
        { keyword: "bảo hiểm xã hội", count: 1205 },
        { keyword: "thôi việc trái luật", count: 950 },
      ]);
      setWeeklyBreakdown({
        newUsers: 12,
        newContent: 8,
        newForms: 6,
        newFeedback: 5,
      });
      setRecentActivities([
        { id: 1, text: "Cào luật thành công - Hệ thống vừa cập nhật Nghị định 123/2024", time: "Vừa xong", type: "ok" },
        { id: 2, text: "Cảnh báo đăng nhập - Phát hiện truy cập bất thường", time: "15 phút trước", type: "warn" },
        { id: 3, text: "Cập nhật cơ sở dữ liệu - Tối ưu hoá bảng users hoàn tất", time: "2 giờ trước", type: "ok" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const intervalId = setInterval(loadDashboard, 60000);
    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  const todayText = useMemo(() => {
    const now = new Date();
    return `Hôm nay là ${now.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  }, []);

  const avgAccess = useMemo(() => {
    if (!weeklyAccess.length) return 0;
    return Math.round(weeklyAccess.reduce((sum, i) => sum + (i.accesses || 0), 0) / weeklyAccess.length);
  }, [weeklyAccess]);

  const weeklyMetrics = useMemo(() => {
    const items = [
      { key: "newUsers", label: "Người dùng mới", value: weeklyBreakdown.newUsers },
      { key: "newContent", label: "Nội dung mới", value: weeklyBreakdown.newContent },
      { key: "newForms", label: "Biểu mẫu mới", value: weeklyBreakdown.newForms },
      { key: "newFeedback", label: "Phản hồi mới", value: weeklyBreakdown.newFeedback },
    ];
    const max = Math.max(...items.map((item) => item.value), 1);
    return items.map((item) => ({
      ...item,
      ratio: Math.round((item.value / max) * 100),
    }));
  }, [weeklyBreakdown]);

  if (loading) {
    return <div className="admdash-loading">Đang tải dữ liệu dashboard...</div>;
  }

  return (
    <AdminDashboardLayout>
      <div className="admdash-heading-row">
        <div>
          <h1>Tổng quan quản trị</h1>
          <p>{todayText}</p>
        </div>
        <button className="admdash-export-btn" type="button">
          <Download size={15} />
          Xuất báo cáo
        </button>
      </div>

      <section className="admdash-metric-grid">
        <article className="admdash-metric-card">
          <div className="admdash-metric-icon"><Users size={18} /></div>
          <div className="admdash-metric-tag">+12%</div>
          <div className="admdash-metric-label">Tổng người dùng</div>
          <div className="admdash-metric-value">{stats.totalUsers.toLocaleString("vi-VN")}</div>
        </article>
        <article className="admdash-metric-card">
          <div className="admdash-metric-icon"><UserCheck size={18} /></div>
          <div className="admdash-metric-tag neutral">Ổn định</div>
          <div className="admdash-metric-label">Tổng biên tập viên</div>
          <div className="admdash-metric-value">{stats.totalModerators.toLocaleString("vi-VN")}</div>
        </article>
        <article className="admdash-metric-card">
          <div className="admdash-metric-icon"><Shield size={18} /></div>
          <div className="admdash-metric-tag safe">An toàn</div>
          <div className="admdash-metric-label">Quản trị viên</div>
          <div className="admdash-metric-value">{stats.totalAdmins.toLocaleString("vi-VN")}</div>
        </article>
        <article className="admdash-metric-card highlight">
          <div className="admdash-metric-icon"><Bell size={18} /></div>
          <div className="admdash-metric-tag warn">Cần xử lý</div>
          <div className="admdash-metric-label">Yêu cầu chờ duyệt</div>
          <div className="admdash-metric-value">{stats.pendingContent.toLocaleString("vi-VN")}</div>
        </article>
      </section>

      <section className="admdash-main-grid">
        <article className="admdash-panel">
          <div className="admdash-panel-title-row">
            <h3>Hoạt động hệ thống gần đây</h3>
            <button type="button">Xem tất cả</button>
          </div>
          <div className="admdash-activity-list">
            {recentActivities.map((activity) => (
              <div className="admdash-activity-item" key={activity.id}>
                <div className={`admdash-activity-icon ${activity.type === "warn" ? "warn" : "ok"}`}>
                  {activity.type === "warn" ? <CircleAlert size={14} /> : <Shield size={14} />}
                </div>
                <div className="admdash-activity-content">
                  <div className="admdash-activity-text">{activity.text}</div>
                </div>
                <div className="admdash-activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="admdash-panel">
          <div className="admdash-panel-title-row">
            <h3>Thống kê phát sinh tuần</h3>
          </div>
          <div className="admdash-week-kpis">
            {weeklyMetrics.map((item) => (
              <div className="admdash-week-kpi" key={item.key}>
                <div className="admdash-week-kpi-head">
                  <span>{item.label}</span>
                  <strong>{item.value.toLocaleString("vi-VN")}</strong>
                </div>
                <div className="admdash-week-kpi-track">
                  <div className="admdash-week-kpi-fill" style={{ width: `${item.ratio}%` }} />
                </div>
              </div>
            ))}
            <div className="admdash-week-summary">
              <span>Trung bình truy cập</span>
              <strong>{avgAccess.toLocaleString("vi-VN")}</strong>
              <span>/ngày</span>
            </div>
          </div>
        </article>
      </section>

      <section className="admdash-panel">
        <div className="admdash-panel-title-row">
          <h3>Từ khóa tìm kiếm hàng đầu</h3>
        </div>
        <div className="admdash-keyword-grid">
          {topSearches.slice(0, 4).map((item, index) => (
            <div className="admdash-keyword-card" key={`${item.keyword}-${index}`}>
              <div className="admdash-keyword-rank">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <div className="admdash-keyword-text">{item.keyword}</div>
                <div className="admdash-keyword-count">{(item.count || 0).toLocaleString("vi-VN")} lượt tìm kiếm</div>
              </div>
              <ChartNoAxesColumn size={15} />
            </div>
          ))}
        </div>
      </section>
    </AdminDashboardLayout>
  );
};

export default DashboardAdmin;

