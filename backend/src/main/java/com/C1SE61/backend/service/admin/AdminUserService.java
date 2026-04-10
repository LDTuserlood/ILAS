package com.C1SE61.backend.service.admin;

import com.C1SE61.backend.dto.request.admin.CreateUserRequest;
import com.C1SE61.backend.dto.request.admin.UpdateUserRequest;
import com.C1SE61.backend.dto.response.admin.UserResponseDTO;
import com.C1SE61.backend.model.Role;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.RoleRepository;
import com.C1SE61.backend.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserAccountRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponseDTO> getAllUsers() {
        return userRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO createUser(CreateUserRequest req) {

        Role role = roleRepo.findByRoleName(req.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        UserAccount user = UserAccount.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .username(req.getUsername())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .isActive(true)
                .build();

        return toDTO(userRepo.save(user));
    }

    public UserResponseDTO updateUser(Integer id, UpdateUserRequest req) {
        UserAccount user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());

        Role role = roleRepo.findByRoleName(req.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);

        return toDTO(userRepo.save(user));
    }

    public void deleteUser(Integer id) {
        userRepo.deleteById(id);
    }

    public void toggleStatus(Integer id) {
        UserAccount user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(!user.getIsActive());
        userRepo.save(user);
    }

    private UserResponseDTO toDTO(UserAccount user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRoleName());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
