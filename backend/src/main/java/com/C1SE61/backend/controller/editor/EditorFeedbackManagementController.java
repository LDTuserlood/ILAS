package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.response.admin.AdminFeedbackResponseDTO;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.service.editor.EditorFeedbackManagementService;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editor/feedback")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasAnyAuthority('Admin', 'ADMIN', 'Editor', 'editor', 'Moderator', 'MODERATOR', 'moderator')")
public class EditorFeedbackManagementController {

    private final EditorFeedbackManagementService feedbackService;
    private final AuditLogService auditLogService;

    private boolean canViewAdminTargetedFeedback(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "Admin".equalsIgnoreCase(a.getAuthority()));
    }

    @GetMapping
    public List<AdminFeedbackResponseDTO> getAll(Authentication authentication) {
        return feedbackService.getAll(canViewAdminTargetedFeedback(authentication));
    }

    @GetMapping("/status/{status}")
    public List<AdminFeedbackResponseDTO> getByStatus(@PathVariable String status, Authentication authentication) {
        return feedbackService.getByStatus(status, canViewAdminTargetedFeedback(authentication));
    }

    @PostMapping("/{id}/forward")
    public AdminFeedbackResponseDTO forward(@PathVariable Integer id) {
        AdminFeedbackResponseDTO dto = feedbackService.forward(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Chuyển tiếp phản hồi", "feedbackId=" + id, user);
        } catch (Exception ignored) {}
        return dto;
    }

    @PostMapping("/{id}/resolve")
    public AdminFeedbackResponseDTO resolve(@PathVariable Integer id) {
        AdminFeedbackResponseDTO dto = feedbackService.resolve(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Giải quyết phản hồi", "feedbackId=" + id, user);
        } catch (Exception ignored) {}
        return dto;
    }

    @DeleteMapping("/{id}")
    public void deleteFeedback(@PathVariable Integer id) {
        feedbackService.delete(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Xóa phản hồi", "feedbackId=" + id, user);
        } catch (Exception ignored) {}
    }
}
