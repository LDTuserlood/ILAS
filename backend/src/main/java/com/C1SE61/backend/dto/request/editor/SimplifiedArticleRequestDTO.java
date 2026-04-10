package com.C1SE61.backend.dto.request.editor;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimplifiedArticleRequestDTO {
    private Integer articleId;
    private Integer editorId;
    private String category;
    private String contentSimplified;
}
