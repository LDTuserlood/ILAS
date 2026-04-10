package com.C1SE61.backend.repository;

import com.C1SE61.backend.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Integer> {

    Optional<UserAccount> findByUsername(String username);

    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Tìm kiếm theo username, email hoặc full name (không phân biệt hoa thường)
    List<UserAccount> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
            String username,
            String email,
            String fullName
    );

    // Đếm số người dùng theo trạng thái kích hoạt
    long countByIsActive(boolean isActive);

    // Đếm số người dùng theo role_id
    long countByRole_RoleId(Integer roleId);

    // Đếm/tìm người dùng theo khoảng thời gian tạo
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<UserAccount> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
