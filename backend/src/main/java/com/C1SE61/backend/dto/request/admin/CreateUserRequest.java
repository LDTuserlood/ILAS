package com.C1SE61.backend.dto.request.admin;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String fullName;
    private String email;
    private String username;
    private String password;
    private String role; 
}
