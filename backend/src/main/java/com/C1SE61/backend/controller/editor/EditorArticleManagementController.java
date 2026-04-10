package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.admin.ArticleAdminDTO;
import com.C1SE61.backend.service.editor.EditorArticleManagementService;
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
@RequestMapping("/api/editor/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('Admin', 'ADMIN', 'Editor', 'editor', 'Moderator', 'MODERATOR', 'moderator')")
public class EditorArticleManagementController {

    private final EditorArticleManagementService articleManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleAdminDTO>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer lawId,
            @RequestParam(required = false) Integer chapterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ArticleAdminDTO> data = articleManagementService.list(keyword, lawId, chapterId, page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", data));
    }
}
