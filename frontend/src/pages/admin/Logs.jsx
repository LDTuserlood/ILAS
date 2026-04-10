// Logs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download } from 'lucide-react';
import '../../styles/admin/logs.css';

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = 'http://localhost:8080/api/admin';
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${API_BASE_URL}/audit-logs`, { headers: authHeader });
        // ApiResponse: { success, message, data }
        if (res?.data?.success) {
          const raw = Array.isArray(res.data.data) ? res.data.data : [];
          const mapped = raw.map((l) => ({
            id: l.id,
            action: l.action || '',
            details: l.detail || l.details || '',
            timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString('vi-VN') : (l.timestamp || ''),
            user: l.fullName || l.username || (l.user ? (l.user.fullName || l.user.username) : ''),
            ip: l.ip || '',
            level: l.level || 'info'
          }));
          setLogs(mapped);
        } else {
          setError(res?.data?.message || 'Lấy nhật ký thất bại');
        }
      } catch (err) {
        console.error('Load audit logs failed', err);
        setError('Không thể kết nối tới server');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getLevelColor = (level) => {
    const colors = {
      info: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  const handleExport = () => {
    // Export currently filtered logs to CSV
    const filteredLogs = logs.filter(log => {
      const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });

    if (!filteredLogs.length) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    const csvRows = [
      ['timestamp', 'level', 'action', 'user', 'ip', 'details'],
      ...filteredLogs.map(l => [l.timestamp, l.level, `"${(l.action||'').replace(/"/g, '""')}"`, l.user || '', l.ip || '', `"${(l.details||'').replace(/"/g, '""')}"`])
    ];
    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="logs-container" style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#2c3e50', marginBottom: '0.5rem' }}>
          Nhật Ký Hệ Thống
        </h1>
        <p style={{ color: '#6b7280' }}>Xem và theo dõi các hoạt động và sự kiện hệ thống</p>
      </div>

      {/* Filters */}
      <div className="logs-filter">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Tìm kiếm theo hành động, người dùng hoặc chi tiết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="all">Tất cả mức độ</option>
          <option value="info">Thông tin</option>
          <option value="success">Thành công</option>
          <option value="warning">Cảnh báo</option>
          <option value="error">Lỗi</option>
        </select>
        <button
          onClick={handleExport}
          className="btn-export-logs"
        >
          <Download size={16} />
          Xuất Nhật Ký
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0ea5e9' }}>
            {logs.filter(l => l.level === 'info').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Thông tin</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
            {logs.filter(l => l.level === 'success').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Thành công</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
            {logs.filter(l => l.level === 'warning').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Cảnh báo</div>
        </div>
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
            {logs.filter(l => l.level === 'error').length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Lỗi</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Mức độ</th>
              <th>Hành động</th>
              <th>Người dùng</th>
              <th>IP</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  Không tìm thấy nhật ký nào
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp}</td>
                  <td>
                    <span
                      className={`log-level ${log.level}`}
                      style={{
                        backgroundColor: getLevelColor(log.level) + '20',
                        color: getLevelColor(log.level)
                      }}
                    >
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{log.action}</td>
                  <td>{log.user}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{log.ip}</td>
                  <td style={{ color: '#6b7280' }}>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="logs-pagination">
          <button
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
