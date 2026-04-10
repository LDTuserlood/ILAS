package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.admin.ChapterAdminDTO;
import com.C1SE61.backend.service.editor.EditorChapterManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/editor/chapters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('Admin', 'ADMIN', 'Editor', 'editor', 'Moderator', 'MODERATOR', 'moderator')")
public class EditorChapterManagementController {

    private final EditorChapterManagementService chapterManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ChapterAdminDTO>>> list(
            @RequestParam(required = false) Integer lawId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ChapterAdminDTO> data = chapterManagementService.list(lawId, page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }
}
