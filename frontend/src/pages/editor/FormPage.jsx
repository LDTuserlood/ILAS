import React, { useCallback, useEffect, useState } from "react";
import EditorWorkspace from "../../components/editor/EditorWorkspace";
import "../../styles/editor/FormPage.css";
import {
  getFormsByEditor,
  createForm,
  updateForm,
  deleteForm,
  submitForm,
} from "../../api/form";
import FormModal from "../../components/editor/FormModal";

export default function FormPage() {
  const [editorId, setEditorId] = useState(null);
  const [token] = useState(localStorage.getItem("token"));
  const [forms, setForms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); 

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEditorId(Number(payload.userId ?? payload.id ?? payload.sub ?? null));
    } catch (e) {
      console.error("Decode token lỗi:", e);
    }
  }, [token]);

  const loadForms = useCallback(async () => {
    if (!editorId) return;

    try {
      const res = await getFormsByEditor(editorId);
      const list = Array.isArray(res.data) ? res.data : [];
      setForms(list);
    } catch (error) {
      console.error("Lỗi tải biểu mẫu:", error);
      setForms([]);
    }
  }, [editorId]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleCreate = () => {
    setEditForm(null);
    setShowModal(true);
  };

  const handleEdit = (form) => {
    setEditForm(form);
    setShowModal(true);
  };

  const handleSave = async (form) => {
    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      fileUrl: form.fileUrl || null,
    };
    if (editForm) await updateForm(editForm.templateId, payload);
    else await createForm(editorId, payload);
    loadForms();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa biểu mẫu này không?")) return;

    try {
      await deleteForm(id);
      alert("🗑️ Biểu mẫu đã được xóa thành công!");
      loadForms();
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 403) {
        alert("⚠️ Không thể xóa biểu mẫu đang chờ duyệt hoặc đã duyệt.");
      } else {
        alert("❌ Lỗi khi xóa biểu mẫu. Vui lòng thử lại sau.");
      }
    }
  };

  const handleSubmit = async (id) => {
    await submitForm(id);
    alert("📤 Biểu mẫu đã được gửi duyệt!");
    loadForms();
  };

  // Lọc danh sách biểu mẫu theo trạng thái
  const filteredForms = forms.filter((f) => {
    const matchSearch = (f.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      (f.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <EditorWorkspace
      active="forms"
      title="Template Management"
      description="Quản lý kho biểu mẫu do editor phụ trách, theo dõi trạng thái và gửi duyệt tập trung."
    >
      <section className="editor-workspace-panel">
        <div className="form-page">

        {/* Thanh tìm kiếm + nút thêm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm biểu mẫu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Dropdown lọc trạng thái */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="draft">📝 Nháp</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="approved">✅ Đã duyệt</option>
            <option value="rejected">❌ Bị từ chối</option>
          </select>

          <button className="btn-create" onClick={handleCreate}>
            ➕ Thêm biểu mẫu
          </button>
        </div>

        <div className="form-list">
          {filteredForms.length === 0 ? (
            <p className="empty-text">📭 Không có biểu mẫu phù hợp.</p>
          ) : (
            filteredForms.map((form) => (
              <div key={form.templateId} className="form-card shadow">
                <div className="form-header">
                  <div>
                    <h3>{form.title}</h3>
                    <p className="meta">
                      📁 {form.category} | 🕓{" "}
                      {new Date(form.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`status-badge ${(
                      form.status || "draft"
                    ).toLowerCase()}`}
                  >
                    {form.status}
                  </span>
                </div>

                <p className="description">
                  {form.description || "Không có mô tả."}
                </p>

                <div className="form-footer">
                  <div className="editor-info">
                    👤 {form.editorName} ({form.editorEmail})
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn edit"
                      onClick={() => handleEdit(form)}
                      disabled={["pending", "approved"].includes(
                        (form.status || "").toLowerCase()
                      )}
                      title={
                        ["pending", "approved"].includes(
                          (form.status || "").toLowerCase()
                        )
                          ? "Không thể sửa khi biểu mẫu đã gửi duyệt hoặc phê duyệt"
                          : "Chỉnh sửa biểu mẫu"
                      }
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      className="btn submit"
                      onClick={() => handleSubmit(form.templateId)}
                      disabled={["pending", "approved"].includes(
                        (form.status || "").toLowerCase()
                      )}
                      title={
                        ["pending", "approved"].includes(
                          (form.status || "").toLowerCase()
                        )
                          ? "Đã gửi duyệt, không thể gửi lại"
                          : "Gửi biểu mẫu để duyệt"
                      }
                    >
                      🚀 Gửi duyệt
                    </button>

                    <button
                      className="btn delete"
                      onClick={() => handleDelete(form.templateId)}
                      disabled={["pending", "approved"].includes(
                        (form.status || "").toLowerCase()
                      )}
                      title={
                        ["pending", "approved"].includes(
                          (form.status || "").toLowerCase()
                        )
                          ? "Không thể xóa biểu mẫu đang chờ duyệt hoặc đã duyệt"
                          : "Xóa biểu mẫu"
                      }
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>

                {form.fileUrl && (
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="file-link"
                  >
                    📄 Xem file đính kèm
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {showModal && (
          <FormModal
            editorId={editorId}
            formData={editForm}
            onSave={handleSave}
            onClose={() => setShowModal(false)}
          />
        )}
        </div>
      </section>
    </EditorWorkspace>
  );
}
