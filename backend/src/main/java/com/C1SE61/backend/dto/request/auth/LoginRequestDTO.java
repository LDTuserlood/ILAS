package com.C1SE61.backend.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDTO {
    private String identifier;
    private String password;
}
