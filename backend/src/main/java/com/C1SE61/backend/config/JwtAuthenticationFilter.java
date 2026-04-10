package com.C1SE61.backend.config;

import com.C1SE61.backend.repository.UserAccountRepository;
import com.C1SE61.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserAccountRepository userRepo;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserAccountRepository userRepo) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();
        String authHdr = request.getHeader("Authorization");
        System.out.println("🔵 JwtAuthenticationFilter incoming: " + method + " " + path
                + " | Authorization present: " + (authHdr != null));
        System.out.println("🟢 BYPASS CHATBOT: " + path);
        if (path.startsWith("/api/chatbot/") || path.equals("/api/chatbot")) {
            filterChain.doFilter(request, response);
            return;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("🔴 NO TOKEN: " + path);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtUtil.extractEmail(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var userOpt = userRepo.findByEmail(email);
            if (userOpt.isPresent()) {
                var user = userOpt.get();

                String roleName = user.getRole() != null ? user.getRole().getRoleName() : "User";
                // Normalize role name: convert to "Admin", "Editor", "User" format
                String normalizedRole = normalizeRoleName(roleName);
                var authorities = List.of(new SimpleGrantedAuthority(normalizedRole));

                // Use UserAccount directly as principal to maintain full user context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                request.setAttribute("userId", user.getUserId());
                request.setAttribute("role", normalizedRole);
                
                System.out.println("✅ Authenticated user: " + email + " with role: " + roleName + " -> normalized: " + normalizedRole);
                System.out.println("   Authorities: " + authorities);
            }
        }

        filterChain.doFilter(request, response);
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
}
