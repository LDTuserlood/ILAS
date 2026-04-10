package com.C1SE61.backend.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDTO {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phone;
}
