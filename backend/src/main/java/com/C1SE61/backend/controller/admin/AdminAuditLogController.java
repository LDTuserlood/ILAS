package com.C1SE61.backend.controller.admin;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentAuditLogs() {
        try {
            List<Map<String, Object>> logs = auditLogService.getRecent();
            return ResponseEntity.ok(ApiResponse.success("Lấy audit log thành công", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể lấy audit log: " + e.getMessage()));
        }
    }
}
