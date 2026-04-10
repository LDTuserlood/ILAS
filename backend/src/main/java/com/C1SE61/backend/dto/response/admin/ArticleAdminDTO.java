package com.C1SE61.backend.dto.response.admin;

import com.C1SE61.backend.model.Article;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleAdminDTO {
    private Integer articleId;
    private Integer lawId;
    private Integer chapterId;
    private String lawTitle;
    private String chapterTitle;
    private String articleNumber;
    private String articleTitle;
    private String content;
    private String status;

    public ArticleAdminDTO(Article article) {
        if (article == null) return;
        this.articleId = article.getArticleId();
        this.articleNumber = article.getArticleNumber();
        this.articleTitle = article.getArticleTitle();
        this.content = article.getContent();
        this.status = article.getStatus();

        if (article.getLaw() != null) {
            this.lawId = article.getLaw().getLawId();
            this.lawTitle = article.getLaw().getTitle();
        }
        if (article.getChapter() != null) {
            this.chapterId = article.getChapter().getChapterId();
            this.chapterTitle = article.getChapter().getChapterTitle();
        }
    }
}

