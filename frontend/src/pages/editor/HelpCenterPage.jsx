import React, { useState } from "react";
import EditorWorkspace from "../../components/editor/EditorWorkspace";
import { feedbackAPI } from "../../api/feedback";
import "../../styles/editor/HelpCenterPage.css";

const issueTypeOptions = [
  { value: "ai_answer_wrong", label: "AI trả lời sai" },
  { value: "ai_hallucination", label: "AI bịa nội dung" },
  { value: "ai_timeout", label: "AI phản hồi chậm / timeout" },
  { value: "ai_source_missing", label: "AI thiếu nguồn tham chiếu" },
  { value: "other", label: "Khác" },
];

const severityOptions = [
  { value: "low", label: "Thấp" },
  { value: "normal", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

const contextOptions = [
  { value: "chatbot_moderator", label: "Chatbot (Moderator)" },
  { value: "detail_page", label: "Trang chi tiết luật" },
  { value: "search_page", label: "Trang tìm kiếm luật" },
  { value: "other", label: "Khác" },
];

export default function HelpCenterPage() {
  const [form, setForm] = useState({
    issueType: "ai_answer_wrong",
    severity: "normal",
    context: "chatbot_moderator",
    detail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setForm({
      issueType: "ai_answer_wrong",
      severity: "normal",
      context: "chatbot_moderator",
      detail: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.detail.trim()) {
      setMessage("Vui lòng mô tả lỗi AI trước khi gửi.");
      return;
    }

    const userId = Number(localStorage.getItem("userId"));
    if (!userId) {
      setMessage("Không xác định được tài khoản moderator.");
      return;
    }

    const issueTypeMap = {
      ai_answer_wrong: "AI trả lời sai",
      ai_hallucination: "AI bịa nội dung",
      ai_timeout: "AI phản hồi chậm / timeout",
      ai_source_missing: "AI thiếu nguồn tham chiếu",
      other: "Lỗi khác",
    };

    const severityMap = {
      low: "Thấp",
      normal: "Trung bình",
      high: "Cao",
      urgent: "Khẩn cấp",
    };

    const contextMap = {
      chatbot_moderator: "Chatbot (Moderator)",
      detail_page: "Trang chi tiết luật",
      search_page: "Trang tìm kiếm luật",
      other: "Khác",
    };

    const content = [
      "[GỬI ADMIN] [AI_FEEDBACK]",
      `[Loại lỗi AI] ${issueTypeMap[form.issueType] || "Lỗi khác"}`,
      `[Mức độ] ${severityMap[form.severity] || "Trung bình"}`,
      `[Bối cảnh] ${contextMap[form.context] || "Khác"}`,
      "",
      form.detail.trim(),
    ].join("\n");

    try {
      setSubmitting(true);
      setMessage("");
      const result = await feedbackAPI.createFeedback({ content, userId });
      if (result.success) {
        setMessage("Đã gửi báo lỗi AI cho admin.");
        resetForm();
      } else {
        setMessage(result.error || "Không thể gửi báo lỗi AI.");
      }
    } catch (error) {
      setMessage("Có lỗi khi gửi báo lỗi AI.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EditorWorkspace
      active="help"
      title="Help Center"
      description="Gửi báo lỗi AI hoặc liên hệ khi moderator gặp vấn đề trong quá trình kiểm duyệt."
      searchPlaceholder="Tìm trong Help Center..."
    >
      <section className="help-center-grid">
        <div className="help-card help-card-info">
          <h2>Thông tin hỗ trợ</h2>
          <p>
            Nếu AI trả lời sai, thiếu căn cứ, phản hồi chậm hoặc phát sinh lỗi trong quá trình
            kiểm duyệt, hãy gửi báo cáo tại đây. Nội dung sẽ được chuyển thẳng cho admin xử lý.
          </p>

          <div className="help-info-list">
            <div className="help-info-item">
              <span className="help-info-label">Email hỗ trợ</span>
              <strong>support@ilas.com</strong>
            </div>
            <div className="help-info-item">
              <span className="help-info-label">Kênh nội bộ</span>
              <strong>Admin feedback queue</strong>
            </div>
            <div className="help-info-item">
              <span className="help-info-label">Mục đích</span>
              <strong>Escalate lỗi AI cho admin</strong>
            </div>
          </div>
        </div>

        <form className="help-card help-card-form" onSubmit={handleSubmit}>
          <h2>Báo lỗi AI cho Admin</h2>
          <p className="help-form-note">
            Chọn loại lỗi, mức độ và bối cảnh để admin xử lý nhanh hơn.
          </p>

          <div className="help-form-row">
            <label>
              Loại lỗi AI
              <select value={form.issueType} onChange={(e) => setForm((prev) => ({ ...prev, issueType: e.target.value }))}>
                {issueTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Mức độ
              <select value={form.severity} onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Bối cảnh lỗi
            <select value={form.context} onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}>
              {contextOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Mô tả chi tiết
            <textarea
              rows={6}
              placeholder="Mô tả lỗi, ví dụ câu trả lời sai, thiếu nguồn, timeout hoặc hành vi bất thường..."
              value={form.detail}
              onChange={(e) => setForm((prev) => ({ ...prev, detail: e.target.value }))}
            />
          </label>

          {message ? <div className="help-message">{message}</div> : null}

          <div className="help-actions">
            <button type="button" className="help-btn secondary" onClick={resetForm}>
              Nhập lại
            </button>
            <button type="submit" className="help-btn primary" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi cho Admin"}
            </button>
          </div>
        </form>
      </section>
    </EditorWorkspace>
  );
}
