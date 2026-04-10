package com.C1SE61.backend.dto.response.user;

import com.C1SE61.backend.model.Feedback;
import java.time.LocalDateTime;

public class FeedbackDTO {
    
    private Integer feedbackId;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private Integer userId;
    private String userName;
    private Integer lawId;
    private String lawTitle;
    private Integer articleId;
    private String articleTitle;
    
    // Constructors
    public FeedbackDTO() {
    }
    
    public FeedbackDTO(Feedback feedback) {
        this.feedbackId = feedback.getFeedbackId();
        this.content = feedback.getContent();
        this.status = feedback.getStatus() != null ? feedback.getStatus().name() : null;
        this.createdAt = feedback.getCreatedAt();
        
        if (feedback.getUser() != null) {
            this.userId = feedback.getUser().getUserId();
            this.userName = feedback.getUser().getFullName() != null 
                ? feedback.getUser().getFullName() 
                : feedback.getUser().getUsername();
        }
        
        if (feedback.getLaw() != null) {
            this.lawId = feedback.getLaw().getLawId();
            this.lawTitle = feedback.getLaw().getTitle();
        }
        
        if (feedback.getArticle() != null) {
            this.articleId = feedback.getArticle().getArticleId();
            this.articleTitle = feedback.getArticle().getArticleTitle();
        }
    }
    
    // Getters and Setters
    public Integer getFeedbackId() {
        return feedbackId;
    }
    
    public void setFeedbackId(Integer feedbackId) {
        this.feedbackId = feedbackId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
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
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public Integer getLawId() {
        return lawId;
    }
    
    public void setLawId(Integer lawId) {
        this.lawId = lawId;
    }
    
    public String getLawTitle() {
        return lawTitle;
    }
    
    public void setLawTitle(String lawTitle) {
        this.lawTitle = lawTitle;
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
}

