import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import UserSidebar from "../../components/user/UserSidebar";
import * as formAPI from "../../api/form";
import "../../styles/user/DashboardPage.css";
import "../../styles/user/FormPage.css";

const pageSize = 10;

const formatLabel = (value, fallback) => value || fallback;

const getFileTypeLabel = (item) => formatLabel(item.fileType?.toUpperCase(), "DOCX");

const getFileTypeClassName = (item) => {
  const fileType = (item.fileType || "docx").toLowerCase();
  if (fileType.includes("pdf")) return "pdf";
  if (fileType.includes("doc")) return "docx";
  return "other";
};

const FormPage = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCategories();
  }, []);

  useEffect(() => {
    loadFormTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory]);

  const loadFormTemplates = async (keyword = searchKeyword) => {
    try {
      setLoading(true);
      setError("");

      const hasKeyword = keyword.trim().length > 0;
      let response;

      if (selectedCategory === "Tất cả") {
        response = hasKeyword
          ? await formAPI.searchFormTemplates(keyword, currentPage, pageSize)
          : await formAPI.getFormTemplates(currentPage, pageSize);
      } else {
        response = hasKeyword
          ? await formAPI.searchFormTemplatesByCategory(selectedCategory, keyword, currentPage, pageSize)
          : await formAPI.getFormTemplatesByCategory(selectedCategory, currentPage, pageSize);
      }

      if (response?.success && response.data) {
        const pageData = response.data;
        setForms(pageData.content || []);
        setTotalPages(pageData.totalPages || 0);
        setTotalElements(pageData.totalElements || 0);
      } else {
        setError(response?.message || "Có lỗi xảy ra khi tải dữ liệu biểu mẫu");
      }
    } catch (requestError) {
      console.error("Error loading form templates:", requestError);
      setError("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await formAPI.getFormCategories();
      if (response?.success && Array.isArray(response.data)) {
        setCategories(["Tất cả", ...response.data]);
      }
    } catch (requestError) {
      console.error("Error loading categories:", requestError);
    }
  };

  const handleSearch = (event) => {
    event?.preventDefault();
    setCurrentPage(0);
    loadFormTemplates(searchKeyword);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreview = async (fileUrl, fileName) => {
    try {
      if (!fileUrl) {
        window.alert("Không có file để xem trước");
        return;
      }

      const previewButton = document.querySelector(`[data-preview-id="${fileName}"]`);
      if (previewButton) {
        previewButton.disabled = true;
        previewButton.textContent = "Đang mở...";
      }

      await formAPI.previewFile(fileUrl, fileName);
    } catch (requestError) {
      console.error("Error opening file preview:", requestError);
      window.alert("Không thể mở file để xem trước. Vui lòng thử tải file.");
    } finally {
      const previewButton = document.querySelector(`[data-preview-id="${fileName}"]`);
      if (previewButton) {
        previewButton.disabled = false;
        previewButton.textContent = "Xem trước";
      }
    }
  };

  const handleDownload = async (templateId, fileUrl, fileName) => {
    try {
      if (!fileUrl) {
        window.alert("Không có file để tải về");
        return;
      }

      const downloadButton = document.querySelector(`[data-template-id="${templateId}"]`);
      if (downloadButton) {
        downloadButton.disabled = true;
        downloadButton.textContent = "Đang tải...";
      }

      await formAPI.incrementDownloadCount(templateId);
      await formAPI.downloadFile(fileUrl, fileName);
      await loadFormTemplates(searchKeyword);
    } catch (requestError) {
      console.error("Error downloading file:", requestError);
      window.alert("Có lỗi xảy ra khi tải file");
    } finally {
      const downloadButton = document.querySelector(`[data-template-id="${templateId}"]`);
      if (downloadButton) {
        downloadButton.disabled = false;
        downloadButton.textContent = "Tải xuống";
      }
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 0) {
      pages.push(
        <button key="prev" className="formhub-page-btn" onClick={() => handlePageChange(currentPage - 1)}>
          &lt;
        </button>
      );
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(
        <button
          key={page}
          className={`formhub-page-btn ${page === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(page)}
        >
          {page + 1}
        </button>
      );
    }

    if (currentPage < totalPages - 1) {
      pages.push(
        <button key="next" className="formhub-page-btn" onClick={() => handlePageChange(currentPage + 1)}>
          &gt;
        </button>
      );
    }

    return pages;
  };

  const displayName = user?.fullName || user?.username || "Người dùng";
  const featuredForms = forms.slice(0, 2);
  const libraryForms = forms.length > 2 ? forms.slice(2) : forms;

  return (
    <div className="udash-page formhub-page-shell">
      <UserSidebar active="form" />

      <main className="formhub-main">
        <header className="udash-topbar formhub-topbar">
          <div className="formhub-topbar-title">Worker Assistance Portal</div>
          <div className="udash-user-card">
            <div>
              <div className="udash-user-name">{displayName}</div>
              <div className="udash-user-role">Công nhân</div>
            </div>
            <div className="udash-avatar">👤</div>
          </div>
        </header>

        <section className="formhub-hero">
          <h1>Thư viện Biểu mẫu &amp; Văn bản mẫu</h1>
          <p>
            Cung cấp đầy đủ các mẫu đơn, hợp đồng chuẩn pháp lý giúp bảo vệ quyền lợi người lao động.
          </p>
        </section>

        <section className="formhub-search-panel">
          <form className="formhub-search-row" onSubmit={handleSearch}>
            <input
              className="formhub-search-input"
              placeholder="Search legal forms and templates..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
            <button className="formhub-search-btn" type="submit">
              Tìm kiếm
            </button>
          </form>

          <div className="formhub-category-row">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`formhub-chip ${category === selectedCategory ? "active" : ""}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="formhub-message error">{error}</div>}

        <section className="formhub-section">
          <div className="formhub-section-heading">
            <h2>Biểu mẫu phổ biến</h2>
          </div>

          {loading && forms.length === 0 ? (
            <div className="formhub-empty-state">Đang tải dữ liệu...</div>
          ) : featuredForms.length === 0 ? (
            <div className="formhub-empty-state">
              {searchKeyword || selectedCategory !== "Tất cả"
                ? "Không tìm thấy biểu mẫu phù hợp"
                : "Chưa có biểu mẫu nào"}
            </div>
          ) : (
            <div className="formhub-featured-grid">
              {featuredForms[0] && (
                <article className="formhub-featured-card large">
                  <span className="formhub-badge">DUOC DUNG NHIEU NHAT</span>
                  <div className="formhub-featured-content">
                    <div className="formhub-featured-copy">
                      <h3>{featuredForms[0].title}</h3>
                      <p>{formatLabel(featuredForms[0].description, "Mau bieu mau chuan phap ly danh cho nguoi lao dong.")}</p>
                      <div className="formhub-meta-row">
                        <span>{getFileTypeLabel(featuredForms[0])}</span>
                        <span>{formatLabel(featuredForms[0].formattedFileSize, "N/A")}</span>
                        <span>{featuredForms[0].downloadCount || 0} luot tai</span>
                      </div>
                      <div className="formhub-action-row">
                        <button
                          type="button"
                          className="formhub-primary-btn"
                          onClick={() => handleDownload(featuredForms[0].templateId, featuredForms[0].fileUrl, featuredForms[0].fileName)}
                          data-template-id={featuredForms[0].templateId}
                        >
                          Tải xuống
                        </button>
                        <button
                          type="button"
                          className="formhub-secondary-btn"
                          onClick={() => handlePreview(featuredForms[0].fileUrl, featuredForms[0].fileName)}
                          data-preview-id={featuredForms[0].fileName}
                        >
                          Xem trước
                        </button>
                      </div>
                    </div>

                    <div className="formhub-preview-sheet">
                      <div className={`formhub-file-badge ${getFileTypeClassName(featuredForms[0])}`}>
                        {getFileTypeLabel(featuredForms[0])}
                      </div>
                      <div className="formhub-preview-line short"></div>
                      <div className="formhub-preview-line"></div>
                      <div className="formhub-preview-line"></div>
                      <div className="formhub-preview-stamp"></div>
                    </div>
                  </div>
                </article>
              )}

              {featuredForms[1] && (
                <article className="formhub-featured-card compact">
                  <div className="formhub-mini-icon">✓</div>
                  <h3>{featuredForms[1].title}</h3>
                  <p>{formatLabel(featuredForms[1].description, "Tai lieu huong dan su dung va tra cuu nhanh.")}</p>
                  <button
                    type="button"
                    className="formhub-secondary-btn full"
                    onClick={() => handlePreview(featuredForms[1].fileUrl, featuredForms[1].fileName)}
                    data-preview-id={featuredForms[1].fileName}
                  >
                    Xem hướng dẫn
                  </button>
                  <button
                    type="button"
                    className="formhub-primary-btn full"
                    onClick={() => handleDownload(featuredForms[1].templateId, featuredForms[1].fileUrl, featuredForms[1].fileName)}
                    data-template-id={featuredForms[1].templateId}
                  >
                    Tải file .{(featuredForms[1].fileType || "docx").toLowerCase()}
                  </button>
                </article>
              )}
            </div>
          )}
        </section>

        <section className="formhub-section">
          <div className="formhub-section-heading split">
            <h2>Tất cả tài liệu</h2>
            <span>{totalElements} tài liệu</span>
          </div>

          <div className="formhub-library-grid">
            {(libraryForms.length === 0 && featuredForms.length > 0 ? featuredForms : libraryForms).map((item) => (
              <article key={`library-${item.templateId}`} className="formhub-library-card">
                <div className="formhub-library-top">
                  <span className={`formhub-file-pill ${getFileTypeClassName(item)}`}>{getFileTypeLabel(item)}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{formatLabel(item.description, "Tai lieu mau danh cho nguoi lao dong.")}</p>
                <div className="formhub-library-actions">
                  <button
                    type="button"
                    className="formhub-library-btn primary"
                    onClick={() => handleDownload(item.templateId, item.fileUrl, item.fileName)}
                    data-template-id={item.templateId}
                  >
                    Tải xuống
                  </button>
                  <button
                    type="button"
                    className="formhub-library-btn"
                    onClick={() => handlePreview(item.fileUrl, item.fileName)}
                    data-preview-id={item.fileName}
                  >
                    Xem
                  </button>
                </div>
              </article>
            ))}
          </div>

          {loading && forms.length > 0 && <div className="formhub-pagination-loading">Đang tải...</div>}

          {totalPages > 1 && <div className="formhub-pagination">{renderPagination()}</div>}
        </section>

        <section className="formhub-cta">
          <div className="formhub-cta-copy">
            <h2>Không tìm thấy mẫu bạn cần?</h2>
            <p>
              Nếu tình huống của bạn mang tính đặc thù, hãy liên hệ để được hỗ trợ soạn thảo biểu mẫu
              phù hợp với trường hợp cụ thể.
            </p>
            <button type="button" className="formhub-cta-btn">
              Yêu cầu soạn thảo riêng
            </button>
          </div>
          <div className="formhub-cta-visual">
            <div className="formhub-cta-orb"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FormPage;