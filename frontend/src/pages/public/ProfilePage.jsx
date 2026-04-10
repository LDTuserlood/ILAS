import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../../api/auth';
import userProfileAPI from "../../api/userProfile";
import { useAuth } from '../../contexts/AuthContext';
import UserSidebar from '../../components/user/UserSidebar';
import '../../styles/user/ProfilePage.css';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Saved profile data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    createdAt: ''
  });

  // Editable draft (for Save/Reset)
  const [formDraft, setFormDraft] = useState({ fullName: '', phone: '' });

  // Notification toggles
  const [alerts, setAlerts] = useState({
    emailNotifications: true,
    caseUpdates: false,
    systemStatus: true,
  });

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('vi');


  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      window.scrollTo(0, 0);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      setError('Có lỗi xảy ra khi đăng xuất');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!user?.userId) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const userResponse = await userProfileAPI.getProfile(user.userId);
      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data;
        const data = {
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          createdAt: userData.createdAt || ''
        };
        setProfileData(data);
        setFormDraft({ fullName: data.fullName, phone: data.phone });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
      if (err.status === 401 || err.status === 403) {
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProfile();
  }, [loadProfile]);

  const handleSaveChanges = async () => {
    if (!user?.userId) { navigate('/login', { replace: true }); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await userProfileAPI.updateProfile(user.userId, {
        fullName: formDraft.fullName,
        email: profileData.email,
        phone: formDraft.phone,
      });
      if (response.success) {
        setProfileData(prev => ({ ...prev, fullName: formDraft.fullName, phone: formDraft.phone }));
        setSuccess('Cập nhật thông tin thành công!');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormDraft({ fullName: profileData.fullName, phone: profileData.phone });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!user?.userId) { navigate('/login', { replace: true }); return; }
      if (!passwordData.currentPassword.trim()) { setError('Mật khẩu hiện tại không được để trống'); setSaving(false); return; }
      if (!passwordData.newPassword.trim()) { setError('Mật khẩu mới không được để trống'); setSaving(false); return; }
      if (passwordData.newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự'); setSaving(false); return; }
      if (passwordData.newPassword !== passwordData.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); setSaving(false); return; }
      if (passwordData.currentPassword === passwordData.newPassword) { setError('Mật khẩu mới phải khác mật khẩu hiện tại'); setSaving(false); return; }
      const response = await authAPI.changePassword(user.userId, passwordData.currentPassword, passwordData.newPassword);
      if (response.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(response.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const displayName = profileData.fullName || user?.username || 'Người dùng';

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <UserSidebar active="settings" />

      {/* ===== MAIN ===== */}
      <main className="settings-main">
        {/* Topbar */}
        <header className="settings-topbar">
          <div className="settings-breadcrumb">
            <span className="breadcrumb-link" onClick={() => navigate('/user/dashboard')}>Portal</span>
            <span className="breadcrumb-sep"> / </span>
            <span>Settings</span>
          </div>
          <div className="settings-topbar-right">
            <button className="settings-icon-btn" aria-label="Notifications">🔔</button>
            <button className="settings-icon-btn" aria-label="Help">❓</button>
            <span className="settings-topbar-username">{displayName}</span>
            <div className="settings-topbar-avatar">👤</div>
          </div>
        </header>

        <div className="settings-content">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">
            Manage your professional profile, adjust notification preferences, and tailor the platform to your preferred language.
          </p>

          {error && <div className="settings-msg error">{error}</div>}
          {success && <div className="settings-msg success">{success}</div>}

          <div className="settings-grid">
            {/* ---- LEFT COLUMN ---- */}
            <div className="settings-col-left">

              {/* Personal Information */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon-wrap">👤</div>
                  <div>
                    <h3>Personal Information</h3>
                    <p>Update your public profile and contact details.</p>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formDraft.fullName}
                      onChange={e => setFormDraft(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Họ và tên"
                    />
                  </div>
                  <div className="settings-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formDraft.phone}
                      onChange={e => setFormDraft(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>

                <div className="settings-field settings-field-full">
                  <label>Email Address</label>
                  <input type="email" value={profileData.email} readOnly />
                  <span className="settings-field-hint">● Changing your email will require re-verification.</span>
                </div>

                <div className="settings-form-actions">
                  <button className="settings-save-btn" onClick={handleSaveChanges} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Save Changes'}
                  </button>
                  <button className="settings-reset-btn" onClick={handleReset}>Reset</button>
                </div>
              </div>

              {/* Change Password */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon-wrap">🔒</div>
                  <div>
                    <h3>Đổi mật khẩu</h3>
                    <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
                  </div>
                </div>

                {!showChangePassword ? (
                  <button className="settings-save-btn" onClick={() => setShowChangePassword(true)}>
                    Thay đổi mật khẩu
                  </button>
                ) : (
                  <div className="settings-password-form">
                    <div className="settings-field settings-field-full">
                      <label>Mật khẩu hiện tại</label>
                      <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu hiện tại" />
                    </div>
                    <div className="settings-field settings-field-full">
                      <label>Mật khẩu mới</label>
                      <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)" />
                    </div>
                    <div className="settings-field settings-field-full">
                      <label>Xác nhận mật khẩu mới</label>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Nhập lại mật khẩu mới" />
                    </div>
                    <div className="settings-form-actions">
                      <button className="settings-save-btn" onClick={handleChangePassword} disabled={saving}>
                        {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </button>
                      <button className="settings-reset-btn" onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}>Hủy</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div className="settings-col-right">

              {/* Alerts */}
              <div className="settings-card">
                <div className="settings-card-header settings-card-header-sm">
                  <div className="settings-card-icon-wrap alerts">🔔</div>
                  <h3>Alerts</h3>
                </div>
                <div className="settings-toggles">
                  <div className="settings-toggle-row">
                    <div>
                      <div className="toggle-label">Email Notifications</div>
                      <div className="toggle-sub">Daily digest of activities</div>
                    </div>
                    <button
                      className={`settings-toggle ${alerts.emailNotifications ? 'on' : 'off'}`}
                      onClick={() => setAlerts(a => ({ ...a, emailNotifications: !a.emailNotifications }))}
                      aria-label="Toggle email notifications"
                    />
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <div className="toggle-label">Case Updates</div>
                      <div className="toggle-sub">Real-time legal changes</div>
                    </div>
                    <button
                      className={`settings-toggle ${alerts.caseUpdates ? 'on' : 'off'}`}
                      onClick={() => setAlerts(a => ({ ...a, caseUpdates: !a.caseUpdates }))}
                      aria-label="Toggle case updates"
                    />
                  </div>
                  <div className="settings-toggle-row">
                    <div>
                      <div className="toggle-label">System Status</div>
                      <div className="toggle-sub">Maintenance alerts</div>
                    </div>
                    <button
                      className={`settings-toggle ${alerts.systemStatus ? 'on' : 'off'}`}
                      onClick={() => setAlerts(a => ({ ...a, systemStatus: !a.systemStatus }))}
                      aria-label="Toggle system status"
                    />
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="settings-card">
                <div className="settings-card-header settings-card-header-sm">
                  <div className="settings-card-icon-wrap">🌐</div>
                  <h3>Language</h3>
                </div>
                <div className="settings-lang-list">
                  {[
                    { code: 'en-US', label: 'English (US)' },
                    { code: 'vi', label: 'Tiếng Việt' },
                    { code: 'fr', label: 'Français' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      className={`settings-lang-item ${selectedLanguage === lang.code ? 'selected' : ''}`}
                      onClick={() => setSelectedLanguage(lang.code)}
                    >
                      <span>{lang.label}</span>
                      {selectedLanguage === lang.code
                        ? <span className="lang-mark check">✓</span>
                        : <span className="lang-mark arrow">›</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="settings-security-card">
            <div className="settings-security-left">
              <div className="settings-security-icon">⚠️</div>
              <div>
                <h3>Security &amp; Privacy</h3>
                <p>Deactivating your account will permanently remove all access to historical case files.</p>
              </div>
            </div>
            <button className="settings-deactivate-btn" onClick={handleLogout} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;