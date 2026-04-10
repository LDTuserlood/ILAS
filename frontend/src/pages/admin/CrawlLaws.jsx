import React, { useMemo, useState } from "react";
import { Clock3, FileSearch, Info, Link2, Logs, Trash2, Zap } from "lucide-react";
import api from "../../api/api";
import "../../styles/admin/crawl-laws.css";

export default function AdminCrawlLaws() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(process.env.REACT_APP_CRAWLER_DEFAULT_URL || "");
  const [result, setResult] = useState(null);

  const addLog = (message, status = "info", timeOverride = null) => {
    const time = timeOverride || new Date().toLocaleString("vi-VN");
    setLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), time, message, status },
    ]);
  };

  const clearAll = () => {
    setLogs([]);
    setResult(null);
  };

  const parseSummaryFromLines = (lines) => {
    const summary = {
      title: null,
      code: null,
      version: null,
      chapters: null,
      sections: null,
      articles: null,
    };

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      // Tìm metadata: "Metadata: tiêu đề=... | mã=..."
      if (lower.includes("metadata:")) {
        const t = line.match(/(?:tiêu đề|tieude)\s*=\s*([^|]+)/i);
        if (t) summary.title = t[1].trim();

        const c = line.match(/(?:mã|ma)\s*=\s*(\S+)/i);
        if (c) summary.code = c[1].trim();
      }

      // Tìm phiên bản: "Luật ID=3 | Phiên bản=2"
      if (lower.includes("phiên bản") || lower.includes("phien ban")) {
        const v = line.match(/(?:phiên\s*bản|phien\s*ban)\s*=\s*(\d+)/i);
        if (v) summary.version = Number(v[1]);
      }
      
      // Tìm "Đã lưu xong: X chuơng, Y mục, Z điều"
      // Pattern: "Đã lưu xong: 17 chuơng, 24 mục, 220 điều"
      if (lower.includes("đã lưu xong") || lower.includes("da luu xong")) {
        const m = line.match(/(\d+)\s*(?:chuơng|chuong|chương).*?(\d+)\s*(?:mục|muc).*?(\d+)\s*(?:điều|dieu)/i);
        if (m) {
          summary.chapters = Number(m[1]);
          summary.sections = Number(m[2]);
          summary.articles = Number(m[3]);
        }
      }
    }

    // Nếu summary rỗng hết thì trả null
    const hasAny =
      summary.title ||
      summary.code ||
      summary.version ||
      summary.chapters ||
      summary.sections ||
      summary.articles;
    return hasAny ? summary : null;
  };

  const classifyLineStatus = (line) => {
    const lower = line.toLowerCase();

    if (
      lower.includes("loi") ||
      lower.includes("error") ||
      lower.includes("exception") ||
      lower.includes("traceback")
    ) {
      return "error";
    }

    if (
      lower.includes("done") ||
      lower.includes("hoan tat") ||
      lower.includes("da luu xong") ||
      lower.includes("don xong")
    ) {
      return "success";
    }

    return "info";
  };

  const handleCrawl = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      addLog("Vui lòng nhập URL luật cần cào", "error");
      return;
    }

    setLoading(true);
    setLogs([]);
    setResult(null);

    addLog(`Bắt đầu cào dữ liệu: ${trimmed}`, "info");

    try {
      const res = await api.post("/admin/crawler/laws", { url: trimmed });

      const rawLogs = res?.data?.logs || "";
      const lines = rawLogs.split("\n").map((s) => s.trim()).filter(Boolean);

      // parse summary từ logs
      const summary = parseSummaryFromLines(lines);
      setResult(summary);

      // đẩy từng dòng log lên bảng
      lines.forEach((line) => {
        addLog(line, classifyLineStatus(line));
      });

      addLog(res?.data?.message || "Cào luật thành công", "success");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Lỗi khi cào";
      addLog(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = useMemo(() => {
    if (!loading && logs.length === 0) return { text: "Sẵn sàng", cls: "badge-ready" };
    if (loading) return { text: "Đang cào", cls: "badge-running" };

    // Nếu có log lỗi thì hiển thị lỗi
    const hasError = logs.some((l) => l.status === "error");
    if (hasError) return { text: "Có lỗi", cls: "badge-error" };

    // Nếu có DONE/Thành công
    const hasSuccess = logs.some((l) => l.status === "success");
    if (hasSuccess) return { text: "Hoàn tất", cls: "badge-success" };

    return { text: "Đang xử lý", cls: "badge-running" };
  }, [loading, logs]);

  return (
    <div className="crawl-page">
      <div className="crawl-top">
        <div>
          <div className="crawl-title-row">
            <h1 className="crawl-title">Cào Luật</h1>
            <span className={`crawl-badge ${statusBadge.cls}`}>{statusBadge.text}</span>
          </div>
          <p className="crawl-subtitle">
            Nhập URL văn bản luật (thuvienphapluat.vn/van-ban/...) rồi nhấn “Cào luật”.
          </p>
        </div>

        <button className="crawl-history-btn" type="button">
          <Clock3 size={16} />
          <span>Phiên bản luật</span>
          <span className="crawl-version-pill">
            {result?.version ? `v${result.version}` : "--"}
          </span>
        </button>
      </div>

      <div className="crawl-input-row">
        <div className="crawl-input-wrap">
          <Link2 size={16} />
          <input
            className="crawl-input"
            type="text"
            placeholder="https://thuvienphapluat.vn/van-ban/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleCrawl}
          disabled={loading}
          className={`crawl-btn ${loading ? "is-loading" : ""}`}
        >
          <Zap size={16} />
          {loading ? "Đang cào..." : "Cào luật"}
        </button>

        <button
          onClick={clearAll}
          disabled={loading && logs.length === 0}
          className="crawl-btn-secondary"
          type="button"
        >
          <Trash2 size={16} />
          Xóa log
        </button>
      </div>

      <div className="crawl-grid">
        <div className="crawl-card">
          <div className="crawl-card-header">
            <span className="crawl-card-title">
              <FileSearch size={16} />
              Kết quả cào
            </span>
            <span className="crawl-card-sub">Preview mode</span>
          </div>

          <div className="crawl-card-body crawl-result-body">
            {!result ? (
              <div className="crawl-empty-box">
                <div className="crawl-empty-icon-wrap">
                  <FileSearch size={22} />
                </div>
                <p>Chưa có kết quả. Hãy chạy crawler để xem tên luật và số chương/mục/điều.</p>
              </div>
            ) : (
              <div className="crawl-summary">
                <div className="summary-item">
                  <div className="label">Văn bản luật</div>
                  <div className="value">{result.title || "—"}</div>
                </div>

                <div className="summary-item">
                  <div className="label">Mã / Số hiệu</div>
                  <div className="value mono">{result.code || "—"}</div>
                </div>

                <div className="summary-item">
                  <div className="label">Phiên bản luật</div>
                  <div className="value">{result.version ? `v${result.version}` : "—"}</div>
                </div>

                <div className="summary-stats">
                  <div className="stat">
                    <div className="stat-label">Chương</div>
                    <div className="stat-value">{result.chapters ?? "—"}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">Mục</div>
                    <div className="stat-value">{result.sections ?? "—"}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">Điều</div>
                    <div className="stat-value">{result.articles ?? "—"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="crawl-side-stack">
          <div className="crawl-card">
            <div className="crawl-card-header">
              <span className="crawl-card-title">
                <Logs size={16} />
                Log tác vụ
              </span>
            </div>

            <div className="crawl-table-wrapper">
              <table className="crawl-table">
                <thead>
                  <tr>
                    <th style={{ width: "170px" }}>Thời gian</th>
                    <th>Nội dung</th>
                    <th style={{ width: "110px" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="crawl-empty">
                        Chưa có log nào
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td className="mono">{log.time}</td>
                        <td className="log-message">{log.message}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              log.status === "success"
                                ? "pill-success"
                                : log.status === "error"
                                ? "pill-error"
                                : "pill-info"
                            }`}
                          >
                            {log.status === "success"
                              ? "Thành công"
                              : log.status === "error"
                              ? "Lỗi"
                              : "Đang chạy"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="crawl-tip-card">
            <div className="crawl-tip-title">
              <Info size={15} />
              Gợi ý
            </div>
            <p>
              Nếu “Kết quả cào” không hiện, hãy đảm bảo Python log có dòng
              <span className="mono"> Metadata:</span> và
              <span className="mono"> Da luu xong:</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
