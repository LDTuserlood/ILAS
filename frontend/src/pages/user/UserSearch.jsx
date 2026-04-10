import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { lawAPI } from "../../api/law";
import { trackAPI } from "../../api/track";
import "../../styles/user/UserSearch.css";

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

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
  const [searchType] = useState("all");

  const saveSearchToHistory = (keyword) => {
    if (!keyword.trim()) return;
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updated = [keyword, ...recent.filter((i) => i !== keyword)].slice(0, 10);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const performSearch = async (keyword, page = 0) => {
    const searchTerm = typeof keyword === "string" ? keyword.trim() : "";
    if (!searchTerm) return;

    setLoading(true);
    setError("");

    try {
      if (page === 0) {
        trackAPI.searchLog(searchTerm, searchType || "all");
      }

      let response;
      if (searchType === "laws") {
        response = await lawAPI.searchLaws(searchTerm, page, 10);
        if (response.success) {
          setSearchResults({
            laws: response.data.content,
            articles: [],
            totalLaws: response.data.totalElements,
            totalArticles: 0,
            totalResults: response.data.totalElements,
          });
          setTotalPages(response.data.totalPages);
        }
      } else if (searchType === "articles") {
        response = await lawAPI.searchArticles(searchTerm, page, 10);
        if (response.success) {
          setSearchResults({
            laws: [],
            articles: response.data.content,
            totalLaws: 0,
            totalArticles: response.data.totalElements,
            totalResults: response.data.totalElements,
          });
          setTotalPages(response.data.totalPages);
        }
      } else {
        response = await lawAPI.searchAll(searchTerm, page, 10);
        if (response.success) {
          setSearchResults(response.data);
          setTotalPages(response.data.totalPages);
        }
      }

      if (response?.success) {
        const total = (response.data?.totalResults ?? 0) || (response.data?.totalElements ?? 0) || 0;
        if (total === 0) {
          setError(`Không tìm thấy kết quả cho "${searchTerm}"`);
        }
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

  const handleViewAllArticles = async () => {
    setLoading(true);
    setError("");
    try {
      const articlesRes = await lawAPI.getAllArticles(0, 10);
      if (articlesRes?.success) {
        const articlesPage = articlesRes.data || {};
        const articles = articlesPage.content || [];
        const totalArticles = articlesPage.totalElements || 0;

        setSearchResults({
          laws: [],
          articles,
          totalLaws: 0,
          totalArticles,
          totalResults: totalArticles,
        });

        setTotalPages(articlesPage.totalPages || 0);
        setCurrentPage(0);
        setSearchKeyword("");
        setActiveFilter("articles");
      } else {
        setError(articlesRes?.message || "Không tải được danh sách điều luật");
      }
    } catch (requestError) {
      console.error("Load all articles error:", requestError);
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword = null) => {
    if (keyword && typeof keyword === "object" && "preventDefault" in keyword) {
      keyword = null;
    }
    const term = (typeof keyword === "string" ? keyword : searchKeyword).trim();
    if (!term) {
      setError("Vui lòng nhập từ khóa");
      return;
    }

    performSearch(term, 0);
    navigate(`/user/search?q=${encodeURIComponent(term)}`, { replace: true });
  };

  const handlePageChange = (page) => {
    if (searchKeyword.trim()) performSearch(searchKeyword.trim(), page);
  };

  const handleViewDetail = (item) => {
    const realId = item.type === "law" ? item.data.lawId : item.data.articleId;
    navigate(`/user/search/detail?id=${realId}&type=${item.type}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const keyword = searchParams.get("q");

    const loadInitialData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await lawAPI.getAllLaws(0, 6);
        if (response?.success) {
          setSearchResults({
            laws: response.data.content || [],
            articles: [],
            totalLaws: response.data.totalElements || 0,
            totalArticles: 0,
            totalResults: response.data.totalElements || 0,
          });
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(0);
        }
      } catch (requestError) {
        console.error("Load initial laws error:", requestError);
        setError("Không thể tải dữ liệu pháp luật.");
      } finally {
        setLoading(false);
      }
    };

    if (keyword && typeof keyword === "string") {
      setSearchKeyword(keyword);
      performSearch(keyword, 0);
    } else {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredResults = useMemo(() => {
    if (activeFilter === "laws") {
      return searchResults.laws.map((law, index) => ({
        id: law.lawId || `law-${index}`,
        title: law.title,
        desc: `${law.lawType} - ${law.code} - Có hiệu lực từ ${new Date(law.effectiveDate).toLocaleDateString("vi-VN")}`,
        type: "law",
        data: law,
      }));
    }

    if (activeFilter === "articles") {
      return searchResults.articles.map((a, index) => ({
        id: a.articleId || `article-${index}`,
        title: a.articleTitle,
        desc: `${a.lawTitle || ""} ${a.chapterTitle || ""}`,
        type: "article",
        data: a,
      }));
    }

    return [
      ...searchResults.laws.map((law, index) => ({
        id: law.lawId || `law-${index}`,
        title: law.title,
        desc: `${law.lawType} - ${law.code} - Có hiệu lực từ ${new Date(law.effectiveDate).toLocaleDateString("vi-VN")}`,
        type: "law",
        data: law,
      })),
      ...searchResults.articles.map((a, index) => ({
        id: a.articleId || `article-${index}`,
        title: a.articleTitle,
        desc: `${a.lawTitle || ""} ${a.chapterTitle || ""}`,
        type: "article",
        data: a,
      })),
    ];
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
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <button className="usearch-search-btn" onClick={() => handleSearch()} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>

          {error && <div className="usearch-error">{error}</div>}

          <div className="usearch-tabs">
            <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>Tất cả</button>
            <button className={activeFilter === "laws" ? "active" : ""} onClick={() => setActiveFilter("laws")}>Văn bản</button>
            <button className={activeFilter === "articles" ? "active" : ""} onClick={() => setActiveFilter("articles")}>Điều</button>
            <button type="button" className="usearch-viewall" onClick={handleViewAllArticles}>Xem tất cả điều luật</button>
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
                <article className="usearch-law-card" key={item.id}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>

                  <div className="usearch-card-actions">
                    <button type="button" onClick={() => handleViewDetail(item)}>Xem chi tiết</button>
                    <button type="button" className="primary" onClick={() => handleViewDetail(item)}>Xem giải thích</button>
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button key={i} className={currentPage === i ? "active" : ""} onClick={() => handlePageChange(i)}>
                  {i + 1}
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
