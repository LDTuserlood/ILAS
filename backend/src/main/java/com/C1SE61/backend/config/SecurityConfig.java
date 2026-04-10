package com.C1SE61.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("Loading SecurityConfig - Filter chain applied!");
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/**",
                "/api/laws/**",
                "/api/articles/**",
                "/api/forms/**",
                "/api/track/**",

                "/api/editor/forms/**",
                "/api/editor/form-stats/**",
                "/api/editor/simplified/by-article/**",
                "/api/editor/feedback-stats/**",
                "/api/chatbot/admin/**",
                "/api/chatbot/**",
                "/api/ai/**",
                "/uploads/**"
            ).permitAll()

            .requestMatchers("/api/users/**").authenticated()
            .requestMatchers("/api/editor/**").hasAnyAuthority(
                "Admin", "ADMIN", "admin",
                "Editor", "editor",
                "Moderator", "MODERATOR", "moderator"
            )
            .requestMatchers("/api/admin/**").hasAnyAuthority("Admin", "ADMIN", "admin")
            .anyRequest().authenticated()
        )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .cors(cors -> {});
        // Allow framing from same-origin and from local dev frontends (for embedding during development)
        http.headers().frameOptions().sameOrigin();
        http.headers().addHeaderWriter(
                new StaticHeadersWriter("Content-Security-Policy",
                        "frame-ancestors 'self' http://localhost:3000 http://localhost:5173"));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Allow local dev origins (CRA 3000, Vite 5173, localhost/127.0.0.1)
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); 

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
