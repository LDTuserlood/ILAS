import React from "react";
import "../../styles/user/HelpContactPage.css";

export default function HelpContactPage() {
  return (
    <div className="hc-bg">
      <div className="hc-container">
        <div className="hc-info">
          <div className="hc-info-title">Liên hệ với chúng tôi</div>
          <div className="hc-info-list">
            <div className="hc-info-item">
              <span role="img" aria-label="email">📧</span> Email hỗ trợ: <b>support@ilas.com</b>
            </div>
            <div className="hc-info-item">
              <span role="img" aria-label="phone">📞</span> Hotline: <b>0123 456 789</b> (T2-T6: 8h00 - 17h00)
            </div>
            <div className="hc-info-item">
              <span role="img" aria-label="address">📍</span> Địa chỉ: Đại học Duy Tân, Đà Nẵng
            </div>
          </div>
        </div>

        <form className="hc-form">
          <div className="hc-form-title">Gửi thắc mắc/Chia sẻ/Ý kiến</div>
          <div className="hc-form-group">
            <label htmlFor="hc-name">Họ và tên:</label>
            <input type="text" id="hc-name" name="name" placeholder="Nhập họ tên..." />
          </div>
          <div className="hc-form-group">
            <label htmlFor="hc-email">Email:</label>
            <input type="email" id="hc-email" name="email" placeholder="Nhập email..." />
          </div>
          <div className="hc-form-group">
            <label htmlFor="hc-title">Tiêu đề:</label>
            <input type="text" id="hc-title" name="title" placeholder="Nhập tiêu đề..." />
          </div>
          <div className="hc-form-group">
            <label htmlFor="hc-content">Nội dung:</label>
            <textarea id="hc-content" name="content" rows={4} placeholder="Nhập nội dung..." />
          </div>
          <div className="hc-form-group">
            <label htmlFor="hc-file">Đính kèm file (tùy chọn):</label>
            <input type="file" id="hc-file" name="file" />
          </div>
          <button type="submit" className="hc-form-btn">Gửi liên hệ</button>
        </form>
      </div>
    </div>
  );
}
