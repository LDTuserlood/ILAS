package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.user.SimplifiedArticleDTO;
import com.C1SE61.backend.model.SimplifiedArticle;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.service.editor.EditorSimplifiedManagementService;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/editor/simplified-management")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('Admin', 'ADMIN', 'Editor', 'editor', 'Moderator', 'MODERATOR', 'moderator')")
public class EditorSimplifiedManagementController {

    private final EditorSimplifiedManagementService simplifiedService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SimplifiedArticleDTO>>> list(
            @RequestParam(defaultValue = "PENDING") SimplifiedArticle.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<SimplifiedArticleDTO> data = simplifiedService.listByStatus(status, page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<SimplifiedArticleDTO>> approve(@PathVariable Integer id) {
        SimplifiedArticleDTO dto = simplifiedService.approve(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            String aTitle = dto != null ? dto.getArticleTitle() : null;
            String detail = aTitle != null && !aTitle.isBlank() ? aTitle : ("articleId=" + (dto != null ? dto.getArticleId() : "n/a"));
            auditLogService.log("Duyệt bản rút gọn", detail, user);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Approved", dto));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<SimplifiedArticleDTO>> reject(@PathVariable Integer id) {
        SimplifiedArticleDTO dto = simplifiedService.reject(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            String rTitle = dto != null ? dto.getArticleTitle() : null;
            String rdetail = rTitle != null && !rTitle.isBlank() ? rTitle : ("articleId=" + (dto != null ? dto.getArticleId() : "n/a"));
            auditLogService.log("Từ chối bản rút gọn", rdetail, user);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(ApiResponse.success("Rejected", dto));
    }
}
