import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArchive,
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiDatabase,
  FiExternalLink,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import api, { moderatorLawManagementAPI } from "../../api/law";
import ModeratorWorkspace from "../../components/moderator/ModeratorWorkspace";
import "../../styles/moderator/SimplifyPage.css";

const PAGE_SIZE = 12;

const getPageContent = (response) => response?.data?.content || response?.content || [];
const getTotalPages = (response) => response?.data?.totalPages || response?.totalPages || 1;

const normalizeStatus = (status) => String(status || "").toLowerCase();
const isActiveLaw = (law) => normalizeStatus(law?.status) === "active";

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
};

const shortText = (value, max = 120) => {
  if (!value) return "--";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
};

const buildLawPayload = (law, status) => ({
  title: law.title,
  code: law.code,
  lawType: law.lawType,
  issuedDate: law.issuedDate,
  effectiveDate: law.effectiveDate,
  sourceUrl: law.sourceUrl,
  status,
  amendedBy: law.amendedBy,
  versionNumber: law.versionNumber,
});

export default function SimplifyPage() {
  const [laws, setLaws] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChapterId, setSelectedChapterId] = useState("all");
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setDebouncedKeyword(keyword.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const loadLaws = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await moderatorLawManagementAPI.list(debouncedKeyword, page, PAGE_SIZE);
      const list = getPageContent(response);
      setLaws(list);
      setTotalPages(getTotalPages(response));
      setSelectedLaw((current) => {
        if (!current) return list[0] || null;
        return list.find((law) => law.id === current.id) || current;
      });
    } catch (err) {
      setError(err?.message || err?.data?.message || "Không tải được danh sách luật.");
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, page]);

  const loadLawDetail = useCallback(async (law) => {
    if (!law?.id) {
      setChapters([]);
      setArticles([]);
      return;
    }

    setDetailLoading(true);
    setError("");
    try {
      const [chapterRes, articleRes] = await Promise.all([
        api.get("/moderator/chapters", { params: { lawId: law.id, page: 0, size: 300 } }),
        api.get("/moderator/articles", { params: { lawId: law.id, page: 0, size: 1000 } }),
      ]);

      setChapters(chapterRes.data?.data?.content || []);
      setArticles(articleRes.data?.data?.content || []);
      setSelectedChapterId("all");
      setExpandedArticleId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Không tải được chương và điều luật.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLaws();
  }, [loadLaws]);

  useEffect(() => {
    loadLawDetail(selectedLaw);
  }, [selectedLaw, loadLawDetail]);

  const lawStats = useMemo(() => {
    const active = laws.filter(isActiveLaw).length;
    return {
      total: laws.length,
      active,
      hidden: Math.max(laws.length - active, 0),
    };
  }, [laws]);

  const articlesByChapter = useMemo(() => {
    return articles.reduce((map, article) => {
      const key = article.chapterId || "none";
      if (!map[key]) map[key] = [];
      map[key].push(article);
      return map;
    }, {});
  }, [articles]);

  const visibleArticles = useMemo(() => {
    if (selectedChapterId === "all") return articles;
    return articlesByChapter[selectedChapterId] || [];
  }, [articles, articlesByChapter, selectedChapterId]);

  const handleSelectLaw = (law) => {
    setSelectedLaw(law);
    setNotice("");
  };

  const updateLawStatus = async (law, status) => {
    setActionLoadingId(law.id);
    setNotice("");
    setError("");
    try {
      const response = await moderatorLawManagementAPI.update(law.id, buildLawPayload(law, status));
      const updated = response?.data || response;
      setLaws((current) => current.map((item) => (item.id === law.id ? { ...item, ...updated, status } : item)));
      setSelectedLaw((current) => (current?.id === law.id ? { ...current, ...updated, status } : current));
      setNotice(status === "active" ? "Đã giữ bộ luật này cho user sử dụng." : "Đã ẩn bộ luật này khỏi kết quả người dùng.");
    } catch (err) {
      setError(err?.message || "Không cập nhật được trạng thái bộ luật.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteLaw = async (law) => {
    const ok = window.confirm(`Xóa vĩnh viễn "${law.title}" khỏi database? Thao tác này có thể ảnh hưởng dữ liệu chương/điều đã crawl.`);
    if (!ok) return;

    setActionLoadingId(law.id);
    setNotice("");
    setError("");
    try {
      await moderatorLawManagementAPI.remove(law.id);
      setLaws((current) => current.filter((item) => item.id !== law.id));
      if (selectedLaw?.id === law.id) {
        setSelectedLaw(null);
        setChapters([]);
        setArticles([]);
      }
      setNotice("Đã xóa bộ luật khỏi database.");
    } catch (err) {
      setError(err?.message || "Không xóa được. Nếu bộ luật đang có dữ liệu liên quan, hãy dùng Ẩn khỏi user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderLawActions = (law) => {
    const busy = actionLoadingId === law.id;
    return (
      <div className="law-card-actions">
        {isActiveLaw(law) ? (
          <button className="law-action-button muted" disabled={busy} onClick={(event) => {
            event.stopPropagation();
            updateLawStatus(law, "archived");
          }}>
            <FiArchive /> Ẩn khỏi user
          </button>
        ) : (
          <button className="law-action-button keep" disabled={busy} onClick={(event) => {
            event.stopPropagation();
            updateLawStatus(law, "active");
          }}>
            <FiCheckCircle /> Giữ lại
          </button>
        )}
        <button className="law-action-button danger" disabled={busy} onClick={(event) => {
          event.stopPropagation();
          deleteLaw(law);
        }}>
          <FiTrash2 /> Xóa DB
        </button>
      </div>
    );
  };

  return (
    <ModeratorWorkspace
      active="simplify"
      title="Quản lý luật"
      description="Theo dõi toàn bộ bộ luật đã crawl về database, quyết định bộ luật nào được giữ cho user sử dụng và xem nhanh chương, điều, nội dung văn bản."
      actions={
        <button className="law-refresh-button" onClick={loadLaws} disabled={loading}>
          <FiRefreshCw /> Làm mới
        </button>
      }
    >
      <section className="law-management-shell">
        <div className="law-management-stats">
          <article>
            <span className="stat-icon database"><FiDatabase /></span>
            <p>Tổng bộ luật</p>
            <strong>{lawStats.total}</strong>
          </article>
          <article>
            <span className="stat-icon active"><FiEye /></span>
            <p>Đang cho user dùng</p>
            <strong>{lawStats.active}</strong>
          </article>
          <article>
            <span className="stat-icon hidden"><FiArchive /></span>
            <p>Đã ẩn / chưa dùng</p>
            <strong>{lawStats.hidden}</strong>
          </article>
        </div>

        <div className="law-management-toolbar">
          <label className="law-search-box">
            <FiSearch />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên, mã luật hoặc loại văn bản..."
            />
          </label>
          <div className="law-page-controls">
            <button disabled={page <= 0 || loading} onClick={() => setPage((value) => Math.max(value - 1, 0))}>
              Trước
            </button>
            <span>{page + 1}/{Math.max(totalPages, 1)}</span>
            <button disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>
              Sau
            </button>
          </div>
        </div>

        {notice ? <div className="law-notice success">{notice}</div> : null}
        {error ? <div className="law-notice error">{error}</div> : null}

        <div className="law-management-layout">
          <section className="law-list-panel" aria-label="Danh sách bộ luật">
            <div className="panel-title-row">
              <div>
                <h2>Bộ luật đã crawl</h2>
                <p>Chọn một bộ luật để xem chương và điều bên phải.</p>
              </div>
              <span>{loading ? "Đang tải" : `${laws.length} mục`}</span>
            </div>

            <div className="law-list">
              {!loading && laws.length === 0 ? (
                <div className="law-empty-state">Chưa có bộ luật phù hợp với bộ lọc hiện tại.</div>
              ) : null}

              {loading ? (
                <div className="law-empty-state">Đang tải dữ liệu luật...</div>
              ) : (
                laws.map((law) => (
                  <article
                    key={law.id}
                    className={`law-card ${selectedLaw?.id === law.id ? "selected" : ""}`}
                    onClick={() => handleSelectLaw(law)}
                  >
                    <div className="law-card-main">
                      <span className={`law-status ${isActiveLaw(law) ? "active" : "archived"}`}>
                        {isActiveLaw(law) ? "Đang dùng" : "Đang ẩn"}
                      </span>
                      <h3>{law.title || "Chưa có tên văn bản"}</h3>
                      <p>{law.code || law.lawType || "Chưa có mã luật"}</p>
                    </div>
                    <div className="law-card-meta">
                      <span>Hiệu lực: {formatDate(law.effectiveDate)}</span>
                      <span>Crawl: {formatDate(law.lastCrawledAt)}</span>
                    </div>
                    {renderLawActions(law)}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="law-detail-panel" aria-label="Chi tiết bộ luật">
            {!selectedLaw ? (
              <div className="law-detail-empty">
                <FiBookOpen />
                <h2>Chưa chọn bộ luật</h2>
                <p>Chọn một bộ luật đã crawl để xem chương, điều và nội dung văn bản.</p>
              </div>
            ) : (
              <>
                <div className="law-detail-header">
                  <div>
                    <span className={`law-status ${isActiveLaw(selectedLaw) ? "active" : "archived"}`}>
                      {isActiveLaw(selectedLaw) ? "User có thể tìm/chat theo bộ luật này" : "Đang ẩn khỏi user"}
                    </span>
                    <h2>{selectedLaw.title}</h2>
                    <p>{selectedLaw.code || selectedLaw.lawType || "Văn bản pháp luật"}</p>
                  </div>
                  {selectedLaw.sourceUrl ? (
                    <a className="source-link" href={selectedLaw.sourceUrl} target="_blank" rel="noreferrer">
                      <FiExternalLink /> Nguồn
                    </a>
                  ) : null}
                </div>

                <div className="law-meta-grid">
                  <div><span>Loại</span><strong>{selectedLaw.lawType || "--"}</strong></div>
                  <div><span>Ngày ban hành</span><strong>{formatDate(selectedLaw.issuedDate)}</strong></div>
                  <div><span>Ngày hiệu lực</span><strong>{formatDate(selectedLaw.effectiveDate)}</strong></div>
                  <div><span>Phiên bản</span><strong>{selectedLaw.versionNumber || "--"}</strong></div>
                </div>

                <div className="law-detail-actions">
                  {isActiveLaw(selectedLaw) ? (
                    <button className="law-action-button muted" disabled={actionLoadingId === selectedLaw.id} onClick={() => updateLawStatus(selectedLaw, "archived")}>
                      <FiArchive /> Ẩn khỏi user
                    </button>
                  ) : (
                    <button className="law-action-button keep" disabled={actionLoadingId === selectedLaw.id} onClick={() => updateLawStatus(selectedLaw, "active")}>
                      <FiCheckCircle /> Giữ lại cho user
                    </button>
                  )}
                  <button className="law-action-button danger" disabled={actionLoadingId === selectedLaw.id} onClick={() => deleteLaw(selectedLaw)}>
                    <FiTrash2 /> Xóa khỏi DB
                  </button>
                </div>

                <div className="law-content-head">
                  <div>
                    <h3>Chương và điều luật</h3>
                    <p>{chapters.length} chương, {articles.length} điều trong database.</p>
                  </div>
                  {detailLoading ? <span>Đang tải nội dung...</span> : null}
                </div>

                <div className="chapter-filter-row">
                  <button
                    className={selectedChapterId === "all" ? "active" : ""}
                    onClick={() => setSelectedChapterId("all")}
                  >
                    Tất cả ({articles.length})
                  </button>
                  {chapters.map((chapter) => {
                    const count = (articlesByChapter[chapter.chapterId] || []).length;
                    return (
                      <button
                        key={chapter.chapterId}
                        className={selectedChapterId === chapter.chapterId ? "active" : ""}
                        onClick={() => setSelectedChapterId(chapter.chapterId)}
                        title={chapter.chapterTitle}
                      >
                        {chapter.chapterNumber || "Chương"} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="article-list">
                  {!detailLoading && visibleArticles.length === 0 ? (
                    <div className="law-empty-state">Chưa có điều luật trong phần này.</div>
                  ) : null}

                  {visibleArticles.map((article) => {
                    const expanded = expandedArticleId === article.articleId;
                    return (
                      <article className="article-item" key={article.articleId}>
                        <button className="article-title" onClick={() => setExpandedArticleId(expanded ? null : article.articleId)}>
                          {expanded ? <FiChevronDown /> : <FiChevronRight />}
                          <span>
                            <strong>{article.articleNumber || "Điều"}</strong>
                            {article.articleTitle ? ` - ${article.articleTitle}` : ""}
                          </span>
                        </button>
                        <p className="article-preview">{shortText(article.content, 180)}</p>
                        {expanded ? <div className="article-content">{article.content || "Chưa có nội dung điều luật."}</div> : null}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </section>
    </ModeratorWorkspace>
  );
}
