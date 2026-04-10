package com.C1SE61.backend.dto.response.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminFeedbackResponseDTO {

    private Integer id;
    private String user;
    private String email;
    private String content;
    private String status; 
    private LocalDateTime createdAt;
}
