package com.C1SE61.backend.dto.response.user;

import com.C1SE61.backend.model.Article;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDTO {

    private Integer articleId;
    private Integer lawId;
    private Integer chapterId;
    private String articleNumber;
    private String articleTitle;
    private String content;
    private String chapterTitle;
    private String lawTitle;

    public ArticleDTO(Article article) {
        if (article == null) return;

        this.articleId = article.getArticleId();
        this.articleNumber = article.getArticleNumber();
        this.articleTitle = article.getArticleTitle();
        this.content = article.getContent();

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
