package com.C1SE61.backend.service.user;

import com.C1SE61.backend.dto.request.user.UserAccountRequest;
import com.C1SE61.backend.dto.response.user.UserAccountResponse;
import com.C1SE61.backend.model.Role;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.RoleRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserAccountService {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Lấy thông tin user theo ID
     */
    public Optional<UserAccountResponse> getUserById(Integer userId) {
        Optional<UserAccount> accountOpt = userAccountRepository.findById(userId);
        return accountOpt.map(this::convertToResponse);
    }

    /**
     * Lấy tất cả người dùng
     */
    public List<UserAccountResponse> getAllUsers() {
        List<UserAccount> users = userAccountRepository.findAll();
        return users.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /**
     * Tạo tài khoản mới (Admin)
     */
    public UserAccountResponse createAccount(UserAccountRequest request) {
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        UserAccount account = new UserAccount();
        account.setUsername(request.getUsername());
        account.setEmail(request.getEmail());
        account.setFullName(request.getFullName());
        account.setPhone(request.getPhone());
        account.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        account.setCreatedAt(LocalDateTime.now());

        // Gán role nếu có
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền"));
            account.setRole(role);
        }

        UserAccount saved = userAccountRepository.save(account);
        return convertToResponse(saved);
    }

    /**
     * Cập nhật thông tin tài khoản
     */
    public UserAccountResponse updateAccount(Integer userId, UserAccountRequest request) {
        UserAccount account = userAccountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null) account.setFullName(request.getFullName());
        if (request.getPhone() != null) account.setPhone(request.getPhone());
        if (request.getIsActive() != null) account.setIsActive(request.getIsActive());

        if (request.getEmail() != null && !request.getEmail().equals(account.getEmail())) {
            if (userAccountRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã tồn tại");
            }
            account.setEmail(request.getEmail());
        }

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền"));
            account.setRole(role);
        }

        return convertToResponse(userAccountRepository.save(account));
    }

    /**
     * Xóa tài khoản
     */
    public boolean deleteAccount(Integer userId) {
        Optional<UserAccount> accountOpt = userAccountRepository.findById(userId);
        if (accountOpt.isPresent()) {
            userAccountRepository.delete(accountOpt.get());
            return true;
        }
        return false;
    }

    /**
     * Kiểm tra email tồn tại
     */
    public boolean isEmailExists(String email) {
        return userAccountRepository.existsByEmail(email);
    }

    /**
     * Kiểm tra username tồn tại
     */
    public boolean isUsernameExists(String username) {
        return userAccountRepository.existsByUsername(username);
    }

    /**
     * Convert Entity → DTO
     */
    private UserAccountResponse convertToResponse(UserAccount user) {
        UserAccountResponse dto = new UserAccountResponse();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getRoleId());
            dto.setRoleName(user.getRole().getRoleName());
        }
        return dto;
    }
}
