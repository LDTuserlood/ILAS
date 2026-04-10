package com.C1SE61.backend.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatbotLogAdminDTO {
    private Integer id;
    private String user;
    private String question;
    private String answer;
    private String timestamp;
    private String status;
}
