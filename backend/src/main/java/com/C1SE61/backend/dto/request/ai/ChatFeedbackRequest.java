package com.C1SE61.backend.dto.request.ai;

import lombok.Data;

@Data
public class ChatFeedbackRequest {
    private String feedbackStatus;
    private String reason;
}
