package com.C1SE61.backend.dto.response.editor;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FormTemplateResponse {
    private Integer templateId;
    private String title;
    private String category;
    private String description;
    private String fileUrl;
    private String status;
    private String editorName;
    private String editorEmail;
    private LocalDateTime createdAt;
}
