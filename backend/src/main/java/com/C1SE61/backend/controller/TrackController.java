package com.C1SE61.backend.controller;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.response.admin.TopSearchDTO;
import com.C1SE61.backend.model.PageViewLog;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.PageViewLogRepository;
import com.C1SE61.backend.service.log.SearchLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/track")
@CrossOrigin(origins = "*")
public class TrackController {

    @Autowired
    private PageViewLogRepository pageViewLogRepository;
    @Autowired
    private SearchLogService searchLogService;

    /**
     * Ghi nhận lượt xem trang (page view).
     * Chỉ đếm guest hoặc user (roleId = 3). Bỏ qua admin/editor.
     */
    @PostMapping("/page-view")
    public ResponseEntity<ApiResponse<String>> trackPageView(
            @RequestParam String path,
            HttpServletRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserAccount user = null;
            if (auth != null && auth.getPrincipal() instanceof UserAccount) {
                user = (UserAccount) auth.getPrincipal();
                if (user.getRole() != null && user.getRole().getRoleId() != null) {
                    int roleId = user.getRole().getRoleId();
                    if (roleId == 1 || roleId == 2) {
                        // admin hoặc editor: không ghi log
                        return ResponseEntity.ok(ApiResponse.success("Skipped (admin/editor)", null));
                    }
                }
            }

            String userAgent = request.getHeader("User-Agent");

            PageViewLog log = PageViewLog.builder()
                    .user(user)
                    .path(path)
                    .userAgent(userAgent)
                    .createdAt(LocalDateTime.now())
                    .build();
            pageViewLogRepository.save(log);

            return ResponseEntity.ok(ApiResponse.success("Logged", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Skipped due to error", null));
        }
    }

    /**
     * Ghi nhận keyword tìm kiếm (không yêu cầu đăng nhập).
     * Dùng transaction riêng trong service nên không ảnh hưởng tới luồng chính.
     */
    @PostMapping("/search-log")
    public ResponseEntity<ApiResponse<String>> trackSearch(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "general") String searchType) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserAccount user = null;
            if (auth != null && auth.getPrincipal() instanceof UserAccount principal) {
                user = principal;
            }

            searchLogService.logKeyword(keyword, searchType, user);
            return ResponseEntity.ok(ApiResponse.success("Logged", null));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Skipped due to error", null));
        }
    }

    /**
     * Trả về danh sách top keyword tìm kiếm (mặc định 5).
     */
    @GetMapping("/top-searches")
    public ResponseEntity<ApiResponse<List<TopSearchDTO>>> getTopSearches(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<TopSearchDTO> topSearches = searchLogService.getTopSearches(limit);
            return ResponseEntity.ok(ApiResponse.success("OK", topSearches));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success("Skipped due to error", List.of()));
        }
    }
}

