package com.C1SE61.backend.dto.response.editor;

import com.C1SE61.backend.model.SimplifiedArticle;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimplifiedArticleResponseDTO {

    private Integer id;
    private Integer articleId;
    private Integer editorId;
    private String articleTitle;
    private String editorName;
    private String category;
    private String contentSimplified;
    private String status;
    private LocalDateTime createdAt;

    public static SimplifiedArticleResponseDTO fromEntity(SimplifiedArticle sa) {
        return SimplifiedArticleResponseDTO.builder()
                .id(sa.getId())
                .articleId(sa.getArticle().getArticleId())
                .editorId(sa.getEditor().getUserId())
                .articleTitle(sa.getArticle().getArticleTitle())
                .editorName(sa.getEditor().getFullName())
                .category(sa.getCategory())
                .contentSimplified(sa.getContentSimplified())
                .status(sa.getStatus().name())
                .createdAt(sa.getCreatedAt())
                .build();
    }
}
