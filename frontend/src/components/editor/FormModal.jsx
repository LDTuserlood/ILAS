import React, { useState, useEffect } from "react";
import { uploadFormFile } from "../../api/form";
import "../../styles/editor/FormModal.css";


export default function FormModal({ editorId, formData, onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    fileUrl: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Reset form mỗi khi mở modal (tạo mới hoặc sửa)
  useEffect(() => {
    if (formData) {
      setForm({
        title: formData.title || "",
        category: formData.category || "",
        description: formData.description || "",
        fileUrl: formData.fileUrl || "",
      });
    } else {
      setForm({
        title: "",
        category: "",
        description: "",
        fileUrl: "",
      });
    }
  }, [formData]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("⚠️ Vui lòng chọn file trước khi tải lên!");
    try {
      setUploading(true);
      const res = await uploadFormFile(editorId, file);
      if (res.data?.fileUrl) {
        setForm((prev) => ({ ...prev, fileUrl: res.data.fileUrl }));
        alert("✅ File đã tải lên thành công!");
      } else {
        alert("❌ Không nhận được fileUrl từ server!");
      }
    } catch (err) {
      console.error("Lỗi upload file:", err);
      alert("❌ Lỗi khi tải file!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert("⚠️ Vui lòng nhập tiêu đề!");

    if (!form.fileUrl) {
      const confirmUpload = window.confirm(
        "Bạn chưa tải file lên. Vẫn muốn lưu biểu mẫu này?"
      );
      if (!confirmUpload) return;
    }

    await onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{formData ? "✏️ Chỉnh sửa biểu mẫu" : "➕ Tạo mới biểu mẫu"}</h3>

        <input
          type="text"
          placeholder="Tiêu đề biểu mẫu"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phân loại (vd: Nghỉ phép, Hợp đồng...)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <textarea
          placeholder="Mô tả biểu mẫu"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Upload file */}
        <div className="file-upload">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "⏳ Đang tải..." : "📎 Tải file"}
          </button>
        </div>

        {/* Link xem file */}
        {form.fileUrl && (
          <a
            href={form.fileUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", marginTop: "8px", color: "#007bff" }}
          >
            📄 Xem file đã tải
          </a>
        )}

        {/* Preview PDF */}
        {form.fileUrl?.endsWith(".pdf") && (
          <iframe
            src={form.fileUrl}
            title="preview"
            width="100%"
            height="300px"
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              marginTop: "10px",
            }}
          ></iframe>
        )}

        <div className="modal-actions">
          <button onClick={handleSave}>💾 Lưu</button>
          <button onClick={onClose}>❌ Hủy</button>
        </div>
      </div>
    </div>
  );
}
