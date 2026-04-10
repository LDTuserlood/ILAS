import React from "react";
import "../../styles/landing/Footer.css";

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-content">
        <div>
          <b>ILAS</b>
          <p>Hệ thống hỗ trợ pháp lý cho người lao động Việt Nam.</p>
        </div>
        <div>
          <b>Liên hệ</b>
          <p>Email: support@ilas.vn</p>
          <p>Hotline: 0123 456 789</p>
          <p>Địa chỉ: Đại học Duy Tân, Đà Nẵng</p>
        </div>
        <div>
          <b>Liên kết</b>
          <p>Trang chủ | Giới thiệu | Tính năng | Liên hệ</p>
        </div>
      </div>
      <div className="lp-footer-bottom">
        © 2025 ILAS. All rights reserved.
      </div>
    </footer>
  );
}

