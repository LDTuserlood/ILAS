package com.C1SE61.backend.service.editor;

import com.C1SE61.backend.dto.request.editor.FormTemplateRequest;
import com.C1SE61.backend.dto.response.editor.FormTemplateResponse;
import com.C1SE61.backend.model.FormTemplate;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.FormTemplateRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import com.C1SE61.backend.service.log.AuditLogService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service dành cho biên tập viên (Editor)
 * Xử lý CRUD và gửi duyệt biểu mẫu (FormTemplate)
 */
@Service("editorFormTemplateService")
public class EditorFormTemplateService {

    private final FormTemplateRepository formRepo;
    private final UserAccountRepository userRepo;
    private final AuditLogService auditLogService;

    public EditorFormTemplateService(FormTemplateRepository formRepo, UserAccountRepository userRepo, AuditLogService auditLogService) {
        this.formRepo = formRepo;
        this.userRepo = userRepo;
        this.auditLogService = auditLogService;
    }

    /**  Lấy tất cả form của editor */
    public List<FormTemplateResponse> getByEditor(Integer editorId) {
        return formRepo.findByEditor_UserId(editorId)
                .stream()
                .map(this::mapToResponse)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**  Tạo form mới */
    public FormTemplateResponse createForm(Integer editorId, FormTemplateRequest req) {
        UserAccount editor = userRepo.findById(editorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người biên tập"));

        FormTemplate form = new FormTemplate();
        form.setTitle(req.getTitle());
        form.setCategory(req.getCategory());
        form.setDescription(req.getDescription());
        form.setFileUrl(req.getFileUrl());
        form.setEditor(editor);
        form.setStatus(FormTemplate.Status.DRAFT);

        FormTemplate saved = formRepo.save(form);
        try {
            auditLogService.log("Tạo biểu mẫu", "templateId=" + saved.getTemplateId() + " title=" + saved.getTitle(), saved.getEditor());
        } catch (Exception ignored) {}
        return mapToResponse(saved);
    }

    /**  Cập nhật form (chỉ cho phép khi là draft hoặc rejected) */
    public FormTemplateResponse updateForm(Integer id, FormTemplateRequest req) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        FormTemplate.Status status = form.getStatus();
        if (status == FormTemplate.Status.PENDING || status == FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Không thể chỉnh sửa biểu mẫu đã gửi duyệt hoặc đã được duyệt.");
        }

        form.setTitle(req.getTitle());
        form.setCategory(req.getCategory());
        form.setDescription(req.getDescription());
        form.setFileUrl(req.getFileUrl());

        FormTemplate updated = formRepo.save(form);
        try {
            auditLogService.log("Cập nhật biểu mẫu", "templateId=" + updated.getTemplateId() + " title=" + updated.getTitle(), updated.getEditor());
        } catch (Exception ignored) {}
        return mapToResponse(updated);
    }

    /**  Gửi duyệt form (chỉ cho phép khi là draft hoặc rejected) */
    public FormTemplateResponse submitForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        FormTemplate.Status status = form.getStatus();
        if (status != FormTemplate.Status.DRAFT && status != FormTemplate.Status.REJECTED) {
            throw new RuntimeException("Chỉ có thể gửi duyệt biểu mẫu ở trạng thái Nháp hoặc Bị từ chối.");
        }

        form.setStatus(FormTemplate.Status.PENDING);
        FormTemplate submitted = formRepo.save(form);
        try {
            auditLogService.log("Gửi duyệt biểu mẫu", "templateId=" + submitted.getTemplateId() + " title=" + submitted.getTitle(), submitted.getEditor());
        } catch (Exception ignored) {}
        return mapToResponse(submitted);
    }

    /**  Tạo bản sao form đã duyệt để chỉnh sửa */
    public FormTemplateResponse cloneForEdit(Integer id) {
        FormTemplate oldForm = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu để sao chép"));

        if (oldForm.getStatus() != FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Chỉ có thể sao chép từ biểu mẫu đã duyệt.");
        }

        FormTemplate clone = new FormTemplate();
        clone.setTitle(oldForm.getTitle() + " (Bản chỉnh sửa)");
        clone.setCategory(oldForm.getCategory());
        clone.setDescription(oldForm.getDescription());
        clone.setFileUrl(oldForm.getFileUrl());
        clone.setEditor(oldForm.getEditor());
        clone.setStatus(FormTemplate.Status.DRAFT);

        FormTemplate saved = formRepo.save(clone);
        try {
            auditLogService.log("Sao chép biểu mẫu để chỉnh sửa", "templateId=" + saved.getTemplateId() + " title=" + saved.getTitle(), saved.getEditor());
        } catch (Exception ignored) {}
        return mapToResponse(saved);
    }

    /**  Xóa form (chỉ khi là draft hoặc rejected) */
    public void deleteForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        FormTemplate.Status status = form.getStatus();
        if (status == FormTemplate.Status.PENDING || status == FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Không thể xóa biểu mẫu đã gửi duyệt hoặc đã được duyệt.");
        }

        FormTemplate toDelete = formRepo.findById(id).orElse(null);
        formRepo.deleteById(id);
        try {
            if (toDelete != null) {
                auditLogService.log("Xóa biểu mẫu", "templateId=" + id + " title=" + toDelete.getTitle(), toDelete.getEditor());
            }
        } catch (Exception ignored) {}
    }

    /**  Helper: Entity → DTO */
    private FormTemplateResponse mapToResponse(FormTemplate form) {
        FormTemplateResponse dto = new FormTemplateResponse();
        dto.setTemplateId(form.getTemplateId());
        dto.setTitle(form.getTitle());
        dto.setCategory(form.getCategory());
        dto.setDescription(form.getDescription());
        dto.setFileUrl(form.getFileUrl());
        dto.setStatus(form.getStatus().name());
        dto.setCreatedAt(form.getCreatedAt());

        if (form.getEditor() != null) {
            dto.setEditorName(form.getEditor().getFullName());
            dto.setEditorEmail(form.getEditor().getEmail());
        }
        return dto;
    }
}
