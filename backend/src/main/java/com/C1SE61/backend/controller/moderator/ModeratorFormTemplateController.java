package com.C1SE61.backend.controller.moderator;

import com.C1SE61.backend.dto.request.moderator.FormTemplateRequest;
import com.C1SE61.backend.dto.response.moderator.FormTemplateResponse;
import com.C1SE61.backend.service.moderator.ModeratorFormTemplateService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Controller dành cho biên tập viên (Moderator)
 * - CRUD và xuất bản/ẩn biểu mẫu (FormTemplate)
 */
@RestController
@RequestMapping("/api/moderator/form-templates")
@CrossOrigin(origins = "*")
public class ModeratorFormTemplateController {

    private final ModeratorFormTemplateService formService;

    public ModeratorFormTemplateController(ModeratorFormTemplateService formService) {
        this.formService = formService;
    }

    /** Lấy tất cả biểu mẫu mà biên tập viên đã tạo */
    @GetMapping("/{moderatorId}")
    public ResponseEntity<List<FormTemplateResponse>> getFormsByModerator(@PathVariable Integer moderatorId) {
        return ResponseEntity.ok(formService.getByModerator(moderatorId));
    }

    /** Tạo mới một biểu mẫu */
    @PostMapping("/{moderatorId}")
    public ResponseEntity<FormTemplateResponse> createForm(
            @PathVariable Integer moderatorId,
            @RequestBody FormTemplateRequest req) {
        return ResponseEntity.ok(formService.createForm(moderatorId, req));
    }

    /** Cập nhật biểu mẫu theo ID */
    @PutMapping("/{id}")
    public ResponseEntity<FormTemplateResponse> updateForm(
            @PathVariable Integer id,
            @RequestBody FormTemplateRequest req) {
        return ResponseEntity.ok(formService.updateForm(id, req));
    }

    /** Đăng biểu mẫu để hiển thị cho user */
    @PutMapping("/{id}/publish")
    public ResponseEntity<FormTemplateResponse> publishForm(@PathVariable Integer id) {
        return ResponseEntity.ok(formService.publishForm(id));
    }

    /** Ẩn biểu mẫu khỏi user */
    @PutMapping("/{id}/hide")
    public ResponseEntity<FormTemplateResponse> hideForm(@PathVariable Integer id) {
        return ResponseEntity.ok(formService.hideForm(id));
    }

    /** Backward compatibility: submit = publish */
    @PutMapping("/{id}/submit")
    public ResponseEntity<FormTemplateResponse> submitForm(@PathVariable Integer id) {
        return ResponseEntity.ok(formService.publishForm(id));
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
    @PostMapping(value = "/{moderatorId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Integer moderatorId,
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

