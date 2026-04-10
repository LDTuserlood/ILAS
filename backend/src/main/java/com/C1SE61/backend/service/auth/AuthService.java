package com.C1SE61.backend.service.auth;

import com.C1SE61.backend.dto.request.auth.LoginRequestDTO;
import com.C1SE61.backend.dto.request.auth.RegisterRequestDTO;
import com.C1SE61.backend.dto.response.auth.LoginResponseDTO;
import com.C1SE61.backend.model.Role;
import com.C1SE61.backend.model.UserAccount;
import com.C1SE61.backend.repository.RoleRepository;
import com.C1SE61.backend.repository.UserAccountRepository;
import com.C1SE61.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ---------------------- LOGIN ----------------------
    public LoginResponseDTO login(LoginRequestDTO request) {
        String identifier = request.getIdentifier();

        UserAccount user = userRepo.findByEmail(identifier)
                .or(() -> userRepo.findByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu không đúng");
        }

        Role role = user.getRole();
        Integer roleId = (role != null) ? role.getRoleId() : 3;
        String roleName = (role != null) ? role.getRoleName() : "User";

        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), roleId, roleName);

        // Trả về đầy đủ thông tin
        return new LoginResponseDTO(
            token,
            user.getUserId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            roleId,
            roleName
        );
    }



    // ---------------------- REGISTER ----------------------
    public LoginResponseDTO register(RegisterRequestDTO request) {
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (userRepo.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        Role userRole = roleRepo.findById(3)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role User"));

        UserAccount user = new UserAccount();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        user.setRole(userRole);

        userRepo.save(user);

        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(),
                                             userRole.getRoleId(), userRole.getRoleName());

        return new LoginResponseDTO(
            token,
            user.getUserId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            userRole.getRoleId(),
            userRole.getRoleName()
        );
    }

    // ---------------------- CHANGE PASSWORD ----------------------
    public void changePassword(Integer userId, String currentPassword, String newPassword) {
        UserAccount user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        if (currentPassword.equals(newPassword)) {
            throw new RuntimeException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
