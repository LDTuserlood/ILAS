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
    private String sourceType;
    private String sourceTitle;
    private String feedbackStatus;
    private String feedbackReason;
    private String feedbackAt;
    private String reviewStatus;
    private String reviewNote;
}
