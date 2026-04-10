package com.C1SE61.backend.controller.auth;

import com.C1SE61.backend.dto.common.ApiResponse;
import com.C1SE61.backend.dto.request.auth.LoginRequestDTO;
import com.C1SE61.backend.dto.response.auth.LoginResponseDTO;
import com.C1SE61.backend.dto.request.auth.RegisterRequestDTO;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.UserAccountRepository;
import com.C1SE61.backend.service.auth.AuthService;
import com.C1SE61.backend.service.log.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final UserAccountRepository userAccountRepository;
    private final AuditLogService auditLogService;

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            LoginResponseDTO response = authService.login(request);
            // Log successful login (if user entity exists)
            try {
                UserAccount user = userAccountRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier()).orElse(null);
                if (user != null) {
                    auditLogService.log("Đăng nhập", "Người dùng đăng nhập thành công", user);
                }
            } catch (Exception ignore) {}
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            LoginResponseDTO response = authService.register(request);
            // Log registration
            try {
                UserAccount user = userAccountRepository.findByEmail(request.getEmail()).orElse(null);
                if (user != null) {
                    auditLogService.log("Đăng ký", "Tạo tài khoản mới", user);
                }
            } catch (Exception ignore) {}
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // Lấy thông tin người dùng hiện tại
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Chưa đăng nhập hoặc token không hợp lệ"));
        }

        String email = authentication.getName();
        UserAccount user = userAccountRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));


        Map<String, Object> data = Map.of(
                "userId", user.getUserId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole().getRoleName() : "Unknown"
        );

        return ResponseEntity.ok(data);
    }

    // Đổi mật khẩu
    @PostMapping("/change-password/{userId}")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mật khẩu hiện tại không được để trống"));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mật khẩu mới không được để trống"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mật khẩu mới phải có ít nhất 6 ký tự"));
            }

            authService.changePassword(userId, currentPassword, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
