package com.C1SE61.backend.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackRequestDTO {
    
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(max = 5000, message = "Nội dung phản hồi không được vượt quá 5000 ký tự")
    private String content;
    
    private Integer lawId;
    private Integer articleId;
    private Integer userId;
    
    // Constructors
    public FeedbackRequestDTO() {
    }
    
    public FeedbackRequestDTO(String content, Integer lawId, Integer articleId, Integer userId) {
        this.content = content;
        this.lawId = lawId;
        this.articleId = articleId;
        this.userId = userId;
    }
    
    // Getters and Setters
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Integer getLawId() {
        return lawId;
    }
    
    public void setLawId(Integer lawId) {
        this.lawId = lawId;
    }
    
    public Integer getArticleId() {
        return articleId;
    }
    
    public void setArticleId(Integer articleId) {
        this.articleId = articleId;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}

