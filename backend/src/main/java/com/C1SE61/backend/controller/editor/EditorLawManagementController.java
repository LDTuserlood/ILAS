package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.request.admin.AdminLawRequest;
import com.C1SE61.backend.dto.response.user.LawDTO;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.service.editor.EditorLawManagementService;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/editor/laws")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('Admin', 'ADMIN', 'Editor', 'editor', 'Moderator', 'MODERATOR', 'moderator')")
public class EditorLawManagementController {

    private final EditorLawManagementService lawManagementService;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LawDTO>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Page<LawDTO> data = lawManagementService.list(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LawDTO>> create(@RequestBody AdminLawRequest req) {
        LawDTO created = lawManagementService.create(req);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Tạo văn bản pháp luật", "Tạo luật: " + (created != null ? created.getTitle() : "n/a"), user);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(ApiResponse.success("Created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LawDTO>> update(@PathVariable Integer id, @RequestBody AdminLawRequest req) {
        LawDTO updated = lawManagementService.update(id, req);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Cập nhật văn bản pháp luật", "Cập nhật luật id=" + id + " title=" + (updated != null ? updated.getTitle() : "n/a"), user);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(ApiResponse.success("Updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        lawManagementService.delete(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Xóa văn bản pháp luật", "Xóa luật id=" + id, user);
        } catch (Exception ignore) {}
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}
