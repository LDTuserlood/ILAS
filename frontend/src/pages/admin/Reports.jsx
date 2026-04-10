// Reports.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Users,
  FileCheck,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { reportAPI } from "../../api/report";
import "../../styles/admin/Reports.css";

const colorPalette = ["#1a5ca6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
const formatNumber = (value) =>
  typeof value === "number" ? value.toLocaleString("vi-VN") : "0";
const formatChange = (value = 0) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const chartTooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
};
const axisTickStyle = { fill: "#64748b", fontSize: 12 };

const truncateLabel = (label = "", max = 16) =>
  label.length > max ? `${label.slice(0, max - 1)}…` : label;

const rangeLabelMap = {
  week: "Tuần này",
  month: "Tháng này",
  quarter: "Quý này",
  year: "Năm nay",
};

// (previous pie label helpers removed; bar chart uses LabelList instead)

export default function Reports() {
  const [dateRange, setDateRange] = useState("week");
  const [reportType, setReportType] = useState("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContent: 0,
    totalForms: 0,
    totalFeedback: 0,
    usersChange: 0,
    contentChange: 0,
    formsChange: 0,
    feedbackChange: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async (format) => {
    const res = await reportAPI.exportReport(format, dateRange, reportType);
    if (res.success) {
      alert(res.message);
    } else {
      alert(res.message || "Xuất báo cáo thất bại");
    }
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await reportAPI.getReport(dateRange, reportType);
    if (res?.success && res.data) {
      const summary = res.data.stats || {};
      setStats({
        totalUsers: summary.totalUsers || 0,
        totalContent: summary.totalContent || 0,
        totalForms: summary.totalForms || 0,
        totalFeedback: summary.totalFeedback || 0,
        usersChange: summary.usersChange ?? 0,
        contentChange: summary.contentChange ?? 0,
        formsChange: summary.formsChange ?? 0,
        feedbackChange: summary.feedbackChange ?? 0,
      });

      setWeeklyData(res.data.weeklyData || []);
      const rawCategories = (res.data.categoryDistribution || []).map(
        (item, idx) => ({
          ...item,
          color: colorPalette[idx % colorPalette.length],
        })
      );
      // compute total
      const total = rawCategories.reduce((s, c) => s + (c.value || 0), 0);
      // sort descending and take top 5, aggregate others into 'Khác'
      const sorted = rawCategories.slice().sort((a, b) => (b.value || 0) - (a.value || 0));
      const topN = 5;
      const topItems = sorted.slice(0, topN);
      const otherItems = sorted.slice(topN);
      const otherSum = otherItems.reduce((s, c) => s + (c.value || 0), 0);
      const categories = topItems.map((c, idx) => ({
        ...c,
        percent: total > 0 ? (c.value || 0) / total : 0,
      }));
      if (otherSum > 0) {
        categories.push({
          name: "Khác",
          value: otherSum,
          color: "#9ca3af",
          percent: total > 0 ? otherSum / total : 0,
        });
      }
      setCategoryData(categories);
      setTopContent((res.data.topContents || []).slice(0, 5));
    } else {
      setError(res?.message || "Không thể tải báo cáo");
    }
    setLoading(false);
  }, [dateRange, reportType]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const hasNoData = useMemo(
    () =>
      !loading &&
      !error &&
      weeklyData.length === 0 &&
      categoryData.length === 0 &&
      topContent.length === 0,
    [loading, error, weeklyData, categoryData, topContent]
  );

  const kpiCards = useMemo(
    () => [
      {
        key: "users",
        title: "Tổng người dùng",
        value: stats.totalUsers,
        change: stats.usersChange,
        icon: Users,
        tone: "users",
      },
      {
        key: "content",
        title: "Tổng nội dung",
        value: stats.totalContent,
        change: stats.contentChange,
        icon: FileText,
        tone: "content",
      },
      {
        key: "forms",
        title: "Tổng biểu mẫu",
        value: stats.totalForms,
        change: stats.formsChange,
        icon: FileCheck,
        tone: "forms",
      },
      {
        key: "feedback",
        title: "Tổng phản hồi",
        value: stats.totalFeedback,
        change: stats.feedbackChange,
        icon: MessageSquare,
        tone: "feedback",
      },
    ],
    [stats]
  );

  const categoryTotal = useMemo(
    () => categoryData.reduce((sum, item) => sum + (item.value || 0), 0),
    [categoryData]
  );

  const renderChange = (value) => (
    <div className={`report-card-change ${value >= 0 ? "positive" : "negative"}`}>
      {formatChange(value)} so với kỳ trước
    </div>
  );

  return (
    <div className="reports-container">
      <section className="reports-header">
        <div>
          <p className="reports-kicker">Trung tâm phân tích</p>
          <h1 className="reports-title">Báo cáo quản trị hệ thống</h1>
          <p className="reports-subtitle">
            Theo dõi dữ liệu hiệu suất và tăng trưởng theo <strong>{rangeLabelMap[dateRange]}</strong>.
          </p>
        </div>

        <div className="reports-export-group">
          <button className="export-btn pdf" onClick={() => handleExport("pdf")}>
            <Download size={16} />
            Xuất PDF
          </button>
          <button className="export-btn excel" onClick={() => handleExport("excel")}>
            <Download size={16} />
            Xuất Excel
          </button>
        </div>
      </section>

      <div className="reports-filters">
        <div className="filter-group">
          <label className="filter-label">Khoảng thời gian</label>
          <select
            className="filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Loại báo cáo</label>
          <select
            className="filter-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="users">Người dùng</option>
            <option value="content">Nội dung</option>
            <option value="forms">Biểu mẫu</option>
          </select>
        </div>
        <div className="reports-filter-note">
          <span>Dữ liệu được đồng bộ theo thời gian thực</span>
        </div>
      </div>

      {error && <div className="report-error">{error}</div>}
      {loading ? (
        <div className="report-loading">Đang tải báo cáo...</div>
      ) : (
        <>
          <div className="reports-grid">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.key} className={`report-card tone-${card.tone}`}>
                  <div className="report-card-head">
                    <p className="report-card-title">{card.title}</p>
                    <span className="report-card-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                  </div>
                  <div className="report-card-value">{formatNumber(card.value)}</div>
                  {renderChange(card.change)}
                </article>
              );
            })}
          </div>

          <div className="reports-panels">
            <div className="reports-chart compact-padding">
              <h3 className="reports-chart-title">
                Thống Kê Theo Thời Gian
              </h3>
              {weeklyData.length === 0 ? (
                <div className="report-empty">Chưa có dữ liệu</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <defs>
                      <linearGradient id="usersLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="contentLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="formsLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={axisTickStyle} />
                    <YAxis tick={axisTickStyle} allowDecimals={false} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value, name) => [formatNumber(value), name]}
                    />
                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="url(#usersLine)"
                      strokeWidth={3}
                      name="Người dùng"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="content"
                      stroke="url(#contentLine)"
                      strokeWidth={3}
                      name="Nội dung"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forms"
                      stroke="url(#formsLine)"
                      strokeWidth={3}
                      name="Biểu mẫu"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="reports-chart">
              <h3 className="reports-chart-title">
                Phân Bổ Theo Danh Mục
              </h3>
              {categoryData.length === 0 ? (
                <div className="report-empty">Chưa có dữ liệu</div>
              ) : (
                <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                    <XAxis type="number" tick={axisTickStyle} allowDecimals={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={220}
                      tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value) => [formatNumber(value), "Số lượng"]}
                    />
                    <Bar dataKey="value" name="Số lượng" radius={[8, 8, 8, 8]} barSize={22}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(val) => {
                          const percent = Math.round(((val || 0) / Math.max(1, categoryTotal)) * 100);
                          return `${formatNumber(val)} (${percent}%)`;
                        }}
                        style={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </>
              )}
            </div>
          </div>

          <div className="reports-chart reports-chart-full">
            <h3 className="reports-chart-title">Top Trang Được Truy Cập</h3>
            {topContent.length === 0 ? (
              <div className="report-empty">Chưa có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topContent} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="title" 
                    tick={axisTickStyle}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    tickFormatter={(value) => truncateLabel(value, 20)}
                  />
                  <YAxis 
                    tick={axisTickStyle}
                    allowDecimals={false}
                    label={{ value: 'Lượt truy cập', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b' } }}
                  />
                  <Tooltip 
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [formatNumber(value), 'Lượt xem']}
                  />
                  <Bar 
                    dataKey="views" 
                    fill="url(#viewsGradient)" 
                    name="Lượt xem"
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList
                      dataKey="views"
                      position="top"
                      formatter={(val) => formatNumber(val)}
                      style={{ fill: "#1e293b", fontSize: 12, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {hasNoData && !loading && !error && (
        <div className="report-empty" style={{ marginTop: "1rem" }}>
          Chưa có dữ liệu cho khoảng thời gian đã chọn
        </div>
      )}
    </div>
  );
}
