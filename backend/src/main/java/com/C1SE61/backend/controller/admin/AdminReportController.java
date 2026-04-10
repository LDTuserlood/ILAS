package com.C1SE61.backend.controller.admin;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.admin.ReportResponse;
import com.C1SE61.backend.service.admin.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(defaultValue = "all") String reportType
    ) {
        try {
            ReportResponse response = adminReportService.getReport(range, reportType);
            return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể tải báo cáo: " + e.getMessage()));
        }
    }
}


