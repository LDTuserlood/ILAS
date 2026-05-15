package com.C1SE61.backend.dto.request.ai;

import lombok.Data;

@Data
public class ChatReviewRequest {
    private String reviewStatus;
    private String note;
}
