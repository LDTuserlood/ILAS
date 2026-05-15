package com.C1SE61.backend.dto.response.ai;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatHistoryDTO {
    private Integer chatId;
    private String conversationId;
    private String question;
    private String answer;
    private String createdAt;
    private String feedbackStatus;
    private String feedbackReason;

    public ChatHistoryDTO(String conversationId, String question, String answer, String createdAt) {
        this.conversationId = conversationId;
        this.question = question;
        this.answer = answer;
        this.createdAt = createdAt;
    }
}
