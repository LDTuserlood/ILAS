package com.C1SE61.backend.dto.response.user;

import com.C1SE61.backend.model.SimplifiedArticle;
import java.time.LocalDateTime;

public class SimplifiedArticleDTO {

    private Integer id;
    private Integer articleId;
    private String articleTitle;
    private Integer editorId;
    private String editorName;
    private String category;
    private String contentSimplified;
    private String status;
    private LocalDateTime createdAt;

    // ===== Constructors =====
    public SimplifiedArticleDTO() {}

    public SimplifiedArticleDTO(SimplifiedArticle simplifiedArticle) {
        if (simplifiedArticle == null) return;

        this.id = simplifiedArticle.getId();
        this.category = simplifiedArticle.getCategory();
        this.contentSimplified = simplifiedArticle.getContentSimplified();
        this.status = simplifiedArticle.getStatus() != null
                ? simplifiedArticle.getStatus().name()
                : null;
        this.createdAt = simplifiedArticle.getCreatedAt();

        // Mapping Article safely
        if (simplifiedArticle.getArticle() != null) {
            this.articleId = simplifiedArticle.getArticle().getArticleId();
            this.articleTitle = simplifiedArticle.getArticle().getArticleTitle();
        }

        // Mapping Editor safely
        if (simplifiedArticle.getEditor() != null) {
            this.editorId = simplifiedArticle.getEditor().getUserId();
            this.editorName = simplifiedArticle.getEditor().getFullName();
        }
    }

    // ===== Getters & Setters =====
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getArticleId() {
        return articleId;
    }

    public void setArticleId(Integer articleId) {
        this.articleId = articleId;
    }

    public String getArticleTitle() {
        return articleTitle;
    }

    public void setArticleTitle(String articleTitle) {
        this.articleTitle = articleTitle;
    }

    public Integer getEditorId() {
        return editorId;
    }

    public void setEditorId(Integer editorId) {
        this.editorId = editorId;
    }

    public String getEditorName() {
        return editorName;
    }

    public void setEditorName(String editorName) {
        this.editorName = editorName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContentSimplified() {
        return contentSimplified;
    }

    public void setContentSimplified(String contentSimplified) {
        this.contentSimplified = contentSimplified;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ===== Utility =====
    @Override
    public String toString() {
        return "SimplifiedArticleDTO{" +
                "id=" + id +
                ", articleId=" + articleId +
                ", editorId=" + editorId +
                ", editorName='" + editorName + '\'' +
                ", category='" + category + '\'' +
                ", contentSimplified='" + contentSimplified + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
