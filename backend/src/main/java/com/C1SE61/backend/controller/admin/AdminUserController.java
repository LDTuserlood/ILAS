package com.C1SE61.backend.controller.admin;

import com.C1SE61.backend.dto.request.admin.CreateUserRequest;
import com.C1SE61.backend.dto.request.admin.UpdateUserRequest;
import com.C1SE61.backend.dto.response.admin.UserResponseDTO;
import com.C1SE61.backend.service.admin.AdminUserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.C1SE61.backend.service.log.AuditLogService;
import com.C1SE61.backend.model.UserAccount;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<UserResponseDTO> getUsers() {
        return adminUserService.getAllUsers();
    }

    @PostMapping
    public UserResponseDTO createUser(@RequestBody CreateUserRequest req) {
        UserResponseDTO created = adminUserService.createUser(req);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Tạo người dùng", "Tạo user: " + created.getEmail(), user);
        } catch (Exception ignore) {}
        return created;
    }

    @PutMapping("/{id}")
    public UserResponseDTO updateUser(@PathVariable Integer id, @RequestBody UpdateUserRequest req) {
        UserResponseDTO updated = adminUserService.updateUser(id, req);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Cập nhật người dùng", "Cập nhật user id=" + id, user);
        } catch (Exception ignore) {}
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        adminUserService.deleteUser(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Xóa người dùng", "Xóa user id=" + id, user);
        } catch (Exception ignore) {}
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id) {
        adminUserService.toggleStatus(id);
        try {
            UserAccount user = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserAccount ua) user = ua;
            auditLogService.log("Đổi trạng thái người dùng", "Toggle trạng thái user id=" + id, user);
        } catch (Exception ignore) {}
        return ResponseEntity.ok().build();
    }
}
