package com.C1SE61.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

/**
 * Entity UserAccount - đại diện cho bảng user_account trong hệ thống ILAS.
 * Dùng để xác thực, phân quyền và quản lý thông tin người dùng.
 */
@Entity
@Table(name = "user_account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;


    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = (role != null && role.getRoleName() != null)
                ? role.getRoleName()
                : "User";
        // Normalize role name to match SecurityConfig expectations
        String normalizedRole = normalizeRoleName(roleName);
        return Collections.singletonList(
                new SimpleGrantedAuthority(normalizedRole)
        );
    }
    
    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "User";
        }
        String normalized = roleName.trim();
        // Convert to title case: "ADMIN" -> "Admin", "admin" -> "Admin"
        if (normalized.length() > 0) {
            normalized = normalized.substring(0, 1).toUpperCase() + 
                        (normalized.length() > 1 ? normalized.substring(1).toLowerCase() : "");
        }
        return normalized;
    }


    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }

    public Integer getRoleId() {
        return (role != null) ? role.getRoleId() : null;
    }

    public String getRoleName() {
        return (role != null) ? role.getRoleName() : "User";
    }

    @Override
    public String toString() {
        return "UserAccount{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", role=" + getRoleName() +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                '}';
    }
}

