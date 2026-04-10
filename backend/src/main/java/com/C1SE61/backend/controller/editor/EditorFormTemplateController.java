package com.C1SE61.backend.controller.editor;

import com.C1SE61.backend.dto.request.editor.FormTemplateRequest;
import com.C1SE61.backend.dto.response.editor.FormTemplateResponse;
import com.C1SE61.backend.service.editor.EditorFormTemplateService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Controller dành cho biên tập viên (Editor)
 * - CRUD và gửi duyệt biểu mẫu (FormTemplate)
 */
@RestController
@RequestMapping("/api/editor/form-templates")
@CrossOrigin(origins = "*")
public class EditorFormTemplateController {

    private final EditorFormTemplateService formService;

    public EditorFormTemplateController(EditorFormTemplateService formService) {
        this.formService = formService;
    }

    /** Lấy tất cả biểu mẫu mà biên tập viên đã tạo */
    @GetMapping("/{editorId}")
    public ResponseEntity<List<FormTemplateResponse>> getFormsByEditor(@PathVariable Integer editorId) {
        return ResponseEntity.ok(formService.getByEditor(editorId));
    }

    /** Tạo mới một biểu mẫu */
    @PostMapping("/{editorId}")
    public ResponseEntity<FormTemplateResponse> createForm(
            @PathVariable Integer editorId,
            @RequestBody FormTemplateRequest req) {
        return ResponseEntity.ok(formService.createForm(editorId, req));
    }

    /** Cập nhật biểu mẫu theo ID */
    @PutMapping("/{id}")
    public ResponseEntity<FormTemplateResponse> updateForm(
            @PathVariable Integer id,
            @RequestBody FormTemplateRequest req) {
        return ResponseEntity.ok(formService.updateForm(id, req));
    }

    /** Gửi biểu mẫu để chờ duyệt */
    @PutMapping("/{id}/submit")
    public ResponseEntity<FormTemplateResponse> submitForm(@PathVariable Integer id) {
        return ResponseEntity.ok(formService.submitForm(id));
    }

    /** Tạo bản sao (clone) từ biểu mẫu đã duyệt để chỉnh sửa */
    @PostMapping("/{id}/clone")
    public ResponseEntity<FormTemplateResponse> cloneForm(@PathVariable Integer id) {
        return ResponseEntity.ok(formService.cloneForEdit(id));
    }

    /** Xóa biểu mẫu */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Integer id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }

    /** Upload file đính kèm (form mẫu) */
    @PostMapping(value = "/{editorId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Integer editorId,
            @RequestParam("file") MultipartFile file) {
        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            return ResponseEntity.ok(Map.of("fileUrl", fileUrl));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể upload file: " + e.getMessage()));
        }
    }
}
