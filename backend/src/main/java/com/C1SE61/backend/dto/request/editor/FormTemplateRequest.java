package com.C1SE61.backend.dto.request.editor;

import lombok.Data;

@Data
public class FormTemplateRequest {
    private String title;
    private String category;
    private String description;
    private String fileUrl;
}
