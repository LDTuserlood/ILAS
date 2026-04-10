package com.C1SE61.backend.controller.user;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.user.FormTemplateDTO;
import com.C1SE61.backend.service.user.UserFormTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dành cho người dùng (User)
 * - Xem danh sách, tìm kiếm, tải và lọc các biểu mẫu (FormTemplate)
 */
@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
})
public class UserFormTemplateController {

    @Autowired
    private UserFormTemplateService formTemplateService;

    /** Lấy tất cả biểu mẫu (có phân trang) */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> getAllFormTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response = formTemplateService.getAllTemplates(page, size);
        return ResponseEntity.ok(response);
    }

    /** Tìm kiếm biểu mẫu theo từ khóa */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> searchFormTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response = formTemplateService.searchTemplates(keyword, page, size);
        return ResponseEntity.ok(response);
    }

    /** Lấy biểu mẫu theo danh mục */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> getFormTemplatesByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response = formTemplateService.getTemplatesByCategory(category, page, size);
        return ResponseEntity.ok(response);
    }

    /** Tìm kiếm biểu mẫu trong danh mục */
    @GetMapping("/category/{category}/search")
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> searchFormTemplatesByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response =
                formTemplateService.searchTemplatesByCategory(category, keyword, page, size);
        return ResponseEntity.ok(response);
    }

    /** Lấy biểu mẫu theo ID */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FormTemplateDTO>> getFormTemplateById(@PathVariable Integer id) {
        ApiResponse<FormTemplateDTO> response = formTemplateService.getTemplateById(id);
        return ResponseEntity.ok(response);
    }

    /** Lấy danh sách tất cả danh mục biểu mẫu */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getFormCategories() {
        ApiResponse<List<String>> response = formTemplateService.getAllCategories();
        return ResponseEntity.ok(response);
    }

    /** Ghi nhận lượt tải xuống (placeholder) */
    @PostMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> incrementDownloadCount(@PathVariable Integer id) {
        ApiResponse<String> response = formTemplateService.incrementDownloadCount(id);
        return ResponseEntity.ok(response);
    }

    /** Lấy danh sách biểu mẫu phổ biến nhất */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> getMostDownloadedTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response = formTemplateService.getMostDownloadedTemplates(page, size);
        return ResponseEntity.ok(response);
    }

    /** Lấy danh sách biểu mẫu mới nhất */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<Page<FormTemplateDTO>>> getRecentTemplates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ApiResponse<Page<FormTemplateDTO>> response = formTemplateService.getRecentTemplates(page, size);
        return ResponseEntity.ok(response);
    }
}
