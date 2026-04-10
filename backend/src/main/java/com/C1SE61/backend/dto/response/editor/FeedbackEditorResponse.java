package com.C1SE61.backend.dto.response.editor;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEditorResponse {
    private Integer id;
    private String lawTitle;
    private String userName;
    private String content;
    private String date;
    private String status;
}
