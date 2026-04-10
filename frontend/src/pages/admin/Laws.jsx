// Laws.jsx - Quản lý Văn bản Pháp luật & Nội dung Đơn giản hóa
import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { editorLawManagementAPI } from '../../api/law';
import { Plus, Eye, Edit, Trash2, FileText, Check, X, Clock, BookOpen } from 'lucide-react';
import '../../styles/admin/laws.css';
import '../../styles/admin/simplified.css';

export default function Laws({ hideSimplifiedManagement = false }) {
  const [activeTab, setActiveTab] = useState('laws'); // 'laws' | 'chapters' | 'articles' | 'simplified'
  
  // ===== VĂN BẢN PHÁP LUẬT =====
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLaw, setUploadLaw] = useState({
    title: '',
    description: '',
    category: '',
    version: '',
    file: null
  });

  const [laws, setLaws] = useState([]);
  const [loadingLaws, setLoadingLaws] = useState(false);
  const [lawError, setLawError] = useState(null);

  // ===== CHAPTERS & ARTICLES =====
  const [chapters, setChapters] = useState([]);
  const [articles, setArticles] = useState([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [chapterStatusFilter, setChapterStatusFilter] = useState('');
  const [articleStatusFilter, setArticleStatusFilter] = useState('');
  const [chapterPage, setChapterPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const PAGE_SIZE = 10;
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [chapterError, setChapterError] = useState(null);
  const [articleError, setArticleError] = useState(null);
  const mapLawDto = (law) => ({
    id: law.id,
    title: law.title || 'Chưa có tiêu đề',
    description: law.code || '',
    category: law.lawType || 'Khác',
    version: law.versionNumber ? String(law.versionNumber) : '',
    uploadDate: law.effectiveDate || law.issuedDate || '',
    status: law.status || 'active'
  });

  useEffect(() => {
    const fetchLaws = async () => {
      setLoadingLaws(true);
      setLawError(null);
      try {
        const res = await api.get('/editor/laws', { params: { page: 0, size: 50 } });
        const content = res?.data?.data?.content || [];
        const mapped = content.map(mapLawDto);
        setLaws(mapped);
      } catch (e) {
        const message = e?.response?.data?.message || 'Không tải được danh sách luật';
        setLawError(message);
      } finally {
        setLoadingLaws(false);
      }
    };

    fetchLaws();
  }, []);

  useEffect(() => {
    if (activeTab === 'chapters') {
      const fetchChapters = async () => {
        setLoadingChapters(true);
        setChapterError(null);
        try {
          const res = await api.get('/editor/chapters', { params: { page: 0, size: 2000 } });
          const content = res?.data?.data?.content || [];
          setChapters(content);
        } catch (e) {
          const message = e?.response?.data?.message || 'Không tải được danh sách chương';
          setChapterError(message);
        } finally {
          setLoadingChapters(false);
        }
      };
      fetchChapters();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'articles') {
      const fetchArticles = async () => {
        setLoadingArticles(true);
        setArticleError(null);
        try {
          const res = await api.get('/editor/articles', { params: { page: 0, size: 2000 } });
          const content = res?.data?.data?.content || [];
          setArticles(content);
        } catch (e) {
          const message = e?.response?.data?.message || 'Không tải được danh sách điều';
          setArticleError(message);
        } finally {
          setLoadingArticles(false);
        }
      };
      fetchArticles();
    }
  }, [activeTab]);


  // ===== NỘI DUNG ĐƠN GIẢN HÓA =====
  const [simplifiedItems, setSimplifiedItems] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [loadingSimplified, setLoadingSimplified] = useState(false);
  const [simplifiedError, setSimplifiedError] = useState(null);
  const [approvalTab, setApprovalTab] = useState('pending');

  // ===== MODAL STATE =====
  const [modal, setModal] = useState({
    open: false,
    mode: null, // 'view' | 'edit' | 'delete'
    entity: null, // 'law' | 'chapter' | 'article'
    item: null,
    titleInput: '',
    statusInput: '',
    contentInput: '',
    chapterInput: '',
    loading: false,
    error: null
  });

  // ===== HANDLERS VĂN BẢN PHÁP LUẬT =====
  const handleUpload = () => {
    if (!uploadLaw.title || !uploadLaw.category || !uploadLaw.version) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const newLaw = {
      id: laws.length + 1,
      ...uploadLaw,
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
      downloads: 0,
      status: 'active'
    };
    setLaws([...laws, newLaw]);
    setShowUploadModal(false);
    setUploadLaw({ title: '', description: '', category: '', version: '', file: null });
    alert('Đã thêm văn bản pháp luật thành công!');
  };

  const handleDeleteLaw = (id) => {
    const law = laws.find((l) => l.id === id);
    if (!law) return;
    setModal({
      open: true,
      mode: 'delete',
      entity: 'law',
      item: law,
      titleInput: ''
    });
  };

  // ===== HANDLERS CHAPTERS =====
  const handleViewChapter = (ch) => {
    setModal({
      open: true,
      mode: 'view',
      entity: 'chapter',
      item: ch,
      titleInput: '',
      statusInput: ch.status || ''
    });
  };

  const handleEditChapter = (chId) => {
    const ch = chapters.find((c) => c.chapterId === chId);
    if (!ch) return;
    setModal({
      open: true,
      mode: 'edit',
      entity: 'chapter',
      item: ch,
      titleInput: ch.chapterTitle || '',
      statusInput: ch.status || ''
    });
  };

  const handleDeleteChapter = (chId) => {
    const ch = chapters.find((c) => c.chapterId === chId);
    if (!ch) return;
    setModal({
      open: true,
      mode: 'delete',
      entity: 'chapter',
      item: ch,
      titleInput: ''
    });
  };

  // ===== HANDLERS ARTICLES =====
  const handleViewArticle = (ar) => {
    setModal({
      open: true,
      mode: 'view',
      entity: 'article',
      item: ar,
      titleInput: '',
      statusInput: ar.status || '',
      contentInput: ar.content || '',
      chapterInput: ar.chapterTitle || ''
    });
  };

  const handleEditArticle = (arId) => {
    const ar = articles.find((a) => a.articleId === arId);
    if (!ar) return;
    setModal({
      open: true,
      mode: 'edit',
      entity: 'article',
      item: ar,
      titleInput: ar.articleTitle || '',
      statusInput: ar.status || '',
      contentInput: ar.content || '',
      chapterInput: ar.chapterTitle || ''
    });
  };

  const handleDeleteArticle = (arId) => {
    const ar = articles.find((a) => a.articleId === arId);
    if (!ar) return;
    setModal({
      open: true,
      mode: 'delete',
      entity: 'article',
      item: ar,
      titleInput: ''
    });
  };

  // ===== HANDLERS NỘI DUNG ĐƠN GIẢN HÓA =====
  const fetchSimplified = async (statusKey) => {
    setLoadingSimplified(true);
    setSimplifiedError(null);
    try {
      const res = await api.get('/editor/simplified-management', {
        params: { status: statusKey.toUpperCase(), page: 0, size: 50 }
      });
      const content = res?.data?.data?.content || [];
      const mapped = content.map((item) => ({
        id: item.id,
        title: item.title || item.contentSimplified?.slice(0, 80) || `Bài ${item.id}`,
        author: item.editorName || 'Chưa rõ',
        category: item.category || 'Khác',
        submittedAt: item.createdAt || '',
        type: 'Nội dung đơn giản hóa',
        summary: item.contentSimplified,
        status: item.status || statusKey.toUpperCase()
      }));
      setSimplifiedItems((prev) => ({
        ...prev,
        [statusKey]: mapped
      }));
    } catch (e) {
      const message = e?.response?.data?.message || 'Không tải được nội dung đơn giản hóa';
      setSimplifiedError(message);
    } finally {
      setLoadingSimplified(false);
    }
  };

  const handleApprove = async (id) => {
    const item = simplifiedItems.pending.find((i) => i.id === id);
    if (!item || !window.confirm(`Bạn có chắc chắn muốn duyệt "${item.title}"?`)) return;
    try {
      await api.put(`/editor/simplified-management/${id}/approve`);
      setSimplifiedItems((prev) => ({
        pending: prev.pending.filter((i) => i.id !== id),
        approved: [...prev.approved, { ...item, status: 'APPROVED', approvedAt: new Date().toLocaleString('vi-VN') }],
        rejected: prev.rejected
      }));
      alert('Đã duyệt thành công!');
    } catch (e) {
      alert(e?.response?.data?.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async (id) => {
    const item = simplifiedItems.pending.find((i) => i.id === id);
    if (!item) return;
    const reason = window.prompt(`Lý do từ chối "${item.title}":`);
    if (!reason) return;
    try {
      await api.put(`/editor/simplified-management/${id}/reject`);
      setSimplifiedItems((prev) => ({
        pending: prev.pending.filter((i) => i.id !== id),
        approved: prev.approved,
        rejected: [...prev.rejected, { ...item, status: 'REJECTED', rejectedAt: new Date().toLocaleString('vi-VN'), reason }]
      }));
      alert('Đã từ chối!');
    } catch (e) {
      alert(e?.response?.data?.message || 'Từ chối thất bại');
    }
  };

  useEffect(() => {
    if (!hideSimplifiedManagement && activeTab === 'simplified') {
      fetchSimplified(approvalTab);
    }
  }, [activeTab, approvalTab, hideSimplifiedManagement]);

  // Reset page when filters change
  useEffect(() => {
    setChapterPage(1);
  }, [chapterSearch, chapterStatusFilter]);

  useEffect(() => {
    setArticlePage(1);
  }, [articleSearch, articleStatusFilter]);

  const renderApprovalItem = (item, status) => (
    <div key={item.id} className="approval-item">
      <div className="approval-info">
        <div className="approval-title">{item.title}</div>
        <div className="approval-author">
          <span style={{ marginRight: '1rem' }}>Tác giả: {item.author}</span>
          <span style={{ marginRight: '1rem' }}>Loại: {item.type}</span>
          <span>
            {status === 'pending' && `Gửi lúc: ${item.submittedAt}`}
            {status === 'approved' && `Duyệt lúc: ${item.approvedAt}`}
            {status === 'rejected' && `Từ chối lúc: ${item.rejectedAt}`}
          </span>
        </div>
        {item.summary && (
          <div style={{ marginTop: '0.5rem', color: '#374151', fontSize: '0.95rem', lineHeight: 1.4, maxHeight: '140px', overflow: 'hidden' }}>
            {item.summary}
          </div>
        )}
        {status === 'rejected' && item.reason && (
          <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
            Lý do: {item.reason}
          </div>
        )}
      </div>
      {status === 'pending' && (
        <div className="approval-actions">
          <button className="approval-btn approve" onClick={() => handleApprove(item.id)}>
            <Check size={16} style={{ marginRight: '0.25rem' }} />
            Duyệt
          </button>
          <button className="approval-btn reject" onClick={() => handleReject(item.id)}>
            <X size={16} style={{ marginRight: '0.25rem' }} />
            Từ chối
          </button>
        </div>
      )}
      {status === 'approved' && (
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Đã duyệt
        </div>
      )}
      {status === 'rejected' && (
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Đã từ chối
        </div>
      )}
    </div>
  );

  const categories = ['Lao động', 'Bảo hiểm', 'Thuế', 'Dân sự', 'Hình sự', 'Khác'];

  const lawCount = laws.length;
  const chapterCount = chapters.length;
  const articleCount = articles.length;
  const filteredChapters = chapters.filter((ch) => {
    const keyword = chapterSearch.trim().toLowerCase();
    const matchKeyword = !keyword || [
      ch.chapterTitle,
      ch.chapterNumber,
      ch.lawTitle,
      ch.lawId
    ].some((v) => String(v || '').toLowerCase().includes(keyword));
    const matchStatus = !chapterStatusFilter || (ch.status || '').toLowerCase() === chapterStatusFilter.toLowerCase();
    return matchKeyword && matchStatus;
  });
  const filteredArticles = articles.filter((ar) => {
    const keyword = articleSearch.trim().toLowerCase();
    const matchKeyword = !keyword || [
      ar.articleTitle,
      ar.articleNumber,
      ar.chapterTitle,
      ar.lawTitle,
      ar.content
    ].some((v) => String(v || '').toLowerCase().includes(keyword));
    const matchStatus = !articleStatusFilter || (ar.status || '').toLowerCase() === articleStatusFilter.toLowerCase();
    return matchKeyword && matchStatus;
  });
  const filteredChapterCount = filteredChapters.length;
  const filteredArticleCount = filteredArticles.length;
  const totalChapterPages = Math.max(1, Math.ceil(filteredChapterCount / PAGE_SIZE));
  const totalArticlePages = Math.max(1, Math.ceil(filteredArticleCount / PAGE_SIZE));
  const pagedChapters = filteredChapters.slice((chapterPage - 1) * PAGE_SIZE, chapterPage * PAGE_SIZE);
  const pagedArticles = filteredArticles.slice((articlePage - 1) * PAGE_SIZE, articlePage * PAGE_SIZE);

  // Pagination helper
  const renderPagination = (totalPages, currentPage, onChange) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const addPage = (p) => pages.push(p);
    const range = (start, end) => { for (let i = start; i <= end; i += 1) addPage(i); };

    if (totalPages <= 7) {
      range(1, totalPages);
    } else {
      range(1, 2);
      if (currentPage > 4) pages.push('ellipsis-start');
      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      range(start, end);
      if (currentPage < totalPages - 3) pages.push('ellipsis-end');
      range(totalPages - 1, totalPages);
    }

    const btnStyle = (active) => ({
      minWidth: '40px',
      padding: '8px 12px',
      margin: '0 4px',
      borderRadius: '10px',
      border: active ? '1px solid #2563eb' : '1px solid #e5e7eb',
      background: active ? '#2563eb' : '#fff',
      color: active ? '#fff' : '#111827',
      cursor: 'pointer',
      fontWeight: 600
    });

    const ctrlStyle = {
      minWidth: '60px',
      padding: '8px 12px',
      margin: '0 4px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      background: '#fff',
      color: '#6b7280',
      cursor: 'pointer',
      fontWeight: 600
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
        <button
          style={{ ...ctrlStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'default' : 'pointer' }}
          onClick={() => currentPage > 1 && onChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt; Trước
        </button>
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span key={`${p}-${idx}`} style={{ margin: '0 6px', color: '#9ca3af', fontWeight: 700 }}>…</span>
            );
          }
          return (
            <button
              key={p}
              style={btnStyle(p === currentPage)}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          );
        })}
        <button
          style={{ ...ctrlStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'default' : 'pointer' }}
          onClick={() => currentPage < totalPages && onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp &gt;
        </button>
      </div>
    );
  };

  // Avoid duplicate "Điều 1 - Điều 1..." when articleTitle already contains the prefix
  const formatArticleTitle = (ar) => {
    const rawTitle = ar.articleTitle || '';
    const cleaned = rawTitle.replace(/^Điều\s+\d+\.?\s*-?\s*/i, '').trim();
    const base = ar.articleNumber ? `Điều ${ar.articleNumber}` : 'Điều';
    return cleaned ? `${base} - ${cleaned}` : base;
  };
  const pendingCount = simplifiedItems.pending.length;
  const approvedCount = simplifiedItems.approved.length;
  const rejectedCount = simplifiedItems.rejected.length;
  const chapterStatusOptions = ['active', 'archived'];

  const formatUploadDate = (dateStr) => {
    if (!dateStr) return '--/--/----';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatVersionLabel = (v) => {
    const n = Number(v || 1);
    if (!Number.isFinite(n)) return 'V1.0 - Chính thức';
    return `V${n}.0 - Chính thức`;
  };

  const closeModal = () => {
    setModal({
      open: false,
      mode: null,
      entity: null,
      item: null,
      titleInput: '',
      statusInput: '',
      contentInput: '',
      chapterInput: '',
      loading: false,
      error: null
    });
  };

  const handleModalConfirm = async () => {
    if (!modal.item || !modal.mode || !modal.entity) return closeModal();
    if (modal.mode === 'view') return closeModal();

    setModal((m) => ({ ...m, loading: true, error: null }));

    if (modal.entity === 'law') {
      try {
        if (modal.mode === 'edit') {
          const payload = { title: modal.titleInput };
          const res = await editorLawManagementAPI.update(modal.item.id, payload);
          const updated = mapLawDto(res?.data || modal.item);
          setLaws(laws.map((l) => (l.id === modal.item.id ? updated : l)));
        } else if (modal.mode === 'delete') {
          await editorLawManagementAPI.remove(modal.item.id);
          setLaws(laws.filter((l) => l.id !== modal.item.id));
        }
        closeModal();
        return;
      } catch (e) {
        const message = e?.response?.data?.message || 'Thao tác thất bại';
        setModal((m) => ({ ...m, loading: false, error: message }));
        return;
      }
    }

    if (modal.mode === 'edit') {
      if (modal.entity === 'law') {
        setLaws(laws.map((l) => l.id === modal.item.id ? { ...l, title: modal.titleInput } : l));
      } else if (modal.entity === 'chapter') {
        setChapters(chapters.map((c) => c.chapterId === modal.item.chapterId ? { ...c, chapterTitle: modal.titleInput, status: modal.statusInput || c.status } : c));
      } else if (modal.entity === 'article') {
        setArticles(articles.map((a) => a.articleId === modal.item.articleId ? {
          ...a,
          articleTitle: modal.titleInput,
          content: modal.contentInput,
          chapterTitle: modal.chapterInput || a.chapterTitle,
          status: modal.statusInput || a.status
        } : a));
      }
    }
    if (modal.mode === 'delete') {
      if (modal.entity === 'law') {
        setLaws(laws.filter((l) => l.id !== modal.item.id));
      } else if (modal.entity === 'chapter') {
        setChapters(chapters.filter((c) => c.chapterId !== modal.item.chapterId));
      } else if (modal.entity === 'article') {
        setArticles(articles.filter((a) => a.articleId !== modal.item.articleId));
      }
    }
    closeModal();
  };

  const renderModalContent = () => {
    if (!modal.open || !modal.item) return null;
    const isLaw = modal.entity === 'law';
    const isChapter = modal.entity === 'chapter';
    const title = isLaw
      ? (modal.item.title || `Luật ${modal.item.id}`)
      : isChapter
      ? (modal.item.chapterTitle || modal.item.chapterNumber || `Chương ${modal.item.chapterId}`)
      : (modal.item.articleTitle || modal.item.articleNumber || `Điều ${modal.item.articleId}`);
    const metaLine = isLaw
      ? `Phiên bản: ${modal.item.version || '-'}` 
      : isChapter
        ? `Luật: ${modal.item.lawTitle || modal.item.lawId || '-' }`
        : `Luật: ${modal.item.lawTitle || modal.item.lawId || '-'} • Chương: ${modal.item.chapterTitle || modal.item.chapterId || '-'}`;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}
        onClick={closeModal}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            width: '90%',
            maxWidth: '520px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>
              {modal.mode === 'view' && 'Xem chi tiết'}
              {modal.mode === 'edit' && 'Chỉnh sửa'}
              {modal.mode === 'delete' && 'Xác nhận xóa'}
            </h3>
            <button onClick={closeModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
          </div>

          <div style={{ marginBottom: '12px', color: '#111827', fontWeight: 600 }}>{title}</div>
          <div style={{ marginBottom: '12px', color: '#4b5563' }}>{metaLine}</div>
          <div style={{ marginBottom: '16px', color: '#4b5563' }}>Trạng thái: {modal.item.status}</div>

      {modal.mode === 'view' && modal.item.content && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', color: '#1f2937' }}>
              {modal.item.content}
            </div>
          )}
      {modal.mode === 'view' && modal.entity === 'law' && (
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto', color: '#1f2937' }}>
          {modal.item.description || 'Không có mô tả'}
        </div>
      )}

          {modal.mode === 'edit' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151' }}>Tiêu đề</label>
              <input
                type="text"
                value={modal.titleInput}
                onChange={(e) => setModal({ ...modal, titleInput: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  outline: 'none'
                }}
              />
              {modal.entity === 'article' && (
                <>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151' }}>Chương</label>
                    <input
                      type="text"
                      value={modal.chapterInput}
                      onChange={(e) => setModal({ ...modal, chapterInput: e.target.value })}
                      placeholder="Tên chương"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151' }}>Nội dung</label>
                    <textarea
                      value={modal.contentInput}
                      onChange={(e) => setModal({ ...modal, contentInput: e.target.value })}
                      rows={6}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151' }}>Trạng thái</label>
                    <select
                      value={modal.statusInput}
                      onChange={(e) => setModal({ ...modal, statusInput: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        outline: 'none',
                        background: '#fff'
                      }}
                    >
                      <option value="">(Giữ nguyên)</option>
                      <option value="active">active</option>
                      <option value="archived">archived</option>
                    </select>
                  </div>
                </>
              )}
              {modal.entity === 'chapter' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#374151' }}>Trạng thái</label>
                  <select
                    value={modal.statusInput}
                    onChange={(e) => setModal({ ...modal, statusInput: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="">(Giữ nguyên)</option>
                    {chapterStatusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {modal.error && (
            <div style={{ marginBottom: '12px', color: '#b91c1c', fontWeight: 600 }}>
              {modal.error}
            </div>
          )}

          {modal.mode === 'delete' && (
            <div style={{ marginBottom: '16px', color: '#b91c1c', fontWeight: 600 }}>
              Bạn chắc chắn muốn xóa {isLaw ? 'văn bản' : isChapter ? 'chương' : 'điều'} này?
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={closeModal}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#111827',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            {modal.mode !== 'view' && (
              <button
                onClick={handleModalConfirm}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                background: modal.loading
                  ? '#9ca3af'
                  : modal.mode === 'delete'
                    ? '#ef4444'
                    : '#2563eb',
                  color: '#fff',
                cursor: modal.loading ? 'not-allowed' : 'pointer',
                opacity: modal.loading ? 0.8 : 1
                }}
              disabled={modal.loading}
              >
                {modal.loading ? 'Đang xử lý...' : modal.mode === 'delete' ? 'Xóa' : 'Lưu'}
              </button>
            )}
            {modal.mode === 'view' && (
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="laws-container laws-shell" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="laws-header">
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#2c3e50', marginBottom: '0.5rem' }}>
            {hideSimplifiedManagement ? 'Quản Lý Văn Bản Pháp Luật' : 'Quản Lý Luật & Nội Dung Đơn Giản Hóa'}
          </h1>
          <p style={{ color: '#6b7280' }}>
            {hideSimplifiedManagement
              ? 'Quản lý các văn bản luật, chương và điều khoản chính thức'
              : 'Quản lý văn bản pháp luật và duyệt nội dung đơn giản hóa'}
          </p>
        </div>
        {activeTab === 'laws' && (
          <div className="laws-actions">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-add-law"
            >
              <Plus size={18} />
              Thêm Văn Bản
            </button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="approval-tabs" style={{ marginBottom: '2rem' }}>
        <button
          className={`approval-tab ${activeTab === 'laws' ? 'active' : ''}`}
          onClick={() => setActiveTab('laws')}
        >
          <FileText size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Văn Bản Pháp Luật <span className="laws-count-badge">{lawCount}</span>
        </button>
        <button
          className={`approval-tab ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          <BookOpen size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Chương ({chapterCount})
        </button>
        <button
          className={`approval-tab ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          <BookOpen size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Điều ({articleCount})
        </button>
        {!hideSimplifiedManagement && (
          <button
            className={`approval-tab ${activeTab === 'simplified' ? 'active' : ''}`}
            onClick={() => setActiveTab('simplified')}
          >
            <Clock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Nội Dung Đơn Giản Hóa ({pendingCount + approvedCount + rejectedCount})
          </button>
        )}
      </div>

      {/* VĂN BẢN PHÁP LUẬT TAB */}
      {activeTab === 'laws' && (
        <>
          {/* Laws List */}
          <div className="laws-list laws-grid-list">
            {loadingLaws && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Đang tải danh sách luật...
              </div>
            )}
            {lawError && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#ef4444' }}>
                {lawError}
              </div>
            )}
            {!loadingLaws && !lawError && laws.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Chưa có luật nào
              </div>
            )}
            {!loadingLaws && !lawError && laws.map((law) => (
              <div key={law.id} className="law-item law-card-v2">
                <div className="law-card-top">
                  <div className="law-card-icon">
                    <FileText size={18} />
                  </div>
                  <div className="law-card-title-wrap">
                    <div className="law-title">{law.title}</div>
                    <div className="law-code-line"># {law.description || '---'}</div>
                  </div>
                  <span className="law-type-chip">LUẬT</span>
                </div>

                <div className="law-info-grid">
                  <div className="law-info-box">
                    <div className="law-info-label">Phiên bản</div>
                    <div className="law-info-value">{formatVersionLabel(law.version)}</div>
                  </div>
                  <div className="law-info-box">
                    <div className="law-info-label">Ngày tải lên</div>
                    <div className="law-info-value">{formatUploadDate(law.uploadDate)}</div>
                  </div>
                </div>

                <div className="law-actions">
                  <button className="btn-law-view" onClick={() => setModal({ open: true, mode: 'view', entity: 'law', item: law, titleInput: '' })}>
                    <Eye size={16} />
                    Xem
                  </button>
                  <button className="btn-law-edit" onClick={() => setModal({ open: true, mode: 'edit', entity: 'law', item: law, titleInput: law.title || '' })}>
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteLaw(law.id)}
                    className="btn-law-delete"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {!loadingLaws && !lawError && (
              <div className="law-upload-placeholder" onClick={() => setShowUploadModal(true)} role="button" tabIndex={0}>
                <div className="law-upload-plus">
                  <Plus size={16} />
                </div>
                <div className="law-upload-title">Tải lên văn bản mới</div>
                <div className="law-upload-sub">Hỗ trợ định dạng .PDF, .DOCX</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* CHAPTERS TAB */}
      {activeTab === 'chapters' && (
        <>
          <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
            Danh sách Chương ({filteredChapterCount}/{chapterCount})
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Tìm theo tên chương / luật / số chương"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              style={{
                flex: '1 1 240px',
                minWidth: '240px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none'
              }}
            />
            <select
              value={chapterStatusFilter}
              onChange={(e) => setChapterStatusFilter(e.target.value)}
              style={{
                width: '180px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#fff'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {chapterStatusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="laws-list">
            {loadingChapters && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Đang tải danh sách chương...
              </div>
            )}
            {chapterError && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#ef4444' }}>
                {chapterError}
              </div>
            )}
            {!loadingChapters && !chapterError && filteredChapters.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Không có chương nào khớp bộ lọc
              </div>
            )}
            {!loadingChapters && !chapterError && pagedChapters.map((ch) => (
              <div key={ch.chapterId} className="law-item">
                <div className="law-title">
                  {ch.chapterNumber ? `Chương ${ch.chapterNumber}` : 'Chương'}
                  {ch.chapterTitle ? ` - ${ch.chapterTitle}` : ''}
                </div>
                <div className="law-meta">
                  <span>Luật: {ch.lawTitle || ch.lawId}</span>
                  <span>Sort: {ch.sortOrder ?? '-'}</span>
                  <span>Phiên bản: {ch.versionNumber ?? '-'}</span>
                  <span>Trạng thái: {ch.status}</span>
                </div>
                <div className="law-actions" style={{ marginTop: '0.5rem' }}>
                  <button className="btn-law-view" onClick={() => handleViewChapter(ch)}>
                    <Eye size={16} />
                    Xem
                  </button>
                  <button className="btn-law-edit" onClick={() => handleEditChapter(ch.chapterId)}>
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button className="btn-law-delete" onClick={() => handleDeleteChapter(ch.chapterId)}>
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          {renderPagination(totalChapterPages, chapterPage, setChapterPage)}
        </>
      )}

      {/* ARTICLES TAB */}
      {activeTab === 'articles' && (
        <>
          <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
            Danh sách Điều ({filteredArticleCount}/{articleCount})
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Tìm theo tên điều / chương / luật / nội dung"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              style={{
                flex: '1 1 240px',
                minWidth: '240px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none'
              }}
            />
            <select
              value={articleStatusFilter}
              onChange={(e) => setArticleStatusFilter(e.target.value)}
              style={{
                width: '180px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#fff'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">active</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div className="laws-list">
            {loadingArticles && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Đang tải danh sách điều...
              </div>
            )}
            {articleError && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#ef4444' }}>
                {articleError}
              </div>
            )}
            {!loadingArticles && !articleError && filteredArticles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                Không có điều nào khớp bộ lọc
              </div>
            )}
            {!loadingArticles && !articleError && pagedArticles.map((ar) => (
              <div key={ar.articleId} className="law-item">
                <div className="law-title">{formatArticleTitle(ar)}</div>
                <div className="law-meta">
                  <span>Luật: {ar.lawTitle || ar.lawId}</span>
                  <span>Chương: {ar.chapterTitle || ar.chapterId}</span>
                  <span>Trạng thái: {ar.status}</span>
                </div>
                {ar.content && (
                  <div className="law-description" style={{ maxHeight: '120px', overflow: 'hidden' }}>
                    {ar.content}
                  </div>
                )}
                <div className="law-actions" style={{ marginTop: '0.5rem' }}>
                  <button className="btn-law-view" onClick={() => handleViewArticle(ar)}>
                    <Eye size={16} />
                    Xem
                  </button>
                  <button className="btn-law-edit" onClick={() => handleEditArticle(ar.articleId)}>
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button className="btn-law-delete" onClick={() => handleDeleteArticle(ar.articleId)}>
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          {renderPagination(totalArticlePages, articlePage, setArticlePage)}
        </>
      )}

      {/* NỘI DUNG ĐƠN GIẢN HÓA TAB */}
      {!hideSimplifiedManagement && activeTab === 'simplified' && (
        <>
          {/* Approval Tabs */}
          <div className="approval-tabs" style={{ marginBottom: '1.5rem' }}>
            <button
              className={`approval-tab ${approvalTab === 'pending' ? 'active' : ''}`}
              onClick={() => setApprovalTab('pending')}
            >
              <Clock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Chờ Duyệt ({pendingCount})
            </button>
            <button
              className={`approval-tab ${approvalTab === 'approved' ? 'active' : ''}`}
              onClick={() => setApprovalTab('approved')}
            >
              <Check size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Đã Duyệt ({approvedCount})
            </button>
            <button
              className={`approval-tab ${approvalTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setApprovalTab('rejected')}
            >
              <X size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Đã Từ Chối ({rejectedCount})
            </button>
          </div>

          {/* Content */}
          <div className="approval-list">
            {loadingSimplified && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                Đang tải nội dung đơn giản hóa...
              </div>
            )}
            {simplifiedError && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                {simplifiedError}
              </div>
            )}
            {!loadingSimplified && !simplifiedError && approvalTab === 'pending' && (
              pendingCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>Không có nội dung nào chờ duyệt</p>
                </div>
              ) : (
                simplifiedItems.pending.map(item => renderApprovalItem(item, 'pending'))
              )
            )}
            {!loadingSimplified && !simplifiedError && approvalTab === 'approved' && (
              approvedCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <Check size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>Chưa có nội dung nào được duyệt</p>
                </div>
              ) : (
                simplifiedItems.approved.map(item => renderApprovalItem(item, 'approved'))
              )
            )}
            {!loadingSimplified && !simplifiedError && approvalTab === 'rejected' && (
              rejectedCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <X size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>Chưa có nội dung nào bị từ chối</p>
                </div>
              ) : (
                simplifiedItems.rejected.map(item => renderApprovalItem(item, 'rejected'))
              )
            )}
          </div>
        </>
      )}

      {renderModalContent()}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '0.5rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
              Thêm Văn Bản Pháp Luật
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                Tiêu đề
              </label>
              <input
                type="text"
                value={uploadLaw.title}
                onChange={(e) => setUploadLaw({...uploadLaw, title: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Nhập tiêu đề văn bản..."
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                Mô tả
              </label>
              <textarea
                value={uploadLaw.description}
                onChange={(e) => setUploadLaw({...uploadLaw, description: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Nhập mô tả..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  Danh mục
                </label>
                <select
                  value={uploadLaw.category}
                  onChange={(e) => setUploadLaw({...uploadLaw, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  Phiên bản
                </label>
                <input
                  type="text"
                  value={uploadLaw.version}
                  onChange={(e) => setUploadLaw({...uploadLaw, version: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="VD: 2019"
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                File văn bản
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '0.375rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <FileText size={32} style={{ marginBottom: '0.5rem', color: '#6b7280' }} />
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Click để chọn file hoặc kéo thả vào đây</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUploadLaw({...uploadLaw, file: e.target.files[0]})}
                  style={{ display: 'none' }}
                  id="law-file-upload"
                />
                <label htmlFor="law-file-upload" style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1a5ca6',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}>
                  Chọn File
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-modal-cancel"
              >
                Hủy
              </button>
              <button
                onClick={handleUpload}
                className="btn-modal-submit"
              >
                Thêm Văn Bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
