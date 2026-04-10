// Settings.jsx
import React, { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Globe, 
  Bell,
  Lock,
  Save,
  X
} from 'lucide-react';
import '../../styles/admin/settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Hệ thống Trợ lý Pháp lý Thông minh ( ILAS )',
    siteUrl: 'http://localhost:3000',
    adminEmail: 'admin@ilas.local',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    requireStrongPassword: true
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@ilas.local',
    fromName: 'ILAS'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newUserAlert: true,
    systemAlerts: true,
    weeklyReport: true
  });

  const handleSave = () => {
    // Save logic here
    alert('Đã lưu cài đặt thành công!');
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: Globe },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Thông báo', icon: Bell }
  ];

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Cài Đặt Hệ Thống</h1>
          <p className="settings-subtitle">Quản lý cấu hình và tùy chỉnh hệ thống</p>
        </div>
        {hasChanges && (
          <div className="settings-alert">
            <span>Có thay đổi chưa lưu</span>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="settings-layout">
        {/* Sidebar */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">Cài Đặt Chung</h2>
              
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">Tên website</label>
                  <input
                    type="text"
                    className="form-input"
                    value={generalSettings.siteName}
                    onChange={(e) => {
                      setGeneralSettings({...generalSettings, siteName: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">URL website</label>
                  <input
                    type="url"
                    className="form-input"
                    value={generalSettings.siteUrl}
                    onChange={(e) => {
                      setGeneralSettings({...generalSettings, siteUrl: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email quản trị</label>
                  <input
                    type="email"
                    className="form-input"
                    value={generalSettings.adminEmail}
                    onChange={(e) => {
                      setGeneralSettings({...generalSettings, adminEmail: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Múi giờ</label>
                    <select
                      className="form-input"
                      value={generalSettings.timezone}
                      onChange={(e) => {
                        setGeneralSettings({...generalSettings, timezone: e.target.value});
                        setHasChanges(true);
                      }}
                    >
                      <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                      <option value="Asia/Bangkok">Thailand (GMT+7)</option>
                      <option value="Asia/Singapore">Singapore (GMT+8)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngôn ngữ</label>
                    <select
                      className="form-input"
                      value={generalSettings.language}
                      onChange={(e) => {
                        setGeneralSettings({...generalSettings, language: e.target.value});
                        setHasChanges(true);
                      }}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Shield size={20} />
                Cài Đặt Bảo Mật
              </h2>
              
              <div className="form-container">
                <div className="setting-item">
                  <div className="setting-header">
                    <Lock size={18} className="setting-icon" />
                    <div>
                      <label className="form-label">Xác thực hai yếu tố (2FA)</label>
                      <p className="setting-description">
                        Bật xác thực hai yếu tố để tăng cường bảo mật tài khoản
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Thời gian hết phiên (phút)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, sessionTimeout: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mật khẩu hết hạn (ngày)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, passwordExpiry: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Số lần đăng nhập sai tối đa</label>
                  <input
                    type="number"
                    className="form-input"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => {
                      setSecuritySettings({...securitySettings, loginAttempts: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Yêu cầu mật khẩu mạnh</label>
                      <p className="setting-description">
                        Bắt buộc mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt
                      </p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireStrongPassword}
                      onChange={(e) => {
                        setSecuritySettings({...securitySettings, requireStrongPassword: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Mail size={20} />
                Cài Đặt Email
              </h2>
              
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                  <label className="form-label">Máy chủ SMTP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailSettings.smtpHost}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, smtpHost: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="form-group">
                  <label className="form-label">Cổng SMTP</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailSettings.smtpPort}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, smtpPort: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tên đăng nhập SMTP</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailSettings.smtpUser}
                    onChange={(e) => {
                      setEmailSettings({...emailSettings, smtpUser: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu SMTP</label>
                  <input
                    type="password"
                    className="form-input"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => {
                      setEmailSettings({...emailSettings, smtpPassword: e.target.value});
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email người gửi</label>
                    <input
                      type="email"
                      className="form-input"
                      value={emailSettings.fromEmail}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, fromEmail: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên người gửi</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailSettings.fromName}
                      onChange={(e) => {
                        setEmailSettings({...emailSettings, fromName: e.target.value});
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">
                <Bell size={20} />
                Cài Đặt Thông Báo
              </h2>
              
              <div className="form-container">
                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Thông báo qua Email</label>
                      <p className="setting-description">Nhận thông báo qua email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Thông báo đẩy (Push)</label>
                      <p className="setting-description">Nhận thông báo đẩy trên trình duyệt</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Thông báo người dùng mới</label>
                      <p className="setting-description">Nhận thông báo khi có người dùng đăng ký mới</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newUserAlert}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, newUserAlert: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Cảnh báo hệ thống</label>
                      <p className="setting-description">Nhận cảnh báo về lỗi và vấn đề hệ thống</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, systemAlerts: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-header">
                    <div>
                      <label className="form-label">Báo cáo hàng tuần</label>
                      <p className="setting-description">Nhận báo cáo tổng hợp hàng tuần</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => {
                        setNotificationSettings({...notificationSettings, weeklyReport: e.target.checked});
                        setHasChanges(true);
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}


          {/* Action Buttons */}
          {hasChanges && (
            <div className="settings-actions">
              <button className="btn-cancel" onClick={handleCancel}>
                <X size={18} />
                Hủy
              </button>
              <button className="btn-save" onClick={handleSave}>
                <Save size={18} />
                Lưu Thay Đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}