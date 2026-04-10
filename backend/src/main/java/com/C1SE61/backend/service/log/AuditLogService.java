package com.C1SE61.backend.service.log;

import com.C1SE61.backend.model.AuditLog;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String detail, UserAccount user) {
        if (action == null || action.isBlank()) {
            return;
        }
        String normalizedAction = action.trim();
        String normalizedDetail = detail == null ? null : detail.trim();
        AuditLog log = AuditLog.builder()
                .action(normalizedAction.length() > 150 ? normalizedAction.substring(0, 150) : normalizedAction)
                .detail(normalizedDetail)
                .user(user)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
    public List<java.util.Map<String, Object>> getRecent() {
        // Fetch a recent window then build lightweight DTOs (maps) including user info.
        List<AuditLog> recent = auditLogRepository.findTop20ByOrderByCreatedAtDesc();

        // Prefer non-login actions first; fallback to include login if needed to reach 5.
        List<java.util.Map<String, Object>> nonLogin = recent.stream()
                .filter(a -> a.getUser() != null && a.getUser().getRole() != null
                        && (Integer.valueOf(2).equals(a.getUser().getRole().getRoleId()) || Integer.valueOf(3).equals(a.getUser().getRole().getRoleId())))
                .filter(a -> {
                    String act = a.getAction() == null ? "" : a.getAction().toLowerCase();
                    return !act.contains("đăng nhập");
                })
                .map(a -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", a.getId());
                    m.put("action", a.getAction());
                    m.put("detail", a.getDetail());
                    m.put("createdAt", a.getCreatedAt() == null ? null : a.getCreatedAt().toString());
                    m.put("userId", a.getUser().getUserId());
                    m.put("username", a.getUser().getUsername());
                    m.put("fullName", a.getUser().getFullName());
                    m.put("roleId", a.getUser().getRole().getRoleId());
                    m.put("roleName", a.getUser().getRole().getRoleName());
                    return m;
                })
                .limit(5)
                .collect(Collectors.toList());

        if (nonLogin.size() >= 5) {
            return nonLogin;
        }

        // Fill with login entries if not enough
        List<java.util.Map<String, Object>> loginEntries = recent.stream()
                .filter(a -> a.getUser() != null && a.getUser().getRole() != null
                        && (Integer.valueOf(2).equals(a.getUser().getRole().getRoleId()) || Integer.valueOf(3).equals(a.getUser().getRole().getRoleId())))
                .filter(a -> {
                    String act = a.getAction() == null ? "" : a.getAction().toLowerCase();
                    return act.contains("đăng nhập");
                })
                .map(a -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", a.getId());
                    m.put("action", a.getAction());
                    m.put("detail", a.getDetail());
                    m.put("createdAt", a.getCreatedAt() == null ? null : a.getCreatedAt().toString());
                    m.put("userId", a.getUser().getUserId());
                    m.put("username", a.getUser().getUsername());
                    m.put("fullName", a.getUser().getFullName());
                    m.put("roleId", a.getUser().getRole().getRoleId());
                    m.put("roleName", a.getUser().getRole().getRoleName());
                    return m;
                })
                .collect(Collectors.toList());

        // Combine and trim to 5
        java.util.List<java.util.Map<String, Object>> combined = new java.util.ArrayList<>(nonLogin);
        for (java.util.Map<String, Object> m : loginEntries) {
            if (combined.size() >= 5) break;
            combined.add(m);
        }
        return combined;
    }
}


