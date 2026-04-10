package com.C1SE61.backend.service.moderator;

import com.C1SE61.backend.dto.request.moderator.FormTemplateRequest;
import com.C1SE61.backend.dto.response.moderator.FormTemplateResponse;
import com.C1SE61.backend.model.FormTemplate;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.FormTemplateRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import com.C1SE61.backend.service.log.AuditLogService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service dành cho biên tập viên (Moderator)
 * Xử lý CRUD và xuất bản/ẩn biểu mẫu (FormTemplate)
 */
@Service("moderatorFormTemplateService")
public class ModeratorFormTemplateService {

    private final FormTemplateRepository formRepo;
    private final UserAccountRepository userRepo;
    private final AuditLogService auditLogService;

    public ModeratorFormTemplateService(FormTemplateRepository formRepo, UserAccountRepository userRepo, AuditLogService auditLogService) {
        this.formRepo = formRepo;
        this.userRepo = userRepo;
        this.auditLogService = auditLogService;
    }

    /**  Lấy tất cả form của moderator */
    public List<FormTemplateResponse> getByModerator(Integer moderatorId) {
        return formRepo.findByModerator_UserId(moderatorId)
                .stream()
                .map(this::mapToResponse)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**  Tạo form mới */
    public FormTemplateResponse createForm(Integer moderatorId, FormTemplateRequest req) {
        UserAccount moderator = userRepo.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người biên tập"));

        FormTemplate form = new FormTemplate();
        form.setTitle(req.getTitle());
        form.setCategory(req.getCategory());
        form.setDescription(req.getDescription());
        form.setFileUrl(req.getFileUrl());
        form.setModerator(moderator);
        form.setStatus(FormTemplate.Status.DRAFT);

        FormTemplate saved = formRepo.save(form);
        try {
            auditLogService.log("Tạo biểu mẫu", "templateId=" + saved.getTemplateId() + " title=" + saved.getTitle(), saved.getModerator());
        } catch (Exception ignored) {}
        return mapToResponse(saved);
    }

    /**  Cập nhật form (không cho sửa khi đang hiển thị cho user) */
    public FormTemplateResponse updateForm(Integer id, FormTemplateRequest req) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        FormTemplate.Status status = form.getStatus();
        if (status == FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Không thể chỉnh sửa biểu mẫu đang hiển thị. Hãy ẩn trước khi sửa.");
        }

        form.setTitle(req.getTitle());
        form.setCategory(req.getCategory());
        form.setDescription(req.getDescription());
        form.setFileUrl(req.getFileUrl());

        FormTemplate updated = formRepo.save(form);
        try {
            auditLogService.log("Cập nhật biểu mẫu", "templateId=" + updated.getTemplateId() + " title=" + updated.getTitle(), updated.getModerator());
        } catch (Exception ignored) {}
        return mapToResponse(updated);
    }

    /**  Đăng form để user có thể thấy ngay */
    public FormTemplateResponse publishForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        if (form.getStatus() == FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Biểu mẫu đã được đăng.");
        }

        form.setStatus(FormTemplate.Status.APPROVED);
        FormTemplate published = formRepo.save(form);
        try {
            auditLogService.log("Đăng biểu mẫu", "templateId=" + published.getTemplateId() + " title=" + published.getTitle(), published.getModerator());
        } catch (Exception ignored) {}
        return mapToResponse(published);
    }

    /**  Ẩn form khỏi user */
    public FormTemplateResponse hideForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        if (form.getStatus() == FormTemplate.Status.ARCHIVED) {
            throw new RuntimeException("Biểu mẫu đã được ẩn.");
        }

        form.setStatus(FormTemplate.Status.ARCHIVED);
        FormTemplate archived = formRepo.save(form);
        try {
            auditLogService.log("Ẩn biểu mẫu", "templateId=" + archived.getTemplateId() + " title=" + archived.getTitle(), archived.getModerator());
        } catch (Exception ignored) {}
        return mapToResponse(archived);
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
        clone.setModerator(oldForm.getModerator());
        clone.setStatus(FormTemplate.Status.DRAFT);

        FormTemplate saved = formRepo.save(clone);
        try {
            auditLogService.log("Sao chép biểu mẫu để chỉnh sửa", "templateId=" + saved.getTemplateId() + " title=" + saved.getTitle(), saved.getModerator());
        } catch (Exception ignored) {}
        return mapToResponse(saved);
    }

    /**  Xóa form (không cho xóa khi đang hiển thị cho user) */
    public void deleteForm(Integer id) {
        FormTemplate form = formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biểu mẫu"));

        FormTemplate.Status status = form.getStatus();
        if (status == FormTemplate.Status.APPROVED) {
            throw new RuntimeException("Không thể xóa biểu mẫu đang hiển thị. Hãy ẩn trước.");
        }

        FormTemplate toDelete = formRepo.findById(id).orElse(null);
        formRepo.deleteById(id);
        try {
            if (toDelete != null) {
                auditLogService.log("Xóa biểu mẫu", "templateId=" + id + " title=" + toDelete.getTitle(), toDelete.getModerator());
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

        if (form.getModerator() != null) {
            dto.setModeratorName(form.getModerator().getFullName());
            dto.setModeratorEmail(form.getModerator().getEmail());
        }
        return dto;
    }
}

