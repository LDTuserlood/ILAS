import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { lawAPI } from "../../api/law";
import { trackAPI } from "../../api/track";
import "../../styles/user/UserSearch.css";

const UserSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const searchBasePath = location.pathname.startsWith("/user") ? "/user/search" : "/search";

  const [searchKeyword, setSearchKeyword] = useState(() => searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchResults, setSearchResults] = useState({
    laws: [],
    articles: [],
    totalLaws: 0,
    totalArticles: 0,
    totalResults: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [resultMode, setResultMode] = useState("initialLaws");
  const [searchHint, setSearchHint] = useState("");

  const getLawId = (law) => law?.id ?? law?.lawId;
  const getArticleId = (article) => article?.articleId ?? article?.id;

  const saveSearchToHistory = (keyword) => {
    if (!keyword.trim()) return;
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updated = [keyword, ...recent.filter((item) => item !== keyword)].slice(0, 10);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const performSearch = async (keyword, page = 0) => {
    const searchTerm = typeof keyword === "string" ? keyword.trim() : "";
    if (!searchTerm) return;

    setLoading(true);
    setError("");
    setSearchHint("");

    try {
      if (page === 0) {
        trackAPI.searchLog(searchTerm, activeFilter || "all").catch((logError) => {
          console.warn("Search log failed:", logError);
        });
      }

      let response;
      if (activeFilter === "laws") {
        response = await lawAPI.searchLaws(searchTerm, page, 10);
        if (response.success) {
          setSearchResults({
            laws: response.data.content || [],
            articles: [],
            totalLaws: response.data.totalElements || 0,
            totalArticles: 0,
            totalResults: response.data.totalElements || 0,
          });
          setTotalPages(response.data.totalPages || 0);
        }
      } else if (activeFilter === "articles") {
        response = await lawAPI.searchArticles(searchTerm, page, 10);
        if (response.success) {
          setSearchResults({
            laws: [],
            articles: response.data.content || [],
            totalLaws: 0,
            totalArticles: response.data.totalElements || 0,
            totalResults: response.data.totalElements || 0,
          });
          setTotalPages(response.data.totalPages || 0);
        }
      } else {
        response = await lawAPI.searchAll(searchTerm, page, 10);
        if (response.success) {
          setSearchResults({
            laws: response.data.laws || [],
            articles: response.data.articles || [],
            totalLaws: response.data.totalLaws || 0,
            totalArticles: response.data.totalArticles || 0,
            totalResults: response.data.totalResults || 0,
          });
          setTotalPages(response.data.totalPages || 0);
          if (response.data.searchMode === "natural" && response.data.rewrittenQuery) {
            setSearchHint(`Đã hiểu câu hỏi theo hướng: ${response.data.rewrittenQuery}`);
          }
        }
      }

      if (response?.success) {
        const total = (response.data?.totalResults ?? 0) || (response.data?.totalElements ?? 0) || 0;
        setResultMode("search");
        if (total === 0) setError(`Không tìm thấy kết quả cho "${searchTerm}"`);
        setCurrentPage(page);
        if (page === 0) saveSearchToHistory(searchTerm);
      } else {
        setError(response?.message || "Có lỗi xảy ra khi tìm kiếm");
      }
    } catch (requestError) {
      console.error("Search error:", requestError);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialLaws = async (page = 0) => {
    setLoading(true);
    setError("");
    setSearchHint("");
    try {
      const response = await lawAPI.getAllLaws(page, 6);
      if (response?.success) {
        setSearchResults({
          laws: response.data.content || [],
          articles: [],
          totalLaws: response.data.totalElements || 0,
          totalArticles: 0,
          totalResults: response.data.totalElements || 0,
        });
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(page);
        setResultMode("initialLaws");
      }
    } catch (requestError) {
      console.error("Load initial laws error:", requestError);
      setError("Không thể tải dữ liệu pháp luật.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllLaws = () => {
    setActiveFilter("all");
    setSearchKeyword("");
    loadInitialLaws(0);
    navigate(searchBasePath, { replace: true });
  };

  const handleSearch = (keyword = null) => {
    if (keyword && typeof keyword === "object" && "preventDefault" in keyword) keyword = null;
    const term = (typeof keyword === "string" ? keyword : searchKeyword).trim();
    if (!term) {
      setError("Vui lòng nhập từ khóa");
      return;
    }

    performSearch(term, 0);
    navigate(`${searchBasePath}?q=${encodeURIComponent(term)}`, { replace: true });
  };

  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    if (resultMode === "initialLaws") {
      loadInitialLaws(page);
      return;
    }
    if (searchKeyword.trim()) performSearch(searchKeyword.trim(), page);
  };

  const handleViewDetail = (item) => {
    const realId = item.type === "law" ? getLawId(item.data) : getArticleId(item.data);
    if (!realId) {
      setError("Không mở được chi tiết vì dữ liệu thiếu ID.");
      return;
    }
    navigate(`${searchBasePath}/detail?id=${realId}&type=${item.type}&mode=detail`);
  };

  const handleViewSummary = (item) => {
    const lawId = item.type === "law" ? getLawId(item.data) : item.data?.lawId;
    if (!lawId) {
      setError("Không mở được tóm tắt vì dữ liệu thiếu ID bộ luật.");
      return;
    }
    navigate(`${searchBasePath}/detail?id=${lawId}&type=law&mode=summary`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const keyword = searchParams.get("q");

    if (keyword && typeof keyword === "string") {
      setSearchKeyword(keyword);
      performSearch(keyword, 0);
    } else {
      loadInitialLaws(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredResults = useMemo(() => {
    const lawResults = searchResults.laws.map((law, index) => ({
      id: getLawId(law) || `law-${index}`,
      title: law.title || "Văn bản pháp luật",
      desc: `${law.lawType || "Văn bản"} - ${law.code || "Chưa có số hiệu"} - Có hiệu lực từ ${law.effectiveDate ? new Date(law.effectiveDate).toLocaleDateString("vi-VN") : "--"}`,
      type: "law",
      data: law,
    }));

    const articleResults = searchResults.articles.map((article, index) => ({
      id: getArticleId(article) || `article-${index}`,
      title: article.articleTitle || `Điều ${article.articleNumber || ""}`.trim(),
      desc: `${article.lawTitle || ""} ${article.chapterTitle || ""}`.trim(),
      type: "article",
      data: article,
    }));

    if (activeFilter === "laws") return lawResults;
    if (activeFilter === "articles") return articleResults;
    return [...lawResults, ...articleResults];
  }, [activeFilter, searchResults]);

  return (
    <div className="usearch-page">
      <UserSidebar active={isAuthenticated ? "search" : undefined} />

      <main className="usearch-main">
        <section className="usearch-content">
          <h1>Tra cứu Pháp luật</h1>

          <div className="usearch-searchbar">
            <input
              className="usearch-input"
              placeholder="Bộ luật lao động 2019"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
            />

            <button className="usearch-search-btn" onClick={() => handleSearch()} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>

          {error && <div className="usearch-error">{error}</div>}
          {searchHint && <div className="usearch-hint">{searchHint}</div>}

          <div className="usearch-tabs">
            <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>Tất cả</button>
            <button className={activeFilter === "laws" ? "active" : ""} onClick={() => setActiveFilter("laws")}>Văn bản</button>
            <button className={activeFilter === "articles" ? "active" : ""} onClick={() => setActiveFilter("articles")}>Điều</button>
            <button type="button" className="usearch-viewall" onClick={handleViewAllLaws}>Xem tất cả văn bản</button>
          </div>

          {loading && (
            <div className="usearch-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải kết quả...</p>
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <div className="usearch-card-grid">
              {filteredResults.map((item) => (
                <article className="usearch-law-card" key={`${item.type}-${item.id}`}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>

                  <div className="usearch-card-actions">
                    <button type="button" onClick={() => handleViewDetail(item)}>Xem chi tiết</button>
                    <button type="button" className="primary" onClick={() => handleViewSummary(item)}>Tóm tắt bộ luật</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="usearch-empty">Không có dữ liệu phù hợp. Hãy thử từ khóa khác.</div>
          )}

          {!loading && totalPages > 1 && (
            <div className="usearch-pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                &lt; Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => (
                <button key={index} className={currentPage === index ? "active" : ""} onClick={() => handlePageChange(index)}>
                  {index + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
                Tiếp &gt;
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserSearch;
