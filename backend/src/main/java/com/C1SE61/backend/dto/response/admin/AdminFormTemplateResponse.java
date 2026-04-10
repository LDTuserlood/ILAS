package com.C1SE61.backend.dto.response.admin;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminFormTemplateResponse {
    private Integer id;
    private String name;
    private String category;
    private String uploadDate;
    private String status;
    private String fileUrl;
}
